import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { firebaseErrorMessage } from '../utils/firebaseError';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => onAuthStateChanged(auth, user => {
    setSession(user);
    setAuthLoading(false);
  }), []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!session) {
        setUserProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setAuthError('');

      try {
        const ref = doc(db, 'usuarios', session.uid);
        const snap = await getDoc(ref);
        if (cancelled) return;

        if (snap.exists()) {
          const profile = { id: snap.id, ...snap.data() };
          setUserProfile(profile);
          await setDoc(ref, { lastLogin: new Date().toISOString() }, { merge: true });
          return;
        }

        const pending = {
          nome: session.displayName || session.email?.split('@')[0] || 'Usuário',
          email: session.email || '',
          perfil: 'tecnico',
          status: 'pendente',
          empresa: 'Avistar',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(ref, pending);
        if (!cancelled) setUserProfile({ id: session.uid, ...pending });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (!cancelled) setAuthError(firebaseErrorMessage(error, 'carregar o perfil'));
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [session]);

  const value = useMemo(() => ({
    session,
    userProfile,
    loading: authLoading || profileLoading,
    authError,
    logout: () => signOut(auth)
  }), [session, userProfile, authLoading, profileLoading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
