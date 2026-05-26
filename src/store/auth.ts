import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  roles: string[];
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;

  // actions
  init: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshRoles: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  roles: [],
  isLoading: true,
  isAdmin: false,
  isEditor: false,

  init() {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) get().refreshRoles(session.user.id);
      else set({ roles: [], isAdmin: false, isEditor: false });
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
    if (error) throw error;
  },

  async signUp(email, password, displayName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null, user: null, roles: [], isAdmin: false, isEditor: false });
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) throw error;
  },

  async refreshRoles(userId) {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
    const roles = (data || []).map(r => r.role as string);
    set({
      roles,
      isAdmin: roles.includes('admin'),
      isEditor: roles.includes('admin') || roles.includes('editor'),
    });
  },
}));
