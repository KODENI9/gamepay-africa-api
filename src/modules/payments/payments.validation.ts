import { z } from "zod";

export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1, "orderId est requis"),
  numeroSend: z
    .string()
    .min(8, "numeroSend doit être un numéro de téléphone valide")
    .max(20),
  nomclient: z.string().min(2, "nomclient est requis").max(100),
});

export type InitiatePaymentDTO = z.infer<typeof initiatePaymentSchema>;

export const moneyFusionWebhookSchema = z.object({
  event: z.string(),
  tokenPay: z.string().min(1),
});

export type MoneyFusionWebhookDTO = z.infer<typeof moneyFusionWebhookSchema>;