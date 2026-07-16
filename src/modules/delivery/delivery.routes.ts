import { Router } from "express";
import { deliveryController } from "./delivery.controller";

export const deliveryRouter = Router();

// Route publique : appelée par les serveurs MooGold, pas par un navigateur.
deliveryRouter.post("/moogold/webhook", deliveryController.moogoldWebhook);