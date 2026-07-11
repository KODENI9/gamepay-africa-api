import type { Timestamp } from "firebase-admin/firestore";

export interface PlayerIdField {
  key: string;
  label: string;
  required: boolean;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  iconUrl: string;
  playerIdFields: PlayerIdField[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateGameInput = Omit<Game, "id" | "createdAt" | "updatedAt">;
export type UpdateGameInput = Partial<CreateGameInput>;