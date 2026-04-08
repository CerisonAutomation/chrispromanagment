/**
 * @fileoverview Supabase Provider — React Context for Supabase Auth State
 * 
 * OFFICIAL PATTERN: @supabase/ssr with realtime auth state
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface SupabaseContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  isLoading: true,
  refreshSession: async () => {},
});

export function useSupabase() {
  return useContext(SupabaseContext);
}

interface SupabaseProviderProps {
  children: React.ReactNode;
  initialSession?: Session | null;
  initialUser?: User | null;
}

export function SupabaseProvider({ 
  children, 
  initialSession = null,
  initialUser = null 
}: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(!initialSession);

  const refreshSession = async () => {
    try {
      const supabase = getClient();
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(newSession);
      setUser(newSession?.user ?? null);
    } catch (error) {
      console.error('[SupabaseProvider] Failed to refresh session:', error);
    }
  };

  useEffect(() => {
    // Only run client-side session check if no initial session was provided
    if (!initialSession) {
      refreshSession().finally(() => setIsLoading(false));
    }

    const supabase = getClient();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialSession]);

  return (
    <SupabaseContext.Provider value={{ user, session, isLoading, refreshSession }}>
      {children}
    </SupabaseContext.Provider>
  );
}
