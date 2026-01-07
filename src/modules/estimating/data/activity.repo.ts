import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const activityRepo = {
  async list(companyId: string | null | undefined, documentType: string, documentId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimating_activity')
      .select('*')
      .eq('company_id', cid)
      .eq('document_type', documentType)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  },

  async log(companyId: string | null | undefined, estimateId: string | null, documentType: string, documentId: string, action: string, message?: string, metadata?: any) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase.from('estimating_activity').insert({
      company_id: cid,
      estimate_id: estimateId,
      document_type: documentType,
      document_id: documentId,
      action,
      message: message ?? null,
      metadata: metadata ?? {},
    });
    if (error) throw error;
  },
};

