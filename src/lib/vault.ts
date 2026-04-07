/**
 * vault.ts — Supabase Vault secret reader
 *
 * Reads encrypted secrets stored in vault.decrypted_secrets via the
 * Supabase service-role client (server-side only — never call from browser).
 *
 * Usage:
 *   import { getSecret } from '@/lib/vault';
 *   const guestySecret = await getSecret('GUESTY_CLIENT_SECRET');
 *
 * Vault secrets are managed at:
 *   https://supabase.com/dashboard/project/mohpkakmpagvbqsehwhp/vault/secrets
 *
 * Or via SQL:
 *   SELECT vault.update_secret('<uuid>', '<new_value>') FROM vault.decrypted_secrets WHERE name = '<KEY_NAME>';
 */
import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Lazily initialised service-role client for Vault access
let _serviceClient: ReturnType<typeof createClient> | null = null;

function getServiceClient() {
  if (_serviceClient) return _serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      '[vault] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var is missing. ' +
      'Set them in Vercel Dashboard → Settings → Environment Variables.'
    );
  }

  _serviceClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _serviceClient;
}

/**
 * Fetches a decrypted secret from Supabase Vault by its unique name.
 *
 * @param name - The unique secret name registered in Vault (e.g. 'GUESTY_CLIENT_SECRET')
 * @returns The decrypted secret string, or null if not found
 */
export async function getSecret(name: string): Promise<string | null> {
  const client = getServiceClient();

  const { data, error } = await client
    .schema('vault')
    .from('decrypted_secrets')
    .select('decrypted_secret')
    .eq('name', name)
    .maybeSingle();

  if (error) {
    console.error(`[vault] Failed to read secret "${name}":`, error.message);
    return null;
  }

  return (data as { decrypted_secret: string } | null)?.decrypted_secret ?? null;
}

/**
 * Fetches multiple secrets at once. Returns a key→value map.
 * Missing or errored secrets are set to null.
 *
 * @param names - Array of Vault secret names to fetch
 */
export async function getSecrets(
  names: string[]
): Promise<Record<string, string | null>> {
  const client = getServiceClient();

  const { data, error } = await client
    .schema('vault')
    .from('decrypted_secrets')
    .select('name, decrypted_secret')
    .in('name', names);

  if (error) {
    console.error('[vault] Failed to read secrets batch:', error.message);
    return Object.fromEntries(names.map((n) => [n, null]));
  }

  const map = Object.fromEntries(names.map((n) => [n, null])) as Record<string, string | null>;
  for (const row of (data ?? []) as { name: string; decrypted_secret: string }[]) {
    map[row.name] = row.decrypted_secret;
  }
  return map;
}
