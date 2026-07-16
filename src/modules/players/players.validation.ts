import { z } from "zod";

export const validatePlayerSchema = z.object({
  productId: z.string().min(1, "productId est requis"),
  playerIdExtra: z.record(z.string(), z.string()),
});

export type ValidatePlayerDTO = z.infer<typeof validatePlayerSchema>;