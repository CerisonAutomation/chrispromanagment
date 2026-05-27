import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { type UserRole, type Result, ok, err, AppError } from '@/types';

interface AuthState {
  session:   Session | null;
  user:      User | null;
  roles:     UserRole[];
  isLoading: boolean;
  isAdmin:   boolean;
  isEditor:  boolean;

  // actions
  init:           () => () => void;
  signIn:         (email: string, password: string) => Promise<Result<void>>;
  signUp:         (email: string, password: string, displayName?: string) => Promise<Result<void>>;
  signOut:        () => Promise<void>;
  resetPassword:  (email: string) => Promise<Result<void>>;
  refreshRoles:   (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session:   null,
  user:      null,
  roles:     [],
  isLoading: true,
  isAdmin:   false,
  isEditor:  false,

  init() {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        get().refreshRoles(session.user.id);
      } else {
        set({ roles: [], isAdmin: false, isEditor: false });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null });
      if (data.session?.user) {
        get().refreshRoles(data.session.user.id).finally(() => set({ isLoading: false }));
      } else {
        set({ isLoading: false });
      }
    });

    return () => sub.subscription.unsubscribe();
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
return err(AppError.from(error));
}
    return ok(undefined);
  },

  async signUp(email, password, displayName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
return err(AppError.from(error));
}
    return ok(undefined);
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null, user: null, roles: [], isAdmin: false, isEditor: false });
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) {
return err(AppError.from(error));
}
    return ok(undefined);
  },

  async refreshRoles(userId) {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const roles = (data ?? []).map(r => r.role as UserRole);
    set({
      roles,
      isAdmin:  roles.includes('admin'),
      isEditor: roles.includes('admin') || roles.includes('editor'),
    });
  },
}));
