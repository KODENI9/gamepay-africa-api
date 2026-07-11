import { z } from "zod";

export const playerIdFieldSchema = z.object({
  key: z.string().min(1, "key est requis"),
  label: z.string().min(1, "label est requis"),
  required: z.boolean(),
});

export const createGameSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères").max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Le slug doit être en kebab-case (lettres minuscules, chiffres, tirets)"),
  category: z.string().min(2, "category est requis").max(50),
  iconUrl: z.string().url("iconUrl doit être une URL valide"),
  playerIdFields: z.array(playerIdFieldSchema).min(1, "Au moins un champ Player ID est requis"),
  isActive: z.boolean().default(true),
});

export const updateGameSchema = createGameSchema.partial();

export type CreateGameDTO = z.infer<typeof createGameSchema>;
export type UpdateGameDTO = z.infer<typeof updateGameSchema>;