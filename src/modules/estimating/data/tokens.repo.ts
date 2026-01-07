import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

function randomToken(len = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const tokensRepo = {
  async getActive(companyId: string | null | undefined, documentType: 'work_order' | 'purchase_order' | 'quote', documentId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('document_access_tokens')
      .select('*')
      .eq('company_id', cid)
      .eq('document_type', documentType)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
  },

  async getActiveForVersion(companyId: string | null | undefined, quoteVersionId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('document_access_tokens')
      .select('*')
      .eq('company_id', cid)
      .eq('document_type', 'quote')
      .eq('quote_version_id', quoteVersionId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0] ?? null;
  },

  async create(companyId: string | null | undefined, documentType: 'work_order' | 'purchase_order' | 'quote' | 'variation' | 'client_pack', documentId: string, expiresAt: string | null, quoteVersionId?: string | null) {
    const cid = getCompanyId(companyId);
    const token = randomToken(48);
    const { data, error } = await supabase
      .from('document_access_tokens')
      .insert({
        company_id: cid,
        document_type: documentType,
        document_id: documentId,
        token,
        expires_at: expiresAt,
        quote_version_id: quoteVersionId ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async createQuoteToken(companyId: string | null | undefined, estimateId: string, quoteVersionId: string, expiresAt: string | null) {
    return this.create(companyId, 'quote', estimateId, expiresAt, quoteVersionId);
  },

  async revoke(companyId: string | null | undefined, tokenId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('document_access_tokens')
      .delete()
      .eq('company_id', cid)
      .eq('id', tokenId);
    if (error) throw error;
  },

  // Public fetch via RPC (works for anon if function permissions allow)
  async fetchWorkOrderPublic(token: string) {
    const { data, error } = await supabase.rpc('get_work_order_by_token', { p_token: token });
    if (error) throw error;
    return data;
  },

  async fetchPurchaseOrderPublic(token: string) {
    const { data, error } = await supabase.rpc('get_purchase_order_by_token', { p_token: token });
    if (error) throw error;
    return data;
  },

  async fetchQuotePublic(token: string) {
    // Try new version-based endpoint first
    const { data: versionData, error: versionErr } = await supabase.rpc('get_quote_version_by_token', { p_token: token });
    if (!versionErr && versionData) {
      return versionData;
    }
    // Fallback to old endpoint for backwards compatibility
    const { data, error } = await supabase.rpc('get_quote_by_token', { p_token: token });
    if (error) throw error;
    return data;
  },
};

