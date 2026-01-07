// Supabase Edge Function: rates-search
// Unified search endpoint for live rates
// 
// NOTE: This is a placeholder. For full implementation:
// 1. Deploy to Supabase: supabase functions deploy rates-search
// 2. Add secrets: supabase secrets set RATES_GENERIC_API_KEY=...
// 3. Update to use Deno runtime and Supabase client

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { companyId, query, limit = 20 } = await req.json();

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user and company membership
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get enabled providers
    const { data: providers } = await supabase
      .from('rate_providers')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_enabled', true);

    const results: any[] = [];
    const sources: Array<{ providerKey: string; count: number; cached: boolean }> = [];

    // Check cache first
    const queryHash = query.toLowerCase().trim().replace(/\s+/g, ' ');
    const { data: cached } = await supabase
      .from('rate_provider_cache')
      .select('*')
      .eq('company_id', companyId)
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      // Use cached results
      const cachedResults = cached.results || [];
      results.push(...cachedResults);
      sources.push({ providerKey: cached.provider_key, count: cachedResults.length, cached: true });
    } else {
      // Fetch from providers (placeholder - implement actual provider logic)
      // For now, return empty results
      // TODO: Implement SeededProvider, CsvImportProvider, GenericApiProvider logic
    }

    return new Response(
      JSON.stringify({ results, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

