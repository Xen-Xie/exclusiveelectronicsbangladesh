// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIRE_BASE_API_KEY;
const authDomain = import.meta.env.VITE_FIRE_BASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIRE_BASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIRE_BASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIRE_BASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIRE_BASE_APP_ID;
const measurementId = import.meta.env.VITE_FIRE_BASE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provide = new GoogleAuthProvider();

export { app, analytics, auth, provide };
