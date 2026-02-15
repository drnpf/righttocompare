import admin from "firebase-admin";
import serviceAccount from "./keys/serviceAccountKey.json";

// Attempting to start Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.error("Firebase Admin Error: Missing serviceAccountKey.json");
}

export default admin;
