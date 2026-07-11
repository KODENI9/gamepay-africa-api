import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";
import { logger } from "../logger/logger";

/**
 * Middleware d'erreur unique de l'application. Doit être branché en dernier
 * dans app.ts, après toutes les routes.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(err.message, { stack: err.stack });
    }
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details ?? undefined,
      },
    });
    return;
  }

  const error = err instanceof Error ? err : new Error("Erreur inconnue");
  logger.error(error.message, { stack: error.stack, path: req.path });

  res.status(500).json({
    error: {
      message: "Une erreur interne est survenue",
    },
  });
}
