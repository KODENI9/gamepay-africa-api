import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError";
import { getParam } from "../../shared/utils/getParam";
import { expensesService } from "./expenses.service";
import type { Expense } from "./expenses.types";
import { createExpenseSchema } from "./expenses.validation";

function serializeExpense(expense: Expense) {
  return {
    ...expense,
    date: expense.date.toDate().toISOString(),
  };
}

export const expensesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : undefined;
      const expenses = await expensesService.listExpenses(days);
      res.json({ data: expenses.map(serializeExpense) });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest("Données invalides", parsed.error.flatten());
      }
      const expense = await expensesService.createExpense(parsed.data);
      res.status(201).json({ data: serializeExpense(expense) });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await expensesService.deleteExpense(getParam(req, "id"));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};