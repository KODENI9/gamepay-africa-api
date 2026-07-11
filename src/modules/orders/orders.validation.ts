import { z } from "zod";

export const createOrderSchema = z.object({
  gameId: z.string().min(1, "gameId est requis"),
  productId: z.string().min(1, "productId est requis"),
  playerId: z.string().min(1, "playerId est requis"),
  playerIdExtra: z.record(z.string(), z.string()).default({}),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["delivered", "failed", "refunded", "processing"]),
});

export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;