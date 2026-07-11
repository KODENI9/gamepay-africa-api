import { Router } from "express";
import {requireAdmin  } from "../auth/auth.middleware";
import { productsController } from "./products.controller";

export const productsRouter = Router();

// Routes publiques — ?gameId=xxx pour filtrer les produits d'un jeu donné
productsRouter.get("/", productsController.list);
productsRouter.get("/:id", productsController.getById);

// Routes protégées
productsRouter.post("/", requireAdmin, productsController.create);
productsRouter.patch("/:id", requireAdmin, productsController.update);
productsRouter.delete("/:id", requireAdmin, productsController.remove);