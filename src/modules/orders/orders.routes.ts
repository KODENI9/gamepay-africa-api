import { Router } from "express";
import { requireAdmin, requireAuthenticated } from "../auth/auth.middleware";
import { ordersController } from "./orders.controller";

export const ordersRouter = Router();

ordersRouter.get("/admin/all", requireAdmin, ordersController.listAll);

ordersRouter.use(requireAuthenticated);

ordersRouter.get("/", ordersController.list);
ordersRouter.get("/:id", ordersController.getById);
ordersRouter.post("/", ordersController.create);
ordersRouter.patch("/:id/status", requireAdmin, ordersController.updateStatus);