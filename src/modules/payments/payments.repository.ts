import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import type { CreatePaymentInput, Payment, PaymentStatus } from "./payments.types";

const COLLECTION = "payments";

function toPayment(doc: DocumentSnapshot): Payment {
  return { id: doc.id, ...(doc.data() as Omit<Payment, "id">) };
}

export const paymentsRepository = {
  async findByTokenPay(tokenPay: string): Promise<Payment | null> {
    const snapshot = await db.collection(COLLECTION).where("tokenPay", "==", tokenPay).limit(1).get();
    return snapshot.empty ? null : toPayment(snapshot.docs[0]);
  },

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const snapshot = await db.collection(COLLECTION).where("orderId", "==", orderId).limit(1).get();
    return snapshot.empty ? null : toPayment(snapshot.docs[0]);
  },

  async create(input: CreatePaymentInput): Promise<Payment> {
    const ref = db.collection(COLLECTION).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({
      ...input,
      status: "pending" as PaymentStatus,
      externalTransactionId: null,
      rawWebhookPayload: null,
      createdAt: now,
      updatedAt: now,
    });
    const created = await ref.get();
    return toPayment(created);
  },

  async updateStatus(
    id: string,
    status: PaymentStatus,
    details: { externalTransactionId?: string; rawWebhookPayload?: unknown }
  ): Promise<Payment | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return null;

    await ref.update({
      status,
      ...(details.externalTransactionId ? { externalTransactionId: details.externalTransactionId } : {}),
      ...(details.rawWebhookPayload ? { rawWebhookPayload: details.rawWebhookPayload } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const updated = await ref.get();
    return toPayment(updated);
  },
};