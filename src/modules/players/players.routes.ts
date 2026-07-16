import { Router } from "express";
import { requireAuthenticated } from "../auth/auth.middleware";
import { playersController } from "./players.controller";

export const playersRouter = Router();

playersRouter.post("/validate", requireAuthenticated, playersController.validate);