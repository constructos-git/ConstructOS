import { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { estimatesRepo } from '../data/estimates.repo';
import { estimateSectionsRepo } from '../data/estimateSections.repo';
import { estimateItemsRepo } from '../data/estimateItems.repo';
import { assembliesRepo } from '../data/assemblies.repo';
import { calculatorRegistryRepo } from '../data/calculatorRegistry.repo';
import { SectionsPanel } from './SectionsPanel';
import { ItemsTable } from './ItemsTable';
import { ItemDrawer } from './ItemDrawer';
import { AssembliesPanel } from './AssembliesPanel';
import { CalculatorRunner } from './CalculatorRunner';
import { QuotePreviewPanel } from './QuotePreviewPanel';
import { DocumentsPanel } from './DocumentsPanel';
import { CreateDocumentModal } from './CreateDocumentModal';
import { WorkOrderDetailModal } from './WorkOrderDetailModal';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { workOrdersRepo } from '../data/workOrders.repo';
import { purchaseOrdersRepo } from '../data/purchaseOrders.repo';
import { activityRepo } from '../data/activity.repo';
import { quoteRepo } from '../data/quote.repo';
import { brandingRepo } from '../data/branding.repo';
import { seedAssemblies } from '../domain/estimating.seed';
import { QuoteEditorPanel } from './QuoteEditorPanel';
import { QuotePreview } from './QuotePreview';
import { QuoteSendPanel } from './QuoteSendPanel';
import { QuotePdf } from './pdf/QuotePdf';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QuoteTemplatesPanel } from './QuoteTemplatesPanel';
import { ApplyTemplateModal } from './ApplyTemplateModal';
import { AcceptanceStatusCard } from './AcceptanceStatusCard';
import { estimateTemplatesRepo } from '../data/templates.repo';
import { acceptancesRepo } from '../data/acceptances.repo';
import { versionsRepo } from '../data/versions.repo';
import { QuoteVersionsPanel } from './QuoteVersionsPanel';
import { CreateRevisionModal } from './CreateRevisionModal';
import { ConvertToProjectPanel } from './ConvertToProjectPanel';
import { tokensRepo } from '../data/tokens.repo';
import { settingsRepo } from '../rates/repos/settings.repo';
import { overridesRepo } from '../rates/repos/overrides.repo';
import { computeEstimateTotals } from '../rates/engine/pricingEngine';
import type { PricingSettings, LineInput } from '../rates/engine/types';
import { ApprovalsPanel } from '../approvals/ApprovalsPanel';
import { AuditExportButton } from '../audit/AuditExportButton';
import { WorkflowStatusControl } from './WorkflowStatusControl';

// Shared company ID for internal single-tenant system
const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function EstimateBuilderInner() {
  const { estimateId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = usePermissionsStore();
  // Try to get from permissions store, fallback to shared ID
  const companyId = (currentUser as any)?.companyId || SHARED_COMPANY_ID;

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [drawerItem, setDrawerItem] = useState<any | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [activeCalc, setActiveCalc] = useState<any | null>(null);

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docKind, setDocKind] = useState<'work_order' | 'purchase_order'>('work_order');

  const [woOpen, setWoOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);

  const [activeWoId, setActiveWoId] = useState<string | null>(null);
  const [activePoId, setActivePoId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'builder' | 'quote'>('builder');

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [openVersionId, setOpenVersionId] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const estimateQ = useQuery({
    queryKey: ['estimate', companyId, estimateId],
    queryFn: () => estimatesRepo.getById(estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  // Update title value when estimate changes
  useEffect(() => {
    if (estimateQ.data?.title) {
      setTitleValue(estimateQ.data.title);
    }
  }, [estimateQ.data?.title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const updateTitleMutation = useMutation({
    mutationFn: (newTitle: string) => estimatesRepo.update(estimateId as string, { title: newTitle }),
    onSuccess: () => {
      estimateQ.refetch();
      setIsEditingTitle(false);
    },
    onError: (error) => {
      console.error('Failed to update estimate title:', error);
      alert('Failed to update estimate title. Please try again.');
      setTitleValue(estimateQ.data?.title || '');
    },
  });

  const handleTitleClick = () => {
    if (!isEditingTitle) {
      setIsEditingTitle(true);
      setTitleValue(estimateQ.data?.title || '');
    }
  };

  const handleTitleSave = () => {
    const trimmedTitle = titleValue.trim();
    if (trimmedTitle && trimmedTitle !== estimateQ.data?.title) {
      updateTitleMutation.mutate(trimmedTitle);
    } else {
      setTitleValue(estimateQ.data?.title || '');
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(estimateQ.data?.title || '');
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  const sectionsQ = useQuery({
    queryKey: ['estimateSections', companyId, estimateId],
    queryFn: () => estimateSectionsRepo.list(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const itemsQ = useQuery({
    queryKey: ['estimateItems', companyId, estimateId],
    queryFn: () => estimateItemsRepo.list(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const assembliesQ = useQuery({
    queryKey: ['assemblies', companyId],
    queryFn: () => assembliesRepo.list(companyId),
    enabled: !!companyId,
  });

  const calculatorsQ = useQuery({
    queryKey: ['calculatorRegistry', companyId],
    queryFn: async () => {
      await calculatorRegistryRepo.seed(companyId);
      return calculatorRegistryRepo.list(companyId);
    },
    enabled: !!companyId,
  });

  const workOrdersQ = useQuery({
    queryKey: ['workOrders', companyId, estimateId],
    queryFn: () => workOrdersRepo.listByEstimate(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const purchaseOrdersQ = useQuery({
    queryKey: ['purchaseOrders', companyId, estimateId],
    queryFn: () => purchaseOrdersRepo.listByEstimate(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const woDetailQ = useQuery({
    queryKey: ['workOrderDetail', companyId, activeWoId],
    queryFn: () => workOrdersRepo.getWithLines(companyId, activeWoId as string),
    enabled: !!companyId && !!activeWoId,
  });

  const poDetailQ = useQuery({
    queryKey: ['purchaseOrderDetail', companyId, activePoId],
    queryFn: () => purchaseOrdersRepo.getWithLines(companyId, activePoId as string),
    enabled: !!companyId && !!activePoId,
  });

  const quoteQ = useQuery({
    queryKey: ['quote', companyId, estimateId],
    queryFn: () => quoteRepo.getOrCreate(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const brandingQ = useQuery({
    queryKey: ['branding', companyId],
    queryFn: () => brandingRepo.getOrCreate(companyId),
    enabled: !!companyId,
  });

  const templatesQ = useQuery({
    queryKey: ['templates', companyId],
    queryFn: () => estimateTemplatesRepo.list(companyId),
    enabled: !!companyId,
  });

  const acceptancesQ = useQuery({
    queryKey: ['acceptances', companyId, estimateId],
    queryFn: () => acceptancesRepo.listByEstimate(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const versionsQ = useQuery({
    queryKey: ['quoteVersions', companyId, estimateId],
    queryFn: () => versionsRepo.list(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  const settingsQ = useQuery({
    queryKey: ['estimatingSettings', companyId],
    queryFn: () => settingsRepo.getOrCreate(companyId),
    enabled: !!companyId,
  });

  const overridesQ = useQuery({
    queryKey: ['estimateOverrides', companyId, estimateId],
    queryFn: () => overridesRepo.getOrCreate(companyId, estimateId as string),
    enabled: !!companyId && !!estimateId,
  });

  // Get effective settings (company + estimate overrides)
  const effectiveSettings = useMemo((): PricingSettings | null => {
    if (!settingsQ.data) return null;
    const base = settingsQ.data;
    const overrides = overridesQ.data;
    return {
      vatRate: overrides?.vat_rate ?? base.vat_rate,
      labourBurdenPct: overrides?.labour_burden_pct ?? base.labour_burden_pct,
      overheadPct: overrides?.overhead_pct ?? base.overhead_pct,
      marginPct: overrides?.margin_pct ?? base.margin_pct,
      roundingMode: (overrides?.rounding_mode ?? base.rounding_mode) as any,
      pricingMode: (overrides?.pricing_mode ?? base.pricing_mode) as any,
      wastageDefaults: (overrides?.wastage_defaults ?? base.wastage_defaults) as Record<string, number> || {},
    };
  }, [settingsQ.data, overridesQ.data]);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const estimate = estimateQ.data ?? null;
  const sections = sectionsQ.data ?? [];
  const items = itemsQ.data ?? [];
  const assemblies = assembliesQ.data ?? [];
  const calculators = calculatorsQ.data ?? [];
  const workOrders = workOrdersQ.data ?? [];
  const purchaseOrders = purchaseOrdersQ.data ?? [];

  useEffect(() => {
    if (!activeSectionId && sections.length) setActiveSectionId(sections[0].id);
  }, [sections, activeSectionId]);

  const filteredItems = useMemo(() => {
    if (!activeSectionId) return items;
    return items.filter((i: any) => i.section_id === activeSectionId);
  }, [items, activeSectionId]);

  const totals = useMemo(() => {
    // Use pricing engine if settings available
    if (effectiveSettings) {
      const lineInputs: LineInput[] = items.map((it: any) => ({
        itemType: it.item_type as any,
        category: undefined, // TODO: add category to items
        quantity: Number(it.quantity || 0),
        unitCost: Number(it.unit_cost || 0),
      }));
      const result = computeEstimateTotals(effectiveSettings, lineInputs);
      return {
        subtotal: Number(result.subtotalExVat.toFixed(2)),
        vat: Number(result.vat.toFixed(2)),
        total: Number(result.total.toFixed(2)),
      };
    }
    // Fallback to simple calculation
    const subtotal = items.reduce((acc: number, it: any) => acc + Number(it.line_total || 0), 0);
    const vatRate = Number(estimate?.vat_rate ?? 20);
    const vat = subtotal * (vatRate / 100);
    const total = subtotal + vat;
    return {
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }, [items, estimate?.vat_rate, effectiveSettings]);

  // Persist totals to estimates
  const persistTotals = useMutation({
    mutationFn: async () => {
      if (!companyId || !estimateId) return;
      const { error } = await supabase
        .from('estimates')
        .update({ subtotal: totals.subtotal, vat_amount: totals.vat, total: totals.total })
        .eq('company_id', companyId)
        .eq('id', estimateId);
      if (error) throw error;
    },
  });

  useEffect(() => {
    if (!estimate) return;
    const changed =
      Number(estimate.subtotal || 0) !== totals.subtotal ||
      Number(estimate.vat_amount || 0) !== totals.vat ||
      Number(estimate.total || 0) !== totals.total;
    if (changed) persistTotals.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.subtotal, totals.vat, totals.total]);

  const addSection = useMutation({
    mutationFn: () => estimateSectionsRepo.create(companyId, estimateId as string, `Section ${sections.length + 1}`, sections.length),
    onSuccess: () => sectionsQ.refetch(),
  });

  const addItem = useMutation({
    mutationFn: () => estimateItemsRepo.create(companyId, estimateId as string, activeSectionId, items.length),
    onSuccess: () => itemsQ.refetch(),
  });

  const ensureSeeded = useMutation({
    mutationFn: async () => {
      // Seed assemblies if none
      if (!companyId) return;

      const existingAssemblies = await assembliesRepo.list(companyId);
      if (existingAssemblies.length === 0) {
        for (const a of seedAssemblies as any) {
          const created = await assembliesRepo.createAssembly(companyId, a.name, a.category, a.description);
          for (const it of a.items) {
            await assembliesRepo.addAssemblyItem(companyId, created.id, it);
          }
        }
      }

      // Calculators are now seeded via calculatorRegistryRepo.seed() in the query
    },
    onSuccess: async () => {
      await assembliesQ.refetch();
      await calculatorsQ.refetch();
    },
  });

  useEffect(() => {
    if (companyId) ensureSeeded.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  if (!companyId) return <div className="text-sm text-slate-600">Loading company context…</div>;
  if (estimateQ.isLoading) return <div className="text-sm text-slate-600">Loading estimate…</div>;
  if (!estimate) return <div className="text-sm text-red-600">Estimate not found.</div>;

  const quote = quoteQ.data;
  const brandingDefaults = brandingQ.data;

  return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/estimating/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500">Estimate</div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="text-base font-semibold bg-background border border-primary rounded px-2 py-1"
                    style={{ minWidth: '600px', maxWidth: '800px' }}
                    disabled={updateTitleMutation.isPending}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleTitleSave}
                    disabled={updateTitleMutation.isPending}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleTitleCancel}
                    disabled={updateTitleMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="text-base font-semibold cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  onClick={handleTitleClick}
                  title="Click to edit"
                >
                  {estimate.title}
                </div>
              )}
              <div className="text-xs text-slate-500">
                Status: {estimate.status}
              </div>
            </div>
            <div className="flex gap-2">
              <AuditExportButton companyId={companyId} estimateId={estimateId as string} />
            </div>
          </div>
          <WorkflowStatusControl
            companyId={companyId}
            estimateId={estimateId as string}
            currentStatus={estimate.status}
            onStatusChanged={() => estimateQ.refetch()}
          />
        </Card>

        <div className="flex items-center gap-2 border-b">
          <div className="flex gap-2">
            {activeTab === 'builder' && (
              <>
                <Button size="sm" variant="secondary" onClick={() => addSection.mutate()}>Add section</Button>
                <Button size="sm" onClick={() => addItem.mutate()}>Add item</Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    if (!effectiveSettings) {
                      alert('Settings not loaded yet');
                      return;
                    }
                    setRecalculating(true);
                    try {
                      const lineInputs: LineInput[] = items.map((it) => ({
                        itemType: it.item_type as any,
                        category: undefined,
                        quantity: Number(it.quantity || 0),
                        unitCost: Number(it.unit_cost || 0),
                      }));
                      const result = computeEstimateTotals(effectiveSettings, lineInputs);
                      await supabase
                        .from('estimates')
                        .update({
                          subtotal: result.subtotalExVat,
                          vat_amount: result.vat,
                          total: result.total,
                        })
                        .eq('company_id', companyId)
                        .eq('id', estimateId);
                      await estimateQ.refetch();
                    } catch (error) {
                      console.error('Failed to recalculate:', error);
                      alert('Failed to recalculate totals');
                    } finally {
                      setRecalculating(false);
                    }
                  }}
                  disabled={recalculating}
                >
                  {recalculating ? 'Recalculating...' : 'Recalculate Totals'}
                </Button>
              </>
            )}
          </div>
        </div>

      <div className="flex items-center gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'builder' ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}
          onClick={() => setActiveTab('builder')}
          type="button"
        >
          Builder
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'quote' ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}
          onClick={() => setActiveTab('quote')}
          type="button"
        >
          Quote
        </button>
      </div>

      {activeTab === 'quote' ? (
        <>
          <div className="flex h-[calc(100vh-12rem)] gap-4">
            <div className="w-64 space-y-3 overflow-y-auto">
              <AcceptanceStatusCard
                acceptance={acceptancesQ.data?.find((a) => !a.is_withdrawn) ?? null}
                onWithdraw={async () => {
                  const activeAcc = acceptancesQ.data?.find((a) => !a.is_withdrawn);
                  if (!activeAcc) return;
                  await acceptancesRepo.withdraw(companyId, activeAcc.id);
                  await supabase
                    .from('estimates')
                    .update({ status: 'sent' })
                    .eq('company_id', companyId)
                    .eq('id', estimateId);
                  await activityRepo.log(companyId, estimateId || null, 'estimate', estimateId as string, 'acceptance_withdrawn', 'Acceptance withdrawn');
                  await acceptancesQ.refetch();
                  await estimateQ.refetch();
                }}
              />
              {acceptancesQ.data?.[0] && (
                <Card className="p-3 bg-amber-50">
                  <div className="text-xs text-amber-800">Quote accepted — consider creating a revision for changes.</div>
                </Card>
              )}
              <QuoteSendPanel
                companyId={companyId}
                estimateId={estimateId as string}
                versions={versionsQ.data ?? []}
                onSent={async () => {
                  await estimateQ.refetch();
                  await acceptancesQ.refetch();
                  await versionsQ.refetch();
                }}
              />
              <div className="p-3">
                <Button className="w-full" size="sm" variant="secondary" onClick={() => setRevisionModalOpen(true)}>
                  Create revision
                </Button>
              </div>
              <QuoteVersionsPanel
                versions={versionsQ.data ?? []}
                onOpen={async (versionId) => {
                  setOpenVersionId(versionId);
                }}
                onSend={async (versionId) => {
                  const tokenRow = await tokensRepo.createQuoteToken(companyId, estimateId as string, versionId, null);
                  const url = `${window.location.origin}/shared/quote/${tokenRow.token}`;
                  await navigator.clipboard.writeText(url);
                  await versionsRepo.markStatus(companyId, versionId, 'sent');
                  await supabase
                    .from('estimates')
                    .update({ status: 'sent' })
                    .eq('company_id', companyId)
                    .eq('id', estimateId);
                  const version = await versionsRepo.get(companyId, versionId);
                  await activityRepo.log(companyId, estimateId || null, 'estimate', estimateId as string, 'sent', 'Quote version link generated', { url, version_number: version.version_number });
                  await versionsQ.refetch();
                  await estimateQ.refetch();
                }}
              />
              {(() => {
                const activeAcc = acceptancesQ.data?.find((a) => !a.is_withdrawn);
                const acceptedVersionId = activeAcc?.quote_version_id ?? null;
                return (
                  <ConvertToProjectPanel
                    companyId={companyId}
                    estimateId={estimateId as string}
                    acceptedVersionId={acceptedVersionId}
                    disabledReason={estimate.converted_project_id ? 'Already converted to project' : undefined}
                    onConverted={async () => {
                      await estimateQ.refetch();
                      await versionsQ.refetch();
                    }}
                  />
                );
              })()}
              {quote && (
                <div className="p-3">
                  <PDFDownloadLink
                    document={<QuotePdf estimate={estimate} quote={quote} sections={sections} items={items} />}
                    fileName={`Quote-${estimateId}.pdf`}
                  >
                    {({ loading }) => (
                      <Button className="w-full" size="sm" variant="secondary" disabled={loading}>
                        {loading ? 'Preparing…' : 'Download PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              )}
              <div className="p-3">
                <Button className="w-full" size="sm" variant="secondary" onClick={() => setTemplateModalOpen(true)}>
                  Apply template
                </Button>
              </div>
              <QuoteTemplatesPanel
                templates={templatesQ.data ?? []}
                onCreate={async (payload) => {
                  await templatesRepo.create(companyId, payload);
                  await templatesQ.refetch();
                }}
                onDelete={async (id) => {
                  await estimateTemplatesRepo.remove(companyId, id);
                  await templatesQ.refetch();
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {quote && brandingDefaults && (
                <>
                  <QuoteEditorPanel
                    quote={quote}
                    brandingDefaults={brandingDefaults}
                    onSave={async (patch) => {
                      await quoteRepo.update(companyId, estimateId as string, patch);
                      await quoteQ.refetch();
                      await activityRepo.log(companyId, estimateId || null, 'estimate', estimateId as string, 'updated', 'Quote updated');
                    }}
                  />
                  <QuotePreview
                    estimate={estimate}
                    quote={quote}
                    sections={sections}
                    items={items}
                    version={openVersionId ? versionsQ.data?.find((v) => v.id === openVersionId) : undefined}
                  />
                </>
              )}
            </div>
          </div>

          <ApplyTemplateModal
            open={templateModalOpen}
            templates={templatesQ.data ?? []}
            onClose={() => setTemplateModalOpen(false)}
            onApply={async (templateId) => {
              const template = templatesQ.data?.find((t) => t.id === templateId);
              if (!template) return;
              await quoteRepo.applyTemplate(companyId, estimateId as string, template);
              await quoteQ.refetch();
              await activityRepo.log(companyId, estimateId || null, 'estimate', estimateId as string, 'updated', `Template applied: ${template.name}`);
            }}
          />
          <CreateRevisionModal
            open={revisionModalOpen}
            onClose={() => setRevisionModalOpen(false)}
            onCreate={async (label) => {
              await versionsRepo.createRevision(companyId, estimateId as string, { label });
              await versionsQ.refetch();
              await activityRepo.log(companyId, estimateId || null, 'estimate', estimateId as string, 'revision_created', `Revision created: ${label}`);
            }}
          />
        </>
      ) : (
        <>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3 space-y-4">
          <SectionsPanel
            sections={sections}
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
            onAdd={() => addSection.mutate()}
            onRename={async (id, title) => {
              await estimateSectionsRepo.rename(companyId, id, title);
              await sectionsQ.refetch();
            }}
            onDelete={async (id) => {
              await estimateSectionsRepo.remove(companyId, id);
              await sectionsQ.refetch();
              if (activeSectionId === id) setActiveSectionId(null);
            }}
            onEditNarrative={async (id, narrativeRich) => {
              await estimateSectionsRepo.updateNarrative(companyId, id, narrativeRich);
              await sectionsQ.refetch();
            }}
            onUpdateSection={async (id, patch) => {
              await estimateSectionsRepo.update(companyId, id, patch);
              await sectionsQ.refetch();
            }}
          />

          <AssembliesPanel
            assemblies={assemblies}
            calculators={calculators}
            activeSectionId={activeSectionId}
            onApplyAssembly={async (assemblyId, vars) => {
              await assembliesRepo.applyToEstimate(companyId, estimateId as string, activeSectionId, assemblyId, vars);
              await itemsQ.refetch();
            }}
            onRunCalculator={(c) => {
              setActiveCalc(c);
              setCalcOpen(true);
            }}
          />

          <QuotePreviewPanel estimate={estimate} totals={totals} />

                <DocumentsPanel
                  workOrders={workOrders}
                  purchaseOrders={purchaseOrders}
                  onCreate={(kind) => { setDocKind(kind); setDocModalOpen(true); }}
                  onOpenWorkOrder={(id) => { setActiveWoId(id); setWoOpen(true); }}
                  onOpenPurchaseOrder={(id) => { setActivePoId(id); setPoOpen(true); }}
                />
                <ApprovalsPanel
                  companyId={companyId}
                  subjectType="estimate"
                  subjectId={estimateId as string}
                  estimateId={estimateId || undefined}
                />
        </div>

        <div className="lg:col-span-9">
          <ItemsTable
            items={filteredItems}
            onAdd={() => addItem.mutate()}
            onEdit={(it) => setDrawerItem(it)}
            onDelete={async (id) => {
              await estimateItemsRepo.remove(companyId, id);
              await itemsQ.refetch();
            }}
          />
        </div>
      </div>
        </>
      )}

      <ItemDrawer
        open={!!drawerItem}
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onSave={async (patch) => {
          await estimateItemsRepo.update(companyId, drawerItem.id, patch);
          await itemsQ.refetch();
        }}
        companyId={companyId}
      />

      <CalculatorRunner
        open={calcOpen}
        calculator={activeCalc}
        onClose={() => setCalcOpen(false)}
        onAddToEstimate={async (lines) => {
          // Insert calculator result lines as estimate items
          const { data: existing } = await supabase
            .from('estimate_items')
            .select('sort_order')
            .eq('company_id', companyId)
            .eq('estimate_id', estimateId)
            .order('sort_order', { ascending: false })
            .limit(1);
          const sortBase = existing?.[0]?.sort_order ? Number(existing[0].sort_order) + 1 : 0;

          const inserts = lines.map((line, idx) => ({
            company_id: companyId,
            estimate_id: estimateId,
            section_id: activeSectionId,
            sort_order: sortBase + idx,
            item_type: line.itemType,
            title: line.title,
            description: line.description || null,
            quantity: line.quantity,
            unit: line.unit,
            unit_cost: line.unitCostHint || 0,
            unit_price: line.unitCostHint || 0,
            margin_percent: 0,
            line_cost: (line.unitCostHint || 0) * line.quantity,
            line_total: (line.unitCostHint || 0) * line.quantity,
            // Note: category field doesn't exist in estimate_items table
          }));

          await supabase.from('estimate_items').insert(inserts);
          await itemsQ.refetch();
        }}
      />

      <CreateDocumentModal
        open={docModalOpen}
        kind={docKind}
        items={items}
        onClose={() => setDocModalOpen(false)}
        onCreateWorkOrder={async (args) => {
          const wo = await workOrdersRepo.createFromEstimateItems(companyId, estimateId as string, {
            title: args.title,
            assigned_to_name: args.assigned_to_name,
            assigned_to_email: args.assigned_to_email,
            vat_rate: args.vat_rate,
            itemIds: args.itemIds,
          });
          await activityRepo.log(companyId, estimateId || null, 'work_order', wo.id, 'created', `Work order created: ${args.title}`);
          await workOrdersQ.refetch();
        }}
        onCreatePurchaseOrder={async (args) => {
          const po = await purchaseOrdersRepo.createFromEstimateItems(companyId, estimateId as string, {
            title: args.title,
            supplier_name: args.supplier_name,
            supplier_email: args.supplier_email,
            delivery_address: args.delivery_address,
            vat_rate: args.vat_rate,
            itemIds: args.itemIds,
          });
          await activityRepo.log(companyId, estimateId || null, 'purchase_order', po.id, 'created', `Purchase order created: ${args.title}`);
          await purchaseOrdersQ.refetch();
        }}
      />

      <WorkOrderDetailModal
        open={woOpen}
        data={woDetailQ.data ?? null}
        companyId={companyId}
        estimateId={estimateId as string}
        onClose={() => { setWoOpen(false); setActiveWoId(null); }}
        onUpdate={async (patch) => {
          if (!activeWoId) return;
          await workOrdersRepo.update(companyId, activeWoId, patch);
          await workOrdersQ.refetch();
          await woDetailQ.refetch();
        }}
      />

      <PurchaseOrderDetailModal
        open={poOpen}
        data={poDetailQ.data ?? null}
        companyId={companyId}
        estimateId={estimateId as string}
        onClose={() => { setPoOpen(false); setActivePoId(null); }}
        onUpdate={async (patch) => {
          if (!activePoId) return;
          await purchaseOrdersRepo.update(companyId, activePoId, patch);
          await purchaseOrdersQ.refetch();
          await poDetailQ.refetch();
        }}
      />
    </div>
  );
}

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function EstimateBuilder() {
  return (
    <QueryClientProvider client={queryClient}>
      <EstimateBuilderInner />
    </QueryClientProvider>
  );
}

