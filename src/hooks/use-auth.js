import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns { session, user, isAdmin, isEditor, isLoading }.
 * isAdmin/isEditor are verified via the `user_roles` table.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. Subscribe synchronously (no awaits inside the callback)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!active) return;
      setSession(sess);
      if (sess?.user) {
        // Defer DB call so the auth callback stays cheap
        setTimeout(() => fetchRoles(sess.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    // 2. Initial fetch
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        fetchRoles(data.session.user.id).finally(() => active && setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    async function fetchRoles(userId) {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (!active) return;
      if (error) {
        console.warn("[auth] role fetch failed:", error.message);
        setRoles([]);
      } else {
        setRoles((data || []).map((r) => r.role));
      }
      setIsLoading(false);
    }

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    roles,
    isAdmin: roles.includes("admin"),
    isEditor: roles.includes("admin") || roles.includes("editor"),
    isLoading,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
