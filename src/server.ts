import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 API démarrée sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
