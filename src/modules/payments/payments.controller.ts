import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { logger } from "../../shared/logger/logger";
import { initiatePaymentSchema, moneyFusionWebhookSchema } from "./payments.validation";
import { paymentsService } from "./payments.service";

export const paymentsController = {
  async initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getAuth(req);
      if (!userId) throw AppError.unauthorized("Authentification requise");

      const parsed = initiatePaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }

      const result = await paymentsService.initiatePayment(userId, parsed.data);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async webhook(req: Request, res: Response) {
    const parsed = moneyFusionWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn("Webhook MoneyFusion malformé, ignoré", { body: req.body });
      res.status(200).json({ received: true });
      return;
    }

    try {
      await paymentsService.handleWebhook(parsed.data);
    } catch (err) {
      logger.error("Erreur lors du traitement du webhook MoneyFusion", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    res.status(200).json({ received: true });
  },
};