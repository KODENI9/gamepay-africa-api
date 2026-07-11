import { FieldValue, type DocumentSnapshot ,type Query   } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import type { CreateOrderInput, Order, OrderStatus } from "./orders.types";

const COLLECTION = "orders";

function toOrder(doc: DocumentSnapshot): Order {
  return { id: doc.id, ...(doc.data() as Omit<Order, "id">) };
}

export const ordersRepository = {

    async findAll(filters: { status?: OrderStatus } = {}): Promise<Order[]> {
        let query: Query = db.collection(COLLECTION);
        if (filters.status) {
        query = query.where("status", "==", filters.status);
        }
        const snapshot = await query.orderBy("createdAt", "desc").limit(200).get();
        return snapshot.docs.map(toOrder);
    },

  async findAllByUser(userId: string): Promise<Order[]> {
    const snapshot = await db
      .collection(COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(toOrder);
  },

  async findById(id: string): Promise<Order | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? toOrder(doc) : null;
  },

  async create(input: CreateOrderInput): Promise<Order> {
    const ref = db.collection(COLLECTION).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({
      ...input,
      status: "pending" as OrderStatus,
      paymentId: null,
      deliveryAttempts: [],
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    return toOrder(created);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return null;

    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    return toOrder(updated);
  },

  async attachPayment(id: string, paymentId: string): Promise<void> {
    await db.collection(COLLECTION).doc(id).update({
      paymentId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  },

  async addDeliveryAttempt(
    id: string,
    attempt: { provider: string; status: "success" | "failed"; response: unknown }
  ): Promise<void> {
    await db
      .collection(COLLECTION)
      .doc(id)
      .update({
        deliveryAttempts: FieldValue.arrayUnion({
          provider: attempt.provider,
          status: attempt.status,
          timestamp: new Date(),
          response: attempt.response,
        }),
        updatedAt: FieldValue.serverTimestamp(),
      });
  },
};