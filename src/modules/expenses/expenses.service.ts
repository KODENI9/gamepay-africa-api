import { Timestamp } from "firebase-admin/firestore";
import { AppError } from "../../shared/errors/AppError";
import { expensesRepository } from "./expenses.repository";
import type { Expense } from "./expenses.types";
import type { CreateExpenseDTO } from "./expenses.validation";

export const expensesService = {
  async listExpenses(sinceDays?: number): Promise<Expense[]> {
    return expensesRepository.findAll(sinceDays);
  },

  async createExpense(input: CreateExpenseDTO): Promise<Expense> {
    return expensesRepository.create({
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      date: input.date ? Timestamp.fromDate(new Date(input.date)) : Timestamp.now(),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    const deleted = await expensesRepository.delete(id);
    if (!deleted) throw AppError.notFound("Dépense introuvable");
  },
};