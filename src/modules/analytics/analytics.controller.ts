import type { NextFunction, Request, Response } from "express";
import { analyticsService } from "./analytics.service";

export const analyticsController = {
  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const data = await analyticsService.getSummary(days);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};