import type { Timestamp } from "firebase-admin/firestore";

export interface Product {
  id: string;
  gameId: string;
  name: string;
  amount: number;
  price: number;
  currency: string;
  isFeatured: boolean;
  providerMapping: Record<string, string>;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type UpdateProductInput = Partial<CreateProductInput>;