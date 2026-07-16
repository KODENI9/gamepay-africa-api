import { env } from "../../../config/env";
import { moogoldClient } from "./moogold.client";
import type { DeliverParams, DeliverResult, DeliveryProvider } from "./provider.interface";

/**
 * Fournisseur MooGold. Comme MoneyFusion pour les paiements, MooGold est
 * ASYNCHRONE : create_order confirme juste que la commande est acceptée,
 * pas qu'elle est livrée. La confirmation réelle ("completed"/"refunded")
 * arrive plus tard via leur callback (voir delivery.controller.ts).
 *
 * On renvoie donc "manual_pending" après un create_order réussi — la
 * commande reste "processing" jusqu'à ce que le webhook MooGold la finalise.
 * C'est le même mécanisme que pour une finalisation manuelle par l'admin,
 * juste déclenché automatiquement par MooGold au lieu d'un humain.
 */
export const moogoldProvider: DeliveryProvider = {
  name: "moogold",

  async checkAvailability(): Promise<boolean> {
    if (!env.MOOGOLD_PARTNER_ID || !env.MOOGOLD_SECRET_KEY) {
      return false;
    }
    try {
      const balance = await moogoldClient.getBalance();
      return Number(balance.balance) > 0;
    } catch {
      return false;
    }
  },

  async deliver(params: DeliverParams): Promise<DeliverResult> {
    try {
      const result = await moogoldClient.createOrder({
        productId: params.productSku,
        playerId: params.playerId,
        server: params.playerIdExtra?.server,
        partnerOrderId: params.orderId,
      });

      const succeeded = result.status === true || result.status === "true";
      if (!succeeded) {
        return { outcome: "failed", rawResponse: result };
      }

      return {
        outcome: "manual_pending",
        externalTransactionId: result.account_details?.order_id,
        rawResponse: result,
      };
    } catch (err) {
      return {
        outcome: "failed",
        rawResponse: { error: err instanceof Error ? err.message : String(err) },
      };
    }
  },
};