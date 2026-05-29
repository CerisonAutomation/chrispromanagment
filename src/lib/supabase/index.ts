/**
 * @fileoverview Canonical Supabase Exports — Next.js 16 App Router
 * 
 * USAGE:
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 * - Server Components/Actions/API: import { createClient } from '@/lib/supabase/server'
 * - Types: import type { Database } from '@/types/supabase'
 */

// Re-export types for convenience
export type { Database } from '@/types/supabase';

// Note: Client and server exports are separate to avoid bundling server code in client
// import { createClient } from '@/lib/supabase/client'  // For Client Components
// import { createClient } from '@/lib/supabase/server'  // For Server Components
