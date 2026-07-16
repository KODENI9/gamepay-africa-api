import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { playersService } from "./players.service";
import { validatePlayerSchema } from "./players.validation";

export const playersController = {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = validatePlayerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const result = await playersService.validatePlayer(parsed.data);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};