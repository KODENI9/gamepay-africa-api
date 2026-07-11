import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger/logger";

// Démarre le worker BullMQ (queue "delivery") DANS ce même process, plutôt
// que dans un service séparé. Ça évite un Background Worker Render payant :
// une requête entrante (ex: le webhook MoneyFusion) réveille de toute façon
// le service, et le worker intégré traite alors les jobs immédiatement après.
// À séparer en vrai process dédié plus tard si le volume l'exige (voir
// jobs/worker.ts, toujours disponible pour ce cas).
import "./jobs/processors/delivery.processor";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 API démarrée sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
});