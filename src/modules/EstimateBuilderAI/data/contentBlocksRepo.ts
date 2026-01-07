// Content Blocks Repository

import { supabase } from '@/lib/supabase';
import type { ContentBlock } from '../domain/types';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const contentBlocksRepo = {
  async list(companyId: string | null | undefined, filters?: { type?: string; tags?: string[] }) {
    const cid = getCompanyId(companyId);
    let query = supabase
      .from('estimate_builder_ai_content_blocks')
      .select('*')
      .eq('company_id', cid);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query.order('title', { ascending: true });
    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      type: row.type as 'scope' | 'note' | 'exclusion' | 'ps_wording',
      title: row.title,
      body: row.body,
      iconKey: row.icon_key,
      tags: row.tags || [],
      isSeed: row.is_seed,
    })) as ContentBlock[];
  },

  async get(companyId: string | null | undefined, blockId: string) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimate_builder_ai_content_blocks')
      .select('*')
      .eq('company_id', cid)
      .eq('id', blockId)
      .single();
    if (error) throw error;

    return {
      id: data.id,
      type: data.type as 'scope' | 'note' | 'exclusion' | 'ps_wording',
      title: data.title,
      body: data.body,
      iconKey: data.icon_key,
      tags: data.tags || [],
      isSeed: data.is_seed,
    } as ContentBlock;
  },

  async create(companyId: string | null | undefined, block: Omit<ContentBlock, 'id' | 'isSeed'>) {
    const cid = getCompanyId(companyId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('estimate_builder_ai_content_blocks')
      .insert({
        company_id: cid,
        type: block.type,
        title: block.title,
        body: block.body,
        icon_key: block.iconKey || null,
        tags: block.tags || [],
        is_seed: false,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (error) throw error;

    return {
      id: data.id,
      type: data.type as 'scope' | 'note' | 'exclusion' | 'ps_wording',
      title: data.title,
      body: data.body,
      iconKey: data.icon_key,
      tags: data.tags || [],
      isSeed: data.is_seed,
    } as ContentBlock;
  },

  async update(companyId: string | null | undefined, blockId: string, updates: Partial<Omit<ContentBlock, 'id' | 'isSeed'>>) {
    const cid = getCompanyId(companyId);
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.body !== undefined) updateData.body = updates.body;
    if (updates.iconKey !== undefined) updateData.icon_key = updates.iconKey;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { data, error } = await supabase
      .from('estimate_builder_ai_content_blocks')
      .update(updateData)
      .eq('company_id', cid)
      .eq('id', blockId)
      .select('*')
      .single();
    if (error) throw error;

    return {
      id: data.id,
      type: data.type as 'scope' | 'note' | 'exclusion' | 'ps_wording',
      title: data.title,
      body: data.body,
      iconKey: data.icon_key,
      tags: data.tags || [],
      isSeed: data.is_seed,
    } as ContentBlock;
  },
};

