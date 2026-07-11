import { logger } from "../../shared/logger/logger";
import { ordersRepository } from "../orders/orders.repository";
import { ordersService } from "../orders/orders.service";
import { productsRepository } from "../products/products.repository";
import { selectProvider } from "./delivery.selector";

export const deliveryEngine = {
  async processOrder(orderId: string): Promise<void> {
    const order = await ordersRepository.findById(orderId);
    if (!order) {
      logger.error("Delivery Engine : commande introuvable", { orderId });
      return;
    }

    if (order.status !== "paid") {
      logger.warn("Delivery Engine : commande dans un état non livrable, ignorée", {
        orderId,
        status: order.status,
      });
      return;
    }

    await ordersService.transitionStatus(orderId, "processing");

    const product = await productsRepository.findById(order.productId);
    if (!product) {
      logger.error("Delivery Engine : produit introuvable pour la commande", { orderId });
      await ordersService.transitionStatus(orderId, "failed");
      return;
    }

    const provider = await selectProvider();

    const result = await provider.deliver({
      productSku: product.providerMapping[provider.name] ?? product.id,
      playerId: order.playerId,
      playerIdExtra: order.playerIdExtra,
    });

    await ordersRepository.addDeliveryAttempt(orderId, {
      provider: provider.name,
      status: result.outcome === "success" ? "success" : "failed",
      response: result.rawResponse,
    });

    if (result.outcome === "success") {
      await ordersService.transitionStatus(orderId, "delivered");
    } else if (result.outcome === "failed") {
      await ordersService.transitionStatus(orderId, "failed");
    }
    // "manual_pending" : reste "processing", en attente de finalisation manuelle.
  },
};