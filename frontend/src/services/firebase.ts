import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

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
export const db = getDatabase(app);

export const saveSearchToUserFirebase = async (userUid: string, trip: any) => {
  if (!userUid) return;
  try {
    const sanitizedUid = userUid.replace(/\./g, '_');
    const tripId = trip.trip_id || `trip_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const payload = {
      ...trip,
      searched_at: trip.searched_at || timestamp,
      user_uid: userUid
    };
    const tripRef = ref(db, `users/${sanitizedUid}/searched_plans/${tripId}`);
    await set(tripRef, payload);
    console.log(`🔥 [FIREBASE FRONTEND] Saved trip ${tripId} under UID users/${sanitizedUid}/searched_plans`);
  } catch (err) {
    console.error('🔥 [FIREBASE FRONTEND ERROR] Could not save user search:', err);
  }
};

export const fetchUserSearchedPlansFromFirebase = async (userUid: string) => {
  if (!userUid) return [];
  try {
    const sanitizedUid = userUid.replace(/\./g, '_');
    const userPlansRef = ref(db, `users/${sanitizedUid}/searched_plans`);
    const snapshot = await get(userPlansRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const plansArray = Object.values(data) as any[];
      return plansArray.sort((a, b) => new Date(b.searched_at || 0).getTime() - new Date(a.searched_at || 0).getTime());
    }
  } catch (err) {
    console.error('🔥 [FIREBASE FRONTEND ERROR] Could not fetch user searches:', err);
  }
  return [];
};

export interface ChatSession {
  id: string;
  title: string;
  destination: string;
  created_at: string;
  updated_at: string;
  user_uid?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export const saveChatSessionToFirebase = async (userUid: string, session: ChatSession) => {
  if (!userUid || !session || !session.id) return;
  try {
    const sanitizedUid = userUid.replace(/\./g, '_');
    const timestamp = new Date().toISOString();
    const payload = {
      ...session,
      updated_at: timestamp,
      user_uid: userUid
    };
    const sessionRef = ref(db, `users/${sanitizedUid}/chat_sessions/${session.id}`);
    await set(sessionRef, payload);
    console.log(`🔥 [FIREBASE CHAT DB] Saved chat session ${session.id} under UID /users/${sanitizedUid}/chat_sessions`);
  } catch (err) {
    console.error('🔥 [FIREBASE CHAT DB ERROR] Could not save chat session:', err);
  }
};

export const fetchUserChatSessionsFromFirebase = async (userUid: string): Promise<ChatSession[]> => {
  if (!userUid) return [];
  try {
    const sanitizedUid = userUid.replace(/\./g, '_');
    const sessionsRef = ref(db, `users/${sanitizedUid}/chat_sessions`);
    const snapshot = await get(sessionsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const sessionsArray = Object.values(data) as ChatSession[];
      return sessionsArray.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
    }
  } catch (err) {
    console.error('🔥 [FIREBASE CHAT DB ERROR] Could not fetch chat sessions:', err);
  }
  return [];
};

export const deleteUserChatSessionFromFirebase = async (userUid: string, sessionId: string) => {
  if (!userUid || !sessionId) return;
  try {
    const sanitizedUid = userUid.replace(/\./g, '_');
    const sessionRef = ref(db, `users/${sanitizedUid}/chat_sessions/${sessionId}`);
    await set(sessionRef, null);
    console.log(`🔥 [FIREBASE CHAT DB] Deleted chat session ${sessionId} under UID /users/${sanitizedUid}/chat_sessions`);
  } catch (err) {
    console.error('🔥 [FIREBASE CHAT DB ERROR] Could not delete chat session:', err);
  }
};

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};


