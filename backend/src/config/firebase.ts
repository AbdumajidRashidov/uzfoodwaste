// src/config/firebase.ts
import * as admin from "firebase-admin";
import { config } from "./environment";

if (!admin.apps.length) {
  try {
    // Handle the private key format
    const privateKey = config.firebase.privateKey
      ? config.firebase.privateKey.replace(/\\n/g, "\n")
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export const firebaseAdmin = admin;

// Validate required Firebase configuration
const requiredFirebaseEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

requiredFirebaseEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} environment variable is not set`);
  }
});
