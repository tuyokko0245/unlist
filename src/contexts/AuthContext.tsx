'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';

import { ensureUserBootstrap } from '@/lib/firebase/bootstrap';
import { auth, db } from '@/lib/firebase/config';
import { unregisterDevice } from '@/lib/firebase/messaging';

export type AuthStatus = 'loading' | 'signedOut' | 'bootstrapping' | 'ready' | 'error';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  retryBootstrap: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const currentUid = useRef<string | null>(null);

  const bootstrap = useCallback(async (uid: string) => {
    setStatus('bootstrapping');
    try {
      await ensureUserBootstrap(db, uid);
      if (currentUid.current === uid) setStatus('ready');
    } catch {
      if (currentUid.current === uid) setStatus('error');
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      currentUid.current = firebaseUser?.uid ?? null;
      setUser(firebaseUser);
      if (firebaseUser) {
        void bootstrap(firebaseUser.uid);
      } else {
        setStatus('signedOut');
      }
    });
  }, [bootstrap]);

  const retryBootstrap = useCallback(() => {
    if (currentUid.current) void bootstrap(currentUid.current);
  }, [bootstrap]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signInWithGoogle: async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      signInWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signUpWithEmail: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      },
      signOut: async () => {
        await unregisterDevice(auth.currentUser?.uid ?? null);
        await firebaseSignOut(auth);
      },
      retryBootstrap,
    }),
    [user, status, retryBootstrap],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
