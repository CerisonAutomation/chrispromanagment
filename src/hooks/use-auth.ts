import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "user";

// ─── useAuth ─────────────────────────────────────────────────────────────────
// Fixed race condition: subscribe BEFORE calling getSession so we never miss
// an auth event that fires between the two calls.
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialised = useRef(false);

  useEffect(() => {
    // 1. Subscribe first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!initialised.current) {
        initialised.current = true;
        setLoading(false);
      }
    });

    // 2. Then hydrate from storage — onAuthStateChange fires INITIAL_SESSION
    //    for us automatically, so this is just a safety net.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!initialised.current) {
        initialised.current = true;
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

// ─── useRoles ─────────────────────────────────────────────────────────────────
// Fix: starts loading=false when no userId to avoid double-flash on auth pages.
export function useRoles(userId: string | undefined) {
  const [roles,   setRoles]   = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(!!userId); // only true if we have a userId

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (!error) setRoles((data ?? []).map((r: { role: AppRole }) => r.role));
        setLoading(false);
      });
  }, [userId]);

  return {
    roles,
    loading,
    isAdmin:  roles.includes("admin"),
    isEditor: roles.includes("editor") || roles.includes("admin"), // admin is always editor
  };
}
