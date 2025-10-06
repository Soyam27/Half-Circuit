// Firebase configuration and initialization
// Uses Vite environment variables (prefix: VITE_FIREBASE_*)
// Create a .env file in project root with:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...
// (Optional) VITE_FIREBASE_MEASUREMENT_ID=...

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Guard against re-init in Vite HMR
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully.');
} catch (e) {
    console.error('Firebase initialization error', e);
  // If already initialized, retrieve existing instance (Firebase v9 modular doesn't expose a direct getApp safe fallback pre-check)
  // In development HMR this catch will run after first load when config is unchanged.
  console.warn('Firebase app already initialized. Reusing existing instance.');
}

export const auth = getAuth();
export default app;
