import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCDKMSS8rO1CHBUl-m-fL02mE6H3ng2Jd4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tourism-e45c9.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://tourism-e45c9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tourism-e45c9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tourism-e45c9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "286824730169",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:286824730169:web:31b7d6f2b21b44bbba07e8",
  measurementId: "G-ZX5MG58NVC"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};
