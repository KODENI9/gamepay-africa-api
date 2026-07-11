import { Router } from "express";
import {requireAdmin } from "../auth/auth.middleware";
import { gamesController } from "./games.controller";

export const gamesRouter = Router();

// Routes publiques (catalogue affiché sur le frontend)
gamesRouter.get("/", gamesController.list);
gamesRouter.get("/:id", gamesController.getById);

// Routes protégées — TODO: remplacer requireAuthenticated par requireAdmin
// quand le module admin/rôles existera.
gamesRouter.post("/", requireAdmin, gamesController.create);
gamesRouter.patch("/:id", requireAdmin, gamesController.update);
gamesRouter.delete("/:id", requireAdmin, gamesController.remove);