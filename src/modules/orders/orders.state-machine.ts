import { AppError } from "../../shared/errors/AppError";
import type { OrderStatus } from "./orders.types";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "failed"],
  paid: ["processing", "refunded"],
  processing: ["delivered", "failed"],
  delivered: [],
  failed: ["refunded", "processing"],
  refunded: [],
};

export function assertValidTransition(from: OrderStatus, to: OrderStatus): void {
  if (from === to) return;

  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw AppError.conflict(`Transition de statut invalide : "${from}" → "${to}"`);
  }
}