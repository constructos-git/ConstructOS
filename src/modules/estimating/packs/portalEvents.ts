import { supabase } from '@/lib/supabase';
import { clientPacksRepo } from '../data/clientPacks.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const portalEvents = {
  async findLatestClientPack(companyId: string | null | undefined, estimateId: string) {
    return clientPacksRepo.findLatest(companyId, estimateId);
  },

  async addPortalEvent(
    companyId: string | null | undefined,
    packId: string,
    eventType: string,
    message?: string,
    metadata?: Record<string, any>
  ) {
    const cid = getCompanyId(companyId);
    const pack = await clientPacksRepo.getById(companyId, packId);
    if (!pack) return;

    const { error } = await supabase
      .from('client_portal_events')
      .insert({
        company_id: cid,
        estimate_id: pack.estimate_id,
        client_pack_id: packId,
        token_used: '', // Will be set when accessed via token
        event_type: eventType,
        event_message: message || null,
        metadata: metadata || {},
      });
    if (error) throw error;
  },
};

