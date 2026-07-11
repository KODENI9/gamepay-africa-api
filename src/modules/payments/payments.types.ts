import type { Timestamp } from "firebase-admin/firestore";

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Payment {
  id: string;
  orderId: string;
  provider: "moneyfusion";
  tokenPay: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  externalTransactionId: string | null;
  rawWebhookPayload: unknown | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreatePaymentInput = Pick <
  Payment,
  "orderId" | "provider" | "tokenPay" | "paymentUrl" | "amount" | "currency"
>;