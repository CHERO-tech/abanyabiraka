'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { isSessionError } from '@/lib/api/client';
import { clearSession, readSession, writeSession } from '@/lib/session';

const AuthContext = createContext(null);

// Wraps the whole app (see app/layout.js). Any client component can call useAuth() to get:
//   session  - { token, userId, fullName, role, identifier } or null when logged out
//   profile  - GET /api/auth/me result: adds email, phone, workerId, clientId
//   ready    - false until localStorage has been read (avoid redirecting before that)
//   signIn(authResponse, identifier), signOut(), refreshProfile()
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await authApi.me();
      setProfile(me);
      return me;
    } catch (error) {
      // A stale token (expired, or the DB was reset) - log out quietly.
      if (isSessionError(error)) {
        clearSession();
        setSession(null);
        setProfile(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const stored = readSession();
    setSession(stored);
    if (!stored) {
      setReady(true);
      return;
    }
    refreshProfile().finally(() => setReady(true));
  }, [refreshProfile]);

  const signIn = useCallback(async (authResponse, identifier) => {
    const next = { ...authResponse, identifier };
    writeSession(next);
    setSession(next);
    return refreshProfile();
  }, [refreshProfile]);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
    setProfile(null);
  }, []);

  return <AuthContext.Provider value={{ session, profile, ready, signIn, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
