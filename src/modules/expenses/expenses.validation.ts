import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z.enum(["fournisseur", "hebergement", "autre"]),
  description: z.string().min(2, "description est requise").max(200),
  amount: z.number().positive("amount doit être un nombre positif"),
  currency: z.string().length(3, "currency doit être un code ISO à 3 lettres (ex: XOF)").default("XOF"),
  date: z.string().datetime().optional(),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;