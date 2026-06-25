import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, requireAuth, requireDb, isFirebaseConfigured } from './firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(requireAuth(), email, password);
    await updateProfile(cred.user, { displayName: name });
    // Seed a profile doc so the user has a record from day one.
    await setDoc(doc(requireDb(), 'users', cred.user.uid), {
      name, email, createdAt: Date.now(),
    }, { merge: true });
    setUser({ ...cred.user });
  };

  const logIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(requireAuth(), email, password);
  };

  const logOut = async () => {
    await signOut(requireAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, configured: isFirebaseConfigured, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Map Firebase auth error codes to friendly messages.
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  switch (code) {
    case 'auth/email-already-in-use': return 'That email is already registered. Try logging in.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Incorrect email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return (e as Error)?.message || 'Something went wrong. Please try again.';
  }
}
