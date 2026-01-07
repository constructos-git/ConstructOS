import { supabase } from '@/lib/supabase';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export interface GroupingPlan {
  workOrders: Array<{
    partyName: string;
    title: string;
    itemIds: string[];
  }>;
  purchaseOrders: Array<{
    partyName: string;
    title: string;
    itemIds: string[];
  }>;
}

export const groupRulesRepo = {
  async list(companyId: string | null | undefined, ruleType?: 'work_order' | 'purchase_order') {
    const cid = getCompanyId(companyId);
    let query = supabase
      .from('estimating_group_rules')
      .select('*')
      .eq('company_id', cid)
      .eq('is_enabled', true)
      .order('priority', { ascending: true });
    if (ruleType) {
      query = query.eq('rule_type', ruleType);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async create(companyId: string | null | undefined, payload: {
    rule_type: 'work_order' | 'purchase_order';
    match_item_type?: string;
    match_section_contains?: string;
    match_title_contains?: string;
    match_tag_contains?: string;
    target_party_name: string;
    target_document_title?: string;
    priority?: number;
  }) {
    const cid = getCompanyId(companyId);
    const { data, error } = await supabase
      .from('estimating_group_rules')
      .insert({
        company_id: cid,
        rule_type: payload.rule_type,
        match_item_type: payload.match_item_type ?? null,
        match_section_contains: payload.match_section_contains ?? null,
        match_title_contains: payload.match_title_contains ?? null,
        match_tag_contains: payload.match_tag_contains ?? null,
        target_party_name: payload.target_party_name,
        target_document_title: payload.target_document_title ?? null,
        priority: payload.priority ?? 100,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(companyId: string | null | undefined, ruleId: string, payload: Partial<{
    is_enabled: boolean;
    priority: number;
    match_item_type: string;
    match_section_contains: string;
    match_title_contains: string;
    match_tag_contains: string;
    target_party_name: string;
    target_document_title: string;
  }>) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimating_group_rules')
      .update(payload)
      .eq('company_id', cid)
      .eq('id', ruleId);
    if (error) throw error;
  },

  async remove(companyId: string | null | undefined, ruleId: string) {
    const cid = getCompanyId(companyId);
    const { error } = await supabase
      .from('estimating_group_rules')
      .delete()
      .eq('company_id', cid)
      .eq('id', ruleId);
    if (error) throw error;
  },

  async resolve(companyId: string | null | undefined, itemsSnapshot: any[], sectionsSnapshot: any[]): Promise<GroupingPlan> {
    const cid = getCompanyId(companyId);
    const rules = await this.list(cid);

    const workOrderGroups: Record<string, string[]> = {};
    const purchaseOrderGroups: Record<string, string[]> = {};

    const sectionMap: Record<string, any> = {};
    for (const s of sectionsSnapshot) {
      sectionMap[s.id] = s;
    }

    for (const item of itemsSnapshot) {
      const section = sectionMap[item.section_id];
      const sectionTitle = section?.title ?? '';

      let matched = false;
      for (const rule of rules) {
        if (rule.rule_type !== 'work_order' && rule.rule_type !== 'purchase_order') continue;

        // Check all matchers
        if (rule.match_item_type && item.item_type !== rule.match_item_type) continue;
        if (rule.match_title_contains && !item.title?.toLowerCase().includes(rule.match_title_contains.toLowerCase())) continue;
        if (rule.match_section_contains && !sectionTitle.toLowerCase().includes(rule.match_section_contains.toLowerCase())) continue;
        if (rule.match_tag_contains && !String(item.tags || '').includes(rule.match_tag_contains)) continue;

        // Matched!
        const key = rule.target_party_name;
        if (rule.rule_type === 'work_order') {
          if (!workOrderGroups[key]) workOrderGroups[key] = [];
          workOrderGroups[key].push(item.id);
        } else {
          if (!purchaseOrderGroups[key]) purchaseOrderGroups[key] = [];
          purchaseOrderGroups[key].push(item.id);
        }
        matched = true;
        break;
      }

      // Fallback groups
      if (!matched) {
        if (['labour', 'subcontract'].includes(item.item_type)) {
          const key = 'Unassigned Labour';
          if (!workOrderGroups[key]) workOrderGroups[key] = [];
          workOrderGroups[key].push(item.id);
        } else if (['material', 'plant'].includes(item.item_type)) {
          const key = 'Unassigned Materials';
          if (!purchaseOrderGroups[key]) purchaseOrderGroups[key] = [];
          purchaseOrderGroups[key].push(item.id);
        }
      }
    }

    return {
      workOrders: Object.entries(workOrderGroups).map(([partyName, itemIds]) => ({
        partyName,
        title: rules.find((r) => r.target_party_name === partyName)?.target_document_title || `${partyName} Work Order`,
        itemIds,
      })),
      purchaseOrders: Object.entries(purchaseOrderGroups).map(([partyName, itemIds]) => ({
        partyName,
        title: rules.find((r) => r.target_party_name === partyName)?.target_document_title || `${partyName} Purchase Order`,
        itemIds,
      })),
    };
  },
};

