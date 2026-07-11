import { Router } from "express";
import { requireAdmin } from "../auth/auth.middleware";
import { expensesController } from "./expenses.controller";

export const expensesRouter = Router();
expensesRouter.use(requireAdmin);
expensesRouter.get("/", expensesController.list);
expensesRouter.post("/", expensesController.create);
expensesRouter.delete("/:id", expensesController.remove);