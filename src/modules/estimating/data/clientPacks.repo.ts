import { supabase } from '@/lib/supabase';
import { tokensRepo } from './tokens.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const clientPacksRepo = {
  async list(companyId: string | null | undefined, estimateId?: string) {
    const cid = getCompanyId(companyId);
    let query = supabase
      .from('client_packs')
      .select('*')
      .eq('company_id', cid);
    if (estimateId) {
      query = query.eq('estimate_id', estimateId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(companyId: string | null | undefined, packId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('client_packs')
      .select('*')
      .eq('company_id', cid)
      .eq('id', packId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(companyId: string | null | undefined, pack: {
    estimate_id: string;
    name: string;
    description?: string;
    contents: {
      quoteVersionId?: string;
      workOrderIds?: string[];
      purchaseOrderIds?: string[];
      attachments?: Array<{ url: string; label: string }>;
    };
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('client_packs')
      .insert({
        company_id: cid,
        ...pack,
      })
      .select('*')
      .single();
    if (error) throw error;

    // Create token for client pack
    const token = await tokensRepo.create(cid, 'client_pack', data.id, null);
    return { pack: data, token };
  },

  async findLatest(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('client_packs')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

