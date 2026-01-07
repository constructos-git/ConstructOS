import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

function redactToken(token: string): string {
  if (!token || token.length < 6) return '***';
  return token.substring(0, 6) + '***';
}

export async function exportAuditBundle(companyId: string | null | undefined, estimateId: string) {
  const cid = getCompanyId(companyId);

  // Fetch all related data
  const [
    estimate,
    quoteVersions,
    tokens,
    acceptances,
    variations,
    _variationApprovals,
    clientPacks,
    portalEvents,
    workOrders,
    purchaseOrders,
    activity,
    approvals,
  ] = await Promise.all([
    supabase.from('estimates').select('*').eq('company_id', cid).eq('id', estimateId).single(),
    supabase.from('quote_versions').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('document_access_tokens').select('*').eq('company_id', cid).eq('document_id', estimateId),
    supabase.from('quote_acceptances').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('estimate_variations').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('variation_approvals').select('*').eq('company_id', cid).in('variation_id', []), // Will populate after variations
    supabase.from('client_packs').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('client_portal_events').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('work_orders').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('purchase_orders').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('estimating_activity').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
    supabase.from('estimating_approvals').select('*').eq('company_id', cid).eq('estimate_id', estimateId),
  ]);

  const variationsData = variations.data || [];
  const variationIds = variationsData.map((v) => v.id);

  // Fetch variation approvals with correct IDs
  const { data: variationApprovalsData } = await supabase
    .from('variation_approvals')
    .select('*')
    .eq('company_id', cid)
    .in('variation_id', variationIds);

  // Redact tokens
  const redactedTokens = (tokens.data || []).map((t) => ({
    ...t,
    token: redactToken(t.token),
  }));

  const bundle = {
    exportedAt: new Date().toISOString(),
    companyId: cid,
    estimateId,
    entities: {
      estimate: estimate.data,
      quoteVersions: quoteVersions.data || [],
      tokens: redactedTokens,
      acceptances: acceptances.data || [],
      variations: variationsData,
      variationApprovals: variationApprovalsData || [],
      clientPacks: clientPacks.data || [],
      portalEvents: portalEvents.data || [],
      workOrders: workOrders.data || [],
      purchaseOrders: purchaseOrders.data || [],
      activity: activity.data || [],
      approvals: approvals.data || [],
    },
    redactions: {
      tokens: 'First 6 characters shown, rest redacted',
    },
  };

  // Create download
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-bundle-${estimateId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

