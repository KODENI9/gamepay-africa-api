import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { env } from "./env";

function buildCredential() {
  return cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    // Les clés privées stockées en variable d'env contiennent des "\n" échappés
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: buildCredential(),
  });

export const db = getFirestore(app);
export const storage = getStorage(app);
