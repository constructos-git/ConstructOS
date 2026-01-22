// Supabase Edge Function: address-lookup
// Proxies getAddress.io API calls to avoid CORS issues
//
// Deploy: supabase functions deploy address-lookup
// Set secret: supabase secrets set GETADDRESS_API_KEY=your-key-here

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { postcode } = await req.json();

    if (!postcode || typeof postcode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Postcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from environment
    const apiKey = Deno.env.get('GETADDRESS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if it's a domain token or API key
    const isDomainToken = apiKey.startsWith('dtoken_');
    const paramName = isDomainToken ? 'token' : 'api-key';

    // Format postcode (ensure space if needed)
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    const formattedPostcode = cleanPostcode.length > 5 
      ? `${cleanPostcode.slice(0, -3)} ${cleanPostcode.slice(-3)}`
      : cleanPostcode;

    // Call getAddress.io API
    const getAddressUrl = `https://api.getAddress.io/find/${encodeURIComponent(formattedPostcode)}?${paramName}=${apiKey}`;
    
    const response = await fetch(getAddressUrl);
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.Message || 'Failed to fetch addresses', status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
