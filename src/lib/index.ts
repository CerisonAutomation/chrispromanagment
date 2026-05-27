/**
 * @fileoverview Lib Exports — Canonical barrel pattern
 * All lib modules exported from single entry point
 */

// Database
export * from './db/index.js';

// Supabase - named exports to avoid conflicts
export { createClient as createBrowserClient, getClient as getBrowserClient } from './supabase/client.js';
export { createClient as createServerClient, getUser, getSession } from './supabase/server.js';

// Utilities
export * from './utils.js';
export * from './constants.js';
export * from './env.js';

// API
export * from './api.js';

// Hooks - re-export from lib/hooks (will be created)
// export * from './hooks/index.js';
