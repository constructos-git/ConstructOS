import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

async function hashQuery(query: string): Promise<string> {
  // Simple hash for query matching (browser-compatible)
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  // Use SubtleCrypto if available, otherwise fallback to simple string
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback: simple hash
  return normalized.replace(/[^a-z0-9]/g, '');
}

export const cacheRepo = {
  async get(companyId: string | null | undefined, providerKey: string, query: string) {
    const cid = getCompanyId(companyId);
    const queryHash = await hashQuery(query);
    const { data, error } = await supabase
      .from('rate_provider_cache')
      .select('*')
      .eq('company_id', cid)
      .eq('provider_key', providerKey)
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async set(companyId: string | null | undefined, providerKey: string, query: string, results: any[], ttlHours = 24) {
    const cid = getCompanyId(companyId);
    const queryHash = await hashQuery(query);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    const { error } = await supabase
      .from('rate_provider_cache')
      .upsert({
        company_id: cid,
        provider_key: providerKey,
        query_hash: queryHash,
        query_text: query,
        results,
        fetched_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'company_id,provider_key,query_hash',
      });
    if (error) throw error;
  },
};

