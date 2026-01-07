import { supabase } from '@/lib/supabase';
import type { ProviderQuote } from './Provider';

export type LiveSearchResult = {
  results: ProviderQuote[];
  sources: Array<{
    providerKey: string;
    count: number;
    cached: boolean;
  }>;
};

/**
 * Search live rates via Supabase Edge Function
 * Falls back to local search if edge function not available
 */
export async function searchLiveRates(
  companyId: string,
  query: string,
  limit = 20
): Promise<LiveSearchResult> {
  try {
    // Try to call edge function if available
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/rates-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        companyId,
        query,
        limit,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Edge function not available, using local search:', err);
  }

  // Fallback to local search
  const { materialsRepo } = await import('../repos/materials.repo');
  const localResults = await materialsRepo.search(companyId, query);
  
  return {
    results: localResults.slice(0, limit).map((r: any) => ({
      providerKey: 'seeded',
      code: r.code,
      name: r.name,
      unit: r.unit,
      cost: Number(r.base_cost || 0),
      currency: 'GBP' as const,
      fetchedAt: new Date().toISOString(),
    })),
    sources: [{ providerKey: 'seeded', count: localResults.length, cached: false }],
  };
}

