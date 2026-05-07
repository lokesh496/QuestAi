import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBx9ur0xZEV2hPrj4pqRW2UTZvk6dITJP0",
  authDomain: "ai-studio-applet-webapp-a26bb.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-a26bb",
  storageBucket: "ai-studio-applet-webapp-a26bb.firebasestorage.app",
  messagingSenderId: "5884352840",
  appId: "1:5884352840:web:399b59131901ed4a57fb7d",
};

// The custom Firestore database ID from the original config
const FIRESTORE_DATABASE_ID = "ai-studio-b9414bc9-d6d2-4a30-9906-168273bc7817";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, FIRESTORE_DATABASE_ID);
