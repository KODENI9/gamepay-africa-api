import { z } from "zod";

export const createProductSchema = z.object({
  gameId: z.string().min(1, "gameId est requis"),
  name: z.string().min(1, "name est requis").max(100),
  isFeatured: z.boolean().default(false),
  amount: z.number().positive("amount doit être un nombre positif"),
  price: z.number().positive("price doit être un nombre positif"),
  currency: z.string().length(3, "currency doit être un code ISO à 3 lettres (ex: XOF)").default("XOF"),
  providerMapping: z.record(z.string(), z.string()).default({}),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;