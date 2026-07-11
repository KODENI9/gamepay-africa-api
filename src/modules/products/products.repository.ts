import { FieldValue, type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import type { CreateProductInput, Product, UpdateProductInput } from "./products.types";

const COLLECTION = "products";

function toProduct(doc: DocumentSnapshot): Product {
  return { id: doc.id, ...(doc.data() as Omit<Product, "id">) };
}

export const productsRepository = {
  async findAll(filters: { gameId?: string; onlyActive?: boolean } = {}): Promise<Product[]> {
    let query: Query = db.collection(COLLECTION);

    if (filters.gameId) {
      query = query.where("gameId", "==", filters.gameId);
    }
    if (filters.onlyActive) {
      query = query.where("isActive", "==", true);
    }

    const snapshot = await query.orderBy("amount").get();
    return snapshot.docs.map(toProduct);
  },

  async findById(id: string): Promise<Product | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? toProduct(doc) : null;
  },

  async create(input: CreateProductInput): Promise<Product> {
    const ref = db.collection(COLLECTION).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({ ...input, createdAt: now, updatedAt: now });
    const created = await ref.get();
    return toProduct(created);
  },

  async update(id: string, input: UpdateProductInput): Promise<Product | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return null;

    await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    return toProduct(updated);
  },

  async delete(id: string): Promise<boolean> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return false;

    await ref.delete();
    return true;
  },
};