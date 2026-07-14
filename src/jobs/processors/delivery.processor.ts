import { Worker, type Job } from "bullmq";
import { redisConnection } from "../../config/redis";
import { logger } from "../../shared/logger/logger";
import { deliveryEngine } from "../../modules/delivery/delivery.engine";
import {
  DELIVERY_QUEUE_NAME,
  type DeliveryJobData,
} from "../../modules/delivery/delivery.queue";

export const deliveryWorker = new Worker(
  DELIVERY_QUEUE_NAME,
  async (job: Job<DeliveryJobData>) => {
    await deliveryEngine.processOrder(job.data.orderId);
  },
  { connection: redisConnection }
);

deliveryWorker.on("ready", () => {
  logger.info("✅ Worker BullMQ prêt et connecté à Redis (queue: delivery)");
});

deliveryWorker.on("error", (err) => {
  logger.error("❌ Erreur de connexion du worker BullMQ", { error: err.message });
});

deliveryWorker.on("completed", (job) => {
  logger.info("Job de livraison terminé", { jobId: job.id, orderId: job.data.orderId });
});

deliveryWorker.on("failed", (job, err) => {
  logger.error("Job de livraison échoué", {
    jobId: job?.id,
    orderId: job?.data?.orderId,
    error: err.message,
  });
});