import type { Timestamp } from "firebase-admin/firestore";

export type OrderStatus = "pending" | "paid" | "processing" | "delivered" | "failed" | "refunded";

export interface DeliveryAttempt {
  provider: string;
  status: "success" | "failed";
  timestamp: Timestamp;
  response: unknown;
}

export interface Order {
  id: string;
  userId: string;
  gameId: string;
  productId: string;
  playerId: string;
  playerIdExtra: Record<string, string>;
  status: OrderStatus;
  price: number;
  currency: string;
  paymentId: string | null;
  deliveryAttempts: DeliveryAttempt[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateOrderInput = Pick<Order, "userId" | "gameId" | "productId" | "playerId" | "playerIdExtra"> & {
  price: number;
  currency: string;
};