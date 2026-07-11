import { AppError } from "../../shared/errors/AppError";
import { logger } from "../../shared/logger/logger";
import { ordersRepository } from "../orders/orders.repository";
import { ordersService } from "../orders/orders.service";
import { productsRepository } from "../products/products.repository";
import { moneyFusionClient } from "./moneyfusion.client";
import { paymentsRepository } from "./payments.repository";
import { enqueueDelivery } from "../delivery/delivery.queue";
import type { Payment } from "./payments.types";
import type { InitiatePaymentDTO, MoneyFusionWebhookDTO } from "./payments.validation";

export const paymentsService = {
  async initiatePayment(
    userId: string,
    input: InitiatePaymentDTO
  ): Promise<{ paymentUrl: string; payment: Payment }> {
    const order = await ordersRepository.findById(input.orderId);
    if (!order) throw AppError.notFound("Commande introuvable");
    if (order.userId !== userId) {
      throw AppError.forbidden("Vous n'avez pas accès à cette commande");
    }
    if (order.status !== "pending") {
      throw AppError.conflict(`Cette commande n'est plus payable (statut actuel : "${order.status}")`);
    }

    const existingPayment = await paymentsRepository.findByOrderId(order.id);
    if (existingPayment && existingPayment.status === "pending") {
      return { paymentUrl: existingPayment.paymentUrl, payment: existingPayment };
    }

    const product = await productsRepository.findById(order.productId);
    if (!product) throw AppError.notFound("Produit associé à la commande introuvable");

    const result = await moneyFusionClient.initiatePayment({
      totalPrice: order.price,
      articleName: product.name,
      orderId: order.id,
      numeroSend: input.numeroSend,
      nomclient: input.nomclient,
    });

    if (!result.statut) {
      throw AppError.internal(`MoneyFusion a refusé la demande de paiement : ${result.message}`);
    }

    const payment = await paymentsRepository.create({
      orderId: order.id,
      provider: "moneyfusion",
      tokenPay: result.token,
      paymentUrl: result.url,
      amount: order.price,
      currency: order.currency,
    });

    await ordersRepository.attachPayment(order.id, payment.id);

    return { paymentUrl: result.url, payment };
  },

  async handleWebhook(webhookPayload: MoneyFusionWebhookDTO): Promise<void> {
    const payment = await paymentsRepository.findByTokenPay(webhookPayload.tokenPay);
    if (!payment) {
      logger.warn("Webhook MoneyFusion reçu pour un tokenPay inconnu", {
        tokenPay: webhookPayload.tokenPay,
      });
      return;
    }

    if (payment.status !== "pending") {
      return;
    }

    const verification = await moneyFusionClient.checkPaymentStatus(payment.tokenPay);
    const realStatus = verification.data.statut;

    if (realStatus === "paid") {
      await paymentsRepository.updateStatus(payment.id, "paid", {
        externalTransactionId: verification.data.numeroTransaction,
        rawWebhookPayload: webhookPayload,
      });
      await ordersService.transitionStatus(payment.orderId, "paid");
    } else if (realStatus === "failure" || realStatus === "no paid") {
      await paymentsRepository.updateStatus(payment.id, "failed", {
        rawWebhookPayload: webhookPayload,
      });
      await ordersService.transitionStatus(payment.orderId, "failed");
      await enqueueDelivery(payment.orderId);
    }
  },
};