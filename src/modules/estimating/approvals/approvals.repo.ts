import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const approvalsRepo = {
  async list(companyId: string | null | undefined, subjectType: string, subjectId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimating_approvals')
      .select('*')
      .eq('company_id', cid)
      .eq('subject_type', subjectType)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
    return data ?? [];
  },

  async request(companyId: string | null | undefined, payload: {
    subjectType: 'estimate' | 'variation';
    subjectId: string;
    estimateId?: string;
    requestedTo: string;
    message?: string;
  }) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('estimating_approvals')
      .insert({
        company_id: cid,
        subject_type: payload.subjectType,
        subject_id: payload.subjectId,
        estimate_id: payload.estimateId || null,
        requested_by: user?.id || null,
        requested_to: payload.requestedTo,
        request_message: payload.message || null,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async decide(companyId: string | null | undefined, approvalId: string, status: 'approved' | 'rejected', message?: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimating_approvals')
      .update({
        status,
        decision_message: message || null,
        decided_at: new Date().toISOString(),
      })
      .eq('company_id', cid)
      .eq('id', approvalId);
    if (error) throw error;
  },

  async cancel(companyId: string | null | undefined, approvalId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimating_approvals')
      .update({ status: 'cancelled' })
      .eq('company_id', cid)
      .eq('id', approvalId);
    if (error) throw error;
  },
};

