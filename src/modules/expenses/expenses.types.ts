import type { Timestamp } from "firebase-admin/firestore";

export type ExpenseCategory = "fournisseur" | "hebergement" | "autre";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export type CreateExpenseInput = Pick<Expense, "category" | "description" | "amount" | "currency" | "date">;