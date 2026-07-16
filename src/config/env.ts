import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),

  CLERK_PUBLISHABLE_KEY: z.string().min(1, "CLERK_PUBLISHABLE_KEY est requis"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY est requis"),

  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID est requis"),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, "FIREBASE_CLIENT_EMAIL est requis"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY est requis"),

  REDIS_URL: z.string().min(1, "REDIS_URL est requis"),

  PUBLIC_BASE_URL: z.string().url("PUBLIC_BASE_URL doit être une URL valide"),
  FRONTEND_BASE_URL: z.string().url("FRONTEND_BASE_URL doit être une URL valide"),
  MONEYFUSION_API_URL: z.string().url("MONEYFUSION_API_URL doit être une URL valide"),

  // MooGold — fournisseur de recharges (optionnel : tant que ces variables
  // sont vides, le sélecteur de livraison ignore ce fournisseur et retombe
  // sur "manual". Voir doc.moogold.com pour obtenir un Partner ID/Secret Key.
  MOOGOLD_PARTNER_ID: z.string().optional().default(""),
  MOOGOLD_SECRET_KEY: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

let resolvedEnv: z.infer<typeof envSchema>;

if (parsed.success) {
  resolvedEnv = parsed.data;
} else {
  const isDev = process.env.NODE_ENV !== "production";
  const message = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  if (!isDev) {
    throw new Error(`Configuration invalide :\n${message}`);
  }

  console.warn(
    `⚠️  Variables d'environnement manquantes ou invalides (mode dev, on continue avec des valeurs vides) :\n${message}`
  );

  resolvedEnv = {
    NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
    PORT: Number(process.env.PORT) || 4000,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY ?? "",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? "",
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ?? "",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost:4000",
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
    MONEYFUSION_API_URL: process.env.MONEYFUSION_API_URL ?? "",
    MOOGOLD_PARTNER_ID: process.env.MOOGOLD_PARTNER_ID ?? "",
    MOOGOLD_SECRET_KEY: process.env.MOOGOLD_SECRET_KEY ?? "",
  };
}

export const env = resolvedEnv;