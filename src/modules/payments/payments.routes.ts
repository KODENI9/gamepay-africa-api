import { Router } from "express";
import { requireAuthenticated } from "../auth/auth.middleware";
import { paymentsController } from "./payments.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/initiate", requireAuthenticated, paymentsController.initiate);
paymentsRouter.post("/webhook", paymentsController.webhook);