// Versions Repository

import { supabase } from '@/lib/supabase';
import type { EstimateVersion } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const versionsRepo = {
  async list(companyId: string | null | undefined, estimateId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_versions')
      .select('*')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('version_number', { ascending: false });
    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      estimateId: row.estimate_id,
      versionNumber: row.version_number,
      snapshotJson: row.snapshot_json,
      createdAt: row.created_at,
      createdBy: row.created_by,
    })) as EstimateVersion[];
  },

  async get(companyId: string | null | undefined, versionId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_versions')
      .select('*')
      .eq('company_id', cid)
      .eq('id', versionId)
      .single();
    if (error) throw error;

    return {
      id: data.id,
      estimateId: data.estimate_id,
      versionNumber: data.version_number,
      snapshotJson: data.snapshot_json,
      createdAt: data.created_at,
      createdBy: data.created_by,
    } as EstimateVersion;
  },

  async create(companyId: string | null | undefined, estimateId: string, snapshot: EstimateVersion['snapshotJson']) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current max version number
    const { data: maxVersion } = await supabase
      .from('estimate_builder_ai_versions')
      .select('version_number')
      .eq('company_id', cid)
      .eq('estimate_id', estimateId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionNumber = maxVersion ? maxVersion.version_number + 1 : 1;

    const { data, error } = await supabase
      .from('estimate_builder_ai_versions')
      .insert({
        company_id: cid,
        estimate_id: estimateId,
        version_number: versionNumber,
        snapshot_json: snapshot,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (error) throw error;

    return {
      id: data.id,
      estimateId: data.estimate_id,
      versionNumber: data.version_number,
      snapshotJson: data.snapshot_json,
      createdAt: data.created_at,
      createdBy: data.created_by,
    } as EstimateVersion;
  },
};

