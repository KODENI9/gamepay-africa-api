import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { clerkAuth } from "./modules/auth/auth.middleware";
import { apiRouter } from "./routes";
import { errorHandler } from "./shared/errors/errorHandler.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json());
  app.use(clerkAuth);

  app.use("/api/v1", apiRouter);

  // Doit rester le dernier middleware.
  app.use(errorHandler);

  return app;
}
