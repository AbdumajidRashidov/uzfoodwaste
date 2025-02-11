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
