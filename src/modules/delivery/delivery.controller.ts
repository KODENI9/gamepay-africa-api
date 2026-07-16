import type { Request, Response } from "express";
import { logger } from "../../shared/logger/logger";
import { ordersRepository } from "../orders/orders.repository";
import { ordersService } from "../orders/orders.service";

interface MoogoldCallbackPayload {
  status: string;
  message?: string;
  order_id: string | number;
  total?: string;
  account_details?: unknown;
}

function mapMoogoldStatus(status: string): "delivered" | "refunded" | "failed" {
  const normalized = status.toLowerCase();
  if (normalized.includes("complet")) return "delivered";
  if (normalized.includes("refund") || normalized.includes("remb")) return "refunded";
  return "failed"; // ex: "incorrect information" / tout autre statut terminal
}

export const deliveryController = {
  /**
   * Endpoint public appelé par MooGold quand une commande passée via leur
   * API atteint un statut terminal (completed/refunded/informations
   * incorrectes). Pas d'authentification ici : MooGold n'a pas de token
   * Clerk. On répond toujours 200 rapidement, comme pour le webhook
   * MoneyFusion — sinon MooGold réessaie jusqu'à 100 fois.
   */
  async moogoldWebhook(req: Request, res: Response) {
    const payload = req.body as MoogoldCallbackPayload;

    if (!payload?.order_id || !payload?.status) {
      logger.warn("Webhook MooGold malformé, ignoré", { body: req.body });
      res.status(200).json({ received: true });
      return;
    }

    try {
      const order = await ordersRepository.findByProviderOrderId(String(payload.order_id));
      if (!order) {
        logger.warn("Webhook MooGold reçu pour un order_id inconnu", {
          orderId: payload.order_id,
        });
        res.status(200).json({ received: true });
        return;
      }

      // Idempotence : une commande déjà finalisée ignore les notifications
      // suivantes (MooGold peut renvoyer plusieurs fois le même événement).
      if (order.status !== "processing") {
        res.status(200).json({ received: true });
        return;
      }

      const newStatus = mapMoogoldStatus(payload.status);
      await ordersRepository.addDeliveryAttempt(order.id, {
        provider: "moogold",
        status: newStatus === "delivered" ? "success" : "failed",
        response: payload,
      });
      await ordersService.transitionStatus(order.id, newStatus);
    } catch (err) {
      logger.error("Erreur lors du traitement du webhook MooGold", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    res.status(200).json({ received: true });
  },
};