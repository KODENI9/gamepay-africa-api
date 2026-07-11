import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { getParam } from "../../shared/utils/getParam";
import { gamesService } from "./games.service";
import { createGameSchema, updateGameSchema } from "./games.validation";

export const gamesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // Par défaut : uniquement les jeux actifs (front public).
      // ?all=true : tous les jeux, réservé à l'admin plus tard.
      const onlyActive = req.query.all !== "true";
      const games = await gamesService.listGames(onlyActive);
      res.json({ data: games });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const game = await gamesService.getGameById(getParam(req, "id"));
      res.json({ data: game });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createGameSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const game = await gamesService.createGame(parsed.data);
      res.status(201).json({ data: game });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateGameSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const game = await gamesService.updateGame(getParam(req, "id"), parsed.data);
      res.json({ data: game });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await gamesService.deleteGame(getParam(req, "id"));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};