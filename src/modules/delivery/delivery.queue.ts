import { Queue } from "bullmq";
import { redisConnection } from "../../config/redis";

export const DELIVERY_QUEUE_NAME = "delivery";

export const deliveryQueue = new Queue(DELIVERY_QUEUE_NAME, {
  connection: redisConnection,
});

export interface DeliveryJobData {
  orderId: string;
}

export async function enqueueDelivery(orderId: string): Promise<void> {
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
}