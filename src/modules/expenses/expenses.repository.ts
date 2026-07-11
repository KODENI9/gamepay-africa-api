import { FieldValue, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import type { CreateExpenseInput, Expense } from "./expenses.types";

const COLLECTION = "expenses";

function toExpense(doc: DocumentSnapshot): Expense {
  return { id: doc.id, ...(doc.data() as Omit<Expense, "id">) };
}

export const expensesRepository = {
  async findAll(sinceDays?: number): Promise<Expense[]> {
    let query = db.collection(COLLECTION).orderBy("date", "desc") as FirebaseFirestore.Query;
    if (sinceDays) {
      const since = Timestamp.fromDate(new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000));
      query = db.collection(COLLECTION).where("date", ">=", since).orderBy("date", "desc");
    }
    const snapshot = await query.get();
    return snapshot.docs.map(toExpense);
  },

  async create(input: CreateExpenseInput): Promise<Expense> {
    const ref = db.collection(COLLECTION).doc();
    await ref.set({ ...input, createdAt: FieldValue.serverTimestamp() });
    const created = await ref.get();
    return toExpense(created);
  },

  async delete(id: string): Promise<boolean> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return false;
    await ref.delete();
    return true;
  },
};