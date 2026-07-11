import { FieldValue, type DocumentSnapshot, type Query } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import type { CreateGameInput, Game, UpdateGameInput } from "./games.types";

const COLLECTION = "games";

function toGame(doc: DocumentSnapshot): Game {
  return { id: doc.id, ...(doc.data() as Omit<Game, "id">) };
}

export const gamesRepository = {
  async findAll(onlyActive = false): Promise<Game[]> {
    let query: Query = db.collection(COLLECTION);
    if (onlyActive) {
      query = query.where("isActive", "==", true);
    }
    const snapshot = await query.orderBy("name").get();
    return snapshot.docs.map(toGame);
  },

  async findById(id: string): Promise<Game | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? toGame(doc) : null;
  },

  async findBySlug(slug: string): Promise<Game | null> {
    const snapshot = await db.collection(COLLECTION).where("slug", "==", slug).limit(1).get();
    return snapshot.empty ? null : toGame(snapshot.docs[0]);
  },

  async create(input: CreateGameInput): Promise<Game> {
    const ref = db.collection(COLLECTION).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({ ...input, createdAt: now, updatedAt: now });
    const created = await ref.get();
    return toGame(created);
  },

  async update(id: string, input: UpdateGameInput): Promise<Game | null> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return null;

    await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    return toGame(updated);
  },

  async delete(id: string): Promise<boolean> {
    const ref = db.collection(COLLECTION).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return false;

    await ref.delete();
    return true;
  },
};