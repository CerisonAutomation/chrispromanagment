/**
 * @fileoverview Admin Authorization Utilities — Canonical Supabase Auth
 * 
 * Provides admin role verification using Supabase user metadata and/or
 * a dedicated admins table for proper authorization.
 * 
 * CANONICAL PATTERN:
 * 1. Check if user is authenticated (Supabase session)
 * 2. Check if user has admin role (user_metadata.role === 'admin' OR in admins table)
 * 3. Return user with admin status
 */

import { createClient } from './server';
import type { User } from '@supabase/supabase-js';

export interface AdminUser extends User {
  isAdmin: boolean;
}

/**
 * Check if a user has admin privileges
 * 
 * Checks (in order):
 * 1. User metadata has role: 'admin'
 * 2. User email is in the admin list (from env or database)
 * 3. User is in the admins table (if implemented)
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  // Method 1: Check user_metadata for admin role
  const metadataRole = user.user_metadata?.role;
  if (metadataRole === 'admin') return true;

  // Method 2: Check app_metadata for admin role (set by Supabase admin)
  const appMetadataRole = user.app_metadata?.role;
  if (appMetadataRole === 'admin') return true;

  // Method 3: Check against admin emails list (env-based, simpler approach)
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  if (user.email && adminEmails.includes(user.email.toLowerCase())) return true;

  // Method 4: Check admins table (most robust - requires database table)
  // Uncomment when you have an admins table:
  // try {
  //   const supabase = await createClient();
  //   const { data, error } = await supabase
  //     .from('admins')
  //     .select('user_id')
  //     .eq('user_id', user.id)
  //     .single();
  //   if (data && !error) return true;
  // } catch {
  //   // Ignore database errors
  // }

  return false;
}

/**
 * Get authenticated admin user
 * Returns null if not authenticated or not an admin
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;

  const adminStatus = await isAdmin(user);
  
  if (!adminStatus) return null;

  return { ...user, isAdmin: true };
}

/**
 * Middleware helper: Check admin auth from request
 * Used in middleware.ts for route protection
 */
export async function checkAdminAuth(request: Request): Promise<{
  authenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  redirect?: string;
}> {
  // This is a simplified version for middleware
  // In production, you'd want to verify the JWT token from cookies
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { authenticated: false, isAdmin: false, user: null };
    }

    const adminStatus = await isAdmin(user);
    
    return {
      authenticated: true,
      isAdmin: adminStatus,
      user,
    };
  } catch {
    return { authenticated: false, isAdmin: false, user: null };
  }
}
