import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import toast from 'react-hot-toast';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken(true);
            localStorage.setItem('auth_token', token);

            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Tourist Leader',
              photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=10b981&color=fff`
            };
            setUser(profile);
            localStorage.setItem('tourist_user', JSON.stringify(profile));
            console.log(`🔥 [FIREBASE AUTH] Verified User: ${profile.email}`);
          } catch (err) {
            console.error("Error fetching Firebase ID Token:", err);
          }
        } else {
          setUser(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('tourist_user');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase Auth observer init error:", err);
      setLoading(false);
    }
  }, []);

  const handleAuthError = (err: any) => {
    console.error("🔥 [FIREBASE AUTH ERROR]:", err);
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      toast.error(
        '🔑 Firebase Web API Key required! Please paste your Web API key in frontend/.env as VITE_FIREBASE_API_KEY',
        { duration: 10000 }
      );
    } else {
      toast.error(err?.message || "Authentication failed");
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      localStorage.setItem('auth_token', token);
      toast.success(`Welcome back, ${cred.user.email}!`);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      localStorage.setItem('auth_token', token);
      toast.success(`Account registered successfully for ${email}!`);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      localStorage.setItem('auth_token', token);
      toast.success(`Signed in with Google as ${cred.user.email}!`);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tourist_user');
      toast.success("Signed out");
    } catch (err: any) {
      console.error("🔥 [FIREBASE AUTH ERROR] Signout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
