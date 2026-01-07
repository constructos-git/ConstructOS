import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const acceptancesRepo = {
  async listByEstimate(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('quote_acceptances')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('accepted_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async submitPublic(token: string, payload: {
    name: string;
    email: string;
    notes?: string;
    declarations: any;
    signaturePngBase64?: string;
    signatureSha256?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const { data, error } = await supabase.rpc('submit_quote_acceptance', {
      p_token: token,
      p_name: payload.name,
      p_email: payload.email,
      p_notes: payload.notes ?? '',
      p_declarations: payload.declarations || {},
      p_signature_png_base64: payload.signaturePngBase64 || null,
      p_signature_sha256: payload.signatureSha256 || null,
      p_ip: payload.ip ?? '',
      p_user_agent: payload.userAgent ?? '',
    });
    if (error) throw error;
    return data;
  },

  async withdraw(companyId: string | null | undefined, acceptanceId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('quote_acceptances')
      .update({ is_withdrawn: true })
      .eq('company_id', cid)
      .eq('id', acceptanceId);
    if (error) throw error;
  },
};

