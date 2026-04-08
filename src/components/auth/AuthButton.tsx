/**
 * @fileoverview Auth Button — Sign in / Sign out with Supabase Auth
 * 
 * OFFICIAL PATTERN: @supabase/ssr cookie-based auth
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AuthButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function SignInButton({ variant = 'default', size = 'default', className }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error('Failed to sign in');
      console.error('[AuthButton] Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Signing in...' : 'Sign In'}
    </Button>
  );
}

export function SignOutButton({ variant = 'outline', size = 'default', className }: AuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('[AuthButton] Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
