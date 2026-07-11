import { env } from "./env";

// On ne crée volontairement PAS d'instance IORedis ici. BullMQ embarque sa
// propre copie du package ioredis ; construire notre propre instance avec
// un ioredis installé séparément provoque un conflit de types ("dual
// package hazard"). On passe donc de simples options de connexion, que
// BullMQ utilisera pour créer ses connexions en interne.
const redisUrl = new URL(env.REDIS_URL);

export const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null,
};