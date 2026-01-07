import { supabase } from '@/lib/supabase';
import { workOrdersRepo } from './workOrders.repo';
import { purchaseOrdersRepo } from './purchaseOrders.repo';
import { activityRepo } from './activity.repo';
import { groupRulesRepo } from './groupRules.repo';
import { snapshotsRepo } from './snapshots.repo';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export const conversionRepo = {
  async convertAcceptedVersionToProject(companyId: string | null | undefined, estimateId: string, versionId: string) {
    const cid = getCompanyId(companyId);
    // Load version
    const { data: ver, error: vErr } = await supabase
      .from('quote_versions')
      .select('*')
      .eq('company_id', cid)
      .eq('id', versionId)
      .single();
    if (vErr) throw vErr;

    // Create project record (adapt if ConstructOS has projectsRepo)
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .insert({
        company_id: cid,
        name: `Project — ${ver.intro_title || 'Accepted Quote'} (Estimate ${estimateId})`,
        status: 'active',
      })
      .select('*')
      .single();
    if (pErr) throw pErr;

    // Link estimate to project
    const { error: linkErr } = await supabase
      .from('estimates')
      .update({
        converted_project_id: project.id,
        converted_at: new Date().toISOString(),
        converted_from_quote_version_id: versionId,
        status: 'won',
      })
      .eq('company_id', cid)
      .eq('id', estimateId);
    if (linkErr) throw linkErr;

    // Use grouping rules to organize items
    const items = Array.isArray(ver.items_snapshot) ? ver.items_snapshot : [];
    const sections = Array.isArray(ver.sections_snapshot) ? ver.sections_snapshot : [];
    const groupingPlan = await groupRulesRepo.resolve(cid, items, sections);

    // Create Work Orders from grouping plan
    for (const woGroup of groupingPlan.workOrders) {
      const groupItems = items.filter((i: any) => woGroup.itemIds.includes(i.id));
      if (groupItems.length === 0) continue;

      // Calculate totals
      const subtotal = groupItems.reduce((sum, i: any) => sum + Number(i.line_total || 0), 0);
      const vatRate = Number(ver.vat_rate ?? 0);
      const vatAmount = subtotal * (vatRate / 100);
      const total = subtotal + vatAmount;

      // Create WO header
      const { data: wo, error: woErr } = await supabase
        .from('work_orders')
        .insert({
          company_id: cid,
          estimate_id: estimateId,
          title: woGroup.title,
          status: 'draft',
          assigned_to_name: woGroup.partyName,
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total,
        })
        .select('*')
        .single();
      if (woErr) throw woErr;

      // Create snapshot lines
      await snapshotsRepo.createWorkOrderSnapshots(cid, wo.id, versionId, groupItems);
    }

    // Create Purchase Orders from grouping plan
    for (const poGroup of groupingPlan.purchaseOrders) {
      const groupItems = items.filter((i: any) => poGroup.itemIds.includes(i.id));
      if (groupItems.length === 0) continue;

      // Calculate totals
      const subtotal = groupItems.reduce((sum, i: any) => sum + Number(i.line_total || 0), 0);
      const vatRate = Number(ver.vat_rate ?? 0);
      const vatAmount = subtotal * (vatRate / 100);
      const total = subtotal + vatAmount;

      // Create PO header
      const { data: po, error: poErr } = await supabase
        .from('purchase_orders')
        .insert({
          company_id: cid,
          estimate_id: estimateId,
          title: poGroup.title,
          status: 'draft',
          supplier_name: poGroup.partyName,
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total,
        })
        .select('*')
        .single();
      if (poErr) throw poErr;

      // Create snapshot lines
      await snapshotsRepo.createPurchaseOrderSnapshots(cid, po.id, versionId, groupItems);
    }

    await activityRepo.log(cid, estimateId, 'estimate', estimateId, 'converted', 'Estimate converted to project.', {
      project_id: project.id,
      quote_version_id: versionId,
      version_number: ver.version_number,
    });

    return project;
  },
};

