import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";
import { logger } from "../../shared/logger/logger";

export const DELIVERY_QUEUE_NAME = "delivery";

export const deliveryQueue = new Queue(DELIVERY_QUEUE_NAME, {
  connection: redisConnection,
});

export interface DeliveryJobData {
  orderId: string;
}

/**
 * Ajoute une commande payée à la file de livraison. Appelé depuis
 * payments.service.ts juste après avoir marqué la commande "paid" —
 * jamais de traitement de livraison synchrone dans la requête HTTP.
 */

logger.info("=== AVANT enqueueDelivery ===");

export async function enqueueDelivery(orderId: string): Promise<void> {
  console.log("Ajout du job :", orderId);
  await deliveryQueue.add(
    "process-order",
    { orderId } satisfies DeliveryJobData,
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  // eslint-disable-next-line no-console
  console.log(`Job de livraison ajouté à la queue pour la commande ${orderId}`);
}

logger.info("=== APRES enqueueDelivery ===");