import { Router } from "express";
import { requireAdmin } from "../auth/auth.middleware";
import { analyticsController } from "./analytics.controller";

export const analyticsRouter = Router();
analyticsRouter.get("/summary", requireAdmin, analyticsController.summary);