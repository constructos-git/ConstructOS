// Estimate Builder AI Main Page

import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplatePicker } from '../components/TemplatePicker';
import { PropertyTypeStep } from '../components/PropertyTypeStep';
import { WizardPage } from '../components/Wizard/WizardPage';
import { InternalCostingEditor } from '../components/Editors/InternalCostingEditor';
import { CustomerEstimateEditor } from '../components/Editors/CustomerEstimateEditor';
import { BriefTab } from '../components/Brief/BriefTab';
import { RecommendedBundlesPanel } from '../components/Brief/RecommendedBundlesPanel';
import { VersionHistoryModal } from '../components/Versions/VersionHistoryModal';
import { AssignmentBar } from '../components/Assignments/AssignmentBar';
import { GeneratePOModal } from '../components/Assignments/GeneratePOModal';
import { GenerateWOModal } from '../components/Assignments/GenerateWOModal';
import { MockEstimateAIProvider } from '../ai/MockEstimateAIProvider';
import { useCreateEstimate, useUpdateEstimate, useEstimate } from '../hooks/useEstimates';
import { useCreateMeasurements, useMeasurements } from '../hooks/useMeasurements';
import { useCreateRateSettings, useRateSettings } from '../hooks/useRateSettings';
import { useCreateVersion } from '../hooks/useVersions';
import { buildBriefContent } from '../utils/briefBuilder';
import { calculateInternalCostingTotals } from '../utils/totals';
import type {
  EstimateBuilderTemplate,
  EstimateBrief,
  InternalCosting,
  CustomerEstimate,
  VisibilitySettings,
} from '../domain/types';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ShoppingCart, Briefcase, History } from 'lucide-react';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type ViewState =
  | { type: 'template-picker' }
  | { type: 'property-type'; template: EstimateBuilderTemplate }
  | { type: 'wizard'; template: EstimateBuilderTemplate; answers: Record<string, any>; propertyType?: string }
  | {
      type: 'editor';
      estimateId: string;
      template: EstimateBuilderTemplate;
      internalCosting: InternalCosting;
      customerEstimate: CustomerEstimate;
      visibilitySettings: VisibilitySettings;
      activeTab?: 'brief' | 'internal' | 'customer';
      brief?: EstimateBrief;
      measurements?: any;
      rateSettings?: any;
    };

function EstimateBuilderAIPageInner() {
  const [viewState, setViewState] = useState<ViewState>({ type: 'template-picker' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showWOModal, setShowWOModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const [answersSnapshot, setAnswersSnapshot] = useState<EstimateBrief | undefined>(undefined);
  const [regenerating, setRegenerating] = useState(false);

  const createEstimate = useCreateEstimate(SHARED_COMPANY_ID);
  const updateEstimate = useUpdateEstimate(SHARED_COMPANY_ID);
  const { data: currentEstimate } = useEstimate(SHARED_COMPANY_ID, currentEstimateId || undefined);
  const createMeasurements = useCreateMeasurements(SHARED_COMPANY_ID);
  const createRateSettings = useCreateRateSettings(SHARED_COMPANY_ID);
  const { data: measurementsData } = useMeasurements(SHARED_COMPANY_ID, currentEstimateId || undefined);
  const { data: rateSettingsData } = useRateSettings(SHARED_COMPANY_ID, currentEstimateId || undefined);
  const createVersion = useCreateVersion(SHARED_COMPANY_ID);

  const aiProvider = new MockEstimateAIProvider();

  // Helper to determine if a template requires property type
  const requiresPropertyType = (template: EstimateBuilderTemplate): boolean => {
    // Property type is only relevant for:
    // - Extension templates (single-storey, double-storey, wraparound, combination)
    // - Loft conversion templates
    // - Garage conversion templates
    const extensionTemplates = [
      'single-storey-extension',
      'double-storey-extension',
      'wraparound-extension',
      'combination-extension',
    ];
    const conversionTemplates = ['loft-conversion', 'garage-conversion'];
    
    return extensionTemplates.includes(template.id) || conversionTemplates.includes(template.id);
  };

  const handleTemplateSelect = (template: EstimateBuilderTemplate) => {
    if (requiresPropertyType(template)) {
      // Show property type step for relevant templates
      setViewState({
        type: 'property-type',
        template,
      });
    } else {
      // Skip property type step for refurbishment templates
      setViewState({
        type: 'wizard',
        template,
        answers: {},
        propertyType: undefined,
      });
    }
  };

  const handlePropertyTypeSelect = (propertyType: string) => {
    if (viewState.type === 'property-type') {
      setViewState({
        type: 'wizard',
        template: viewState.template,
        answers: {},
        propertyType,
      });
    }
  };


  const handleAnswersChange = useCallback((answers: Record<string, any>) => {
    if (viewState.type === 'wizard') {
      setViewState({
        ...viewState,
        answers,
      });
    }
  }, [viewState]);

  const handleGenerate = async (brief: EstimateBrief) => {
    if (viewState.type !== 'wizard') return;

    // Include property type in brief only if it was provided (for relevant templates)
    if (viewState.propertyType) {
      brief.propertyType = viewState.propertyType;
    }

    // Include measurements and rate settings in brief
    if (viewState.answers.measurements) {
      brief.measurements = viewState.answers.measurements;
    }

    // Default rate settings if not provided
    if (!brief.rateSettings) {
      const { getDefaultRateSettings } = await import('../utils/rates');
      brief.rateSettings = getDefaultRateSettings('South East');
    }

    setIsGenerating(true);
    try {
      // Create estimate record
      const estimate = await createEstimate.mutateAsync({
        templateId: viewState.template.id,
        title: `${viewState.template.name} - ${new Date().toLocaleDateString()}`,
        estimateBrief: brief,
      });

      setCurrentEstimateId(estimate.id);

      // Generate estimate using AI provider
      const { internalCosting, customerEstimate, visibilitySettings } =
        await aiProvider.generateEstimate(brief);

      // Update estimate with generated data
      await updateEstimate.mutateAsync({
        id: estimate.id,
        patch: {
          status: 'generated',
          internalCosting,
          customerEstimate,
          visibilitySettings,
        },
      });

      // Save measurements if provided
      if (brief.measurements) {
        await createMeasurements.mutateAsync({
          estimateId: estimate.id,
          measurements: brief.measurements,
        });
      }

      // Save rate settings if provided
      if (brief.rateSettings) {
        await createRateSettings.mutateAsync({
          estimateId: estimate.id,
          settings: brief.rateSettings,
        });
      }

      // Save answers snapshot for regeneration
      setAnswersSnapshot(brief);

      // Create version snapshot
      try {
        await createVersion.mutateAsync({
          estimateId: estimate.id,
          snapshot: {
            answers: brief,
            measurements: brief.measurements,
            rateSettings: brief.rateSettings,
            sections: internalCosting.sections,
            visibilitySettings,
            brief: buildBriefContent(brief, brief.measurements, brief.rateSettings),
          },
        });
      } catch (error) {
        console.error('Failed to create version snapshot:', error);
      }

      // Move to editor view (default to Brief tab)
      setViewState({
        type: 'editor',
        estimateId: estimate.id,
        template: viewState.template,
        internalCosting,
        customerEstimate,
        visibilitySettings,
        activeTab: 'brief',
        brief,
        measurements: brief.measurements,
        rateSettings: brief.rateSettings,
      });
    } catch (error) {
      console.error('Failed to generate estimate:', error);
      alert('Failed to generate estimate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInternalCostingUpdate = async (costing: InternalCosting) => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { internalCosting: costing },
      });

      setViewState({
        ...viewState,
        internalCosting: costing,
      });
    } catch (error) {
      console.error('Failed to update internal costing:', error);
      alert('Failed to update internal costing. Please try again.');
    }
  };

  const handleCustomerEstimateUpdate = async (estimate: CustomerEstimate) => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { customerEstimate: estimate },
      });

      setViewState({
        ...viewState,
        customerEstimate: estimate,
      });
    } catch (error) {
      console.error('Failed to update customer estimate:', error);
      alert('Failed to update customer estimate. Please try again.');
    }
  };

  const handleVisibilityUpdate = async (settings: VisibilitySettings) => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { visibilitySettings: settings },
      });

      setViewState({
        ...viewState,
        visibilitySettings: settings,
      });
    } catch (error) {
      console.error('Failed to update visibility settings:', error);
      alert('Failed to update visibility settings. Please try again.');
    }
  };

  const handleSave = async () => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { status: 'finalized' },
      });
      alert('Estimate saved successfully!');
    } catch (error) {
      console.error('Failed to save estimate:', error);
      alert('Failed to save estimate. Please try again.');
    }
  };

  const handleDuplicate = () => {
    if (viewState.type !== 'editor') return;
    // TODO: Implement duplicate functionality
    alert('Duplicate functionality coming soon');
  };

  const handleClientChange = async (clientId: string | undefined) => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { clientId },
      });
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const handleProjectChange = async (projectId: string | undefined) => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { projectId },
      });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleOpportunityChange = async (opportunityId: string | undefined) => {
    if (viewState.type !== 'editor') return;

    try {
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: { opportunityId },
      });
    } catch (error) {
      console.error('Failed to update opportunity:', error);
    }
  };

  const handleRegenerate = async (mode: 'auto-rated-only' | 'full') => {
    if (viewState.type !== 'editor') return;

    // Confirmation for full regeneration
    if (mode === 'full') {
      if (!confirm('Full regeneration will replace all sections and items. This action cannot be undone. Continue?')) {
        return;
      }
    }

    setRegenerating(true);
    try {
      // Create version snapshot before regeneration
      const snapshot = {
        answers: answersSnapshot || viewState.brief || {} as Record<string, any>,
        measurements: viewState.measurements,
        rateSettings: viewState.rateSettings,
        sections: viewState.internalCosting.sections,
        visibilitySettings: viewState.visibilitySettings,
        brief: buildBriefContent(
          viewState.brief || {} as EstimateBrief,
          viewState.measurements,
          viewState.rateSettings
        ),
      };

      await createVersion.mutateAsync({
        estimateId: viewState.estimateId,
        snapshot,
      });

      // Get the brief from answers snapshot or current brief
      const brief: EstimateBrief = answersSnapshot || viewState.brief || {
        templateId: viewState.template.id,
        propertyType: 'detached',
        alterationTypes: [],
        measurements: viewState.measurements || {} as any,
        rateSettings: viewState.rateSettings || {} as any,
      } as EstimateBrief;

      // Regenerate using AI provider
      const { internalCosting, customerEstimate, visibilitySettings } =
        await aiProvider.generateEstimate(brief);

      // For auto-rated-only mode, preserve manual overrides
      let finalInternalCosting = internalCosting;
      if (mode === 'auto-rated-only') {
        // Merge: keep items that are manually overridden, replace auto-rated items
        // Match items by assemblyId/assemblyLineId or by title
        finalInternalCosting = {
          ...internalCosting,
          sections: internalCosting.sections.map((newSection) => {
            // Find matching old section by title
            const oldSection = viewState.internalCosting.sections.find(
              (s) => s.title === newSection.title
            );
            if (!oldSection) return newSection;

            // Build a map of old items by key (assemblyId+assemblyLineId or title)
            const oldItemsMap = new Map<string, typeof oldSection.items[0]>();
            oldSection.items.forEach((item) => {
              const key = item.assemblyId && item.assemblyLineId
                ? `${item.assemblyId}:${item.assemblyLineId}`
                : item.title;
              oldItemsMap.set(key, item);
            });

            return {
              ...newSection,
              items: newSection.items.map((newItem) => {
                const key = newItem.assemblyId && newItem.assemblyLineId
                  ? `${newItem.assemblyId}:${newItem.assemblyLineId}`
                  : newItem.title;
                const oldItem = oldItemsMap.get(key);

                // If item was manually overridden, keep the old one
                if (oldItem && oldItem.isManualOverride) {
                  return oldItem;
                }
                // If item is auto-rated, use the new one
                if (newItem.isAutoRated) {
                  return newItem;
                }
                // Otherwise keep the old item if it exists, or use the new one
                return oldItem || newItem;
              }),
            };
          }),
        };
      }

      // Recalculate totals
      finalInternalCosting = calculateInternalCostingTotals(finalInternalCosting);

      // Update estimate with regenerated data
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: {
          internalCosting: finalInternalCosting,
          customerEstimate,
          visibilitySettings,
        },
      });

      // Update view state
      setViewState({
        ...viewState,
        internalCosting: finalInternalCosting,
        customerEstimate,
        visibilitySettings,
      });

      alert(`Estimate ${mode === 'auto-rated-only' ? 'regenerated (auto-rated items only)' : 'fully regenerated'} successfully!`);
    } catch (error) {
      console.error('Failed to regenerate estimate:', error);
      alert('Failed to regenerate estimate. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleVersionRestore = async (version: any) => {
    if (viewState.type !== 'editor') return;

    try {
      const snapshot = version.snapshotJson;

      // Recalculate totals for restored internal costing
      const restoredInternalCosting = calculateInternalCostingTotals({
        sections: snapshot.sections || [],
        subtotal: 0,
        overhead: 0,
        margin: 0,
        contingency: 0,
        vat: 0,
        total: 0,
        assumptions: [],
      });

      // Restore sections, visibility settings, measurements, rate settings
      await updateEstimate.mutateAsync({
        id: viewState.estimateId,
        patch: {
          internalCosting: restoredInternalCosting,
          visibilitySettings: snapshot.visibilitySettings || viewState.visibilitySettings,
        },
      });

      // Update measurements and rate settings if they exist
      if (snapshot.measurements) {
        await createMeasurements.mutateAsync({
          estimateId: viewState.estimateId,
          measurements: snapshot.measurements,
        });
      }

      if (snapshot.rateSettings) {
        await createRateSettings.mutateAsync({
          estimateId: viewState.estimateId,
          settings: snapshot.rateSettings,
        });
      }

      // Regenerate customer estimate from restored internal costing
      // (The AI provider's generateCustomerEstimate is private, so we'll need to update it separately)
      // For now, we'll just update the internal costing and let the user regenerate if needed
      // TODO: Extract customer estimate generation logic to a utility function

      // Update view state
      setViewState({
        ...viewState,
        internalCosting: restoredInternalCosting,
        visibilitySettings: snapshot.visibilitySettings || viewState.visibilitySettings,
        measurements: snapshot.measurements,
        rateSettings: snapshot.rateSettings,
        brief: snapshot.answers || viewState.brief,
      });

      alert('Version restored successfully! You may need to regenerate the customer estimate.');
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version. Please try again.');
    }
  };

  // Get all items from internal costing for PO/WO generation
  const allItems = viewState.type === 'editor' 
    ? viewState.internalCosting.sections.flatMap((s) => s.items)
    : [];

  const allSections = viewState.type === 'editor'
    ? viewState.internalCosting.sections.map((s) => ({ id: s.id, title: s.title }))
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {viewState.type === 'template-picker' && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onCancel={() => {
            // Could navigate away or show confirmation
          }}
        />
      )}

      {viewState.type === 'property-type' && (
        <PropertyTypeStep
          onSelect={handlePropertyTypeSelect}
          onBack={() => setViewState({ type: 'template-picker' })}
        />
      )}

      {viewState.type === 'wizard' && (
        <WizardPage
          template={viewState.template}
          answers={{ 
            ...viewState.answers, 
            ...(viewState.propertyType && { propertyType: viewState.propertyType })
          }}
          onAnswersChange={handleAnswersChange}
          onBack={() => {
            if (requiresPropertyType(viewState.template)) {
              setViewState({ type: 'property-type', template: viewState.template });
            } else {
              setViewState({ type: 'template-picker' });
            }
          }}
          onGenerate={handleGenerate}
        />
      )}

      {viewState.type === 'editor' && (
        <div className="space-y-6">
          {/* Assignment Bar */}
          <AssignmentBar
            estimate={currentEstimate || {
              id: viewState.estimateId,
              companyId: SHARED_COMPANY_ID,
              templateId: viewState.template.id,
              title: viewState.template.name,
              status: 'generated',
              estimateBrief: {} as EstimateBrief,
              visibilitySettings: viewState.visibilitySettings,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: '',
              updatedBy: '',
            }}
            estimateTitle={currentEstimate?.title || viewState.template.name}
            clientId={currentEstimate?.clientId}
            projectId={currentEstimate?.projectId}
            opportunityId={currentEstimate?.opportunityId}
            customerEstimate={viewState.customerEstimate}
            visibilitySettings={viewState.visibilitySettings}
            onClientChange={handleClientChange}
            onProjectChange={handleProjectChange}
            onOpportunityChange={handleOpportunityChange}
            onDuplicate={handleDuplicate}
            onSave={handleSave}
            isSaving={updateEstimate.isPending}
            companyId={SHARED_COMPANY_ID}
          />

          {/* PO/WO Generation Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowPOModal(true)}
                  disabled={allItems.filter((i) => i.isPurchasable).length === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Generate Purchase Order
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowWOModal(true)}
                  disabled={allItems.filter((i) => i.isWorkOrderEligible).length === 0}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Generate Work Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Editor Tabs */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b">
              <div className="flex gap-4">
                <button
                  onClick={() => setViewState({ ...viewState, activeTab: 'brief' })}
                  className={`px-4 py-2 border-b-2 font-medium ${
                    viewState.activeTab === 'brief' || !viewState.activeTab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Brief
                </button>
                <button
                  onClick={() => setViewState({ ...viewState, activeTab: 'internal' })}
                  className={`px-4 py-2 border-b-2 font-medium ${
                    viewState.activeTab === 'internal'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Internal Costing
                </button>
                <button
                  onClick={() => setViewState({ ...viewState, activeTab: 'customer' })}
                  className={`px-4 py-2 border-b-2 font-medium ${
                    viewState.activeTab === 'customer'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Customer Estimate
                </button>
                <div className="flex-1" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRegenerate('auto-rated-only')}
                  disabled={regenerating}
                >
                  Regenerate (Auto-rated Only)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRegenerate('full')}
                  disabled={regenerating}
                >
                  Full Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVersionModal(true)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Version History
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            {(!viewState.activeTab || viewState.activeTab === 'brief') && (
              <div className="space-y-6">
                <BriefTab
                  estimateId={viewState.estimateId}
                  brief={viewState.brief || currentEstimate?.estimateBrief || {} as EstimateBrief}
                  measurements={viewState.measurements || measurementsData}
                  rateSettings={viewState.rateSettings || rateSettingsData}
                  companyId={SHARED_COMPANY_ID}
                />
                <RecommendedBundlesPanel
                  estimateId={viewState.estimateId}
                  templateId={viewState.template.id}
                  answers={viewState.brief || {}}
                  companyId={SHARED_COMPANY_ID}
                />
              </div>
            )}

            {viewState.activeTab === 'internal' && (
              <InternalCostingEditor
                costing={viewState.internalCosting}
                onUpdate={handleInternalCostingUpdate}
              />
            )}

            {viewState.activeTab === 'customer' && (
              <CustomerEstimateEditor
                estimate={viewState.customerEstimate}
                visibilitySettings={viewState.visibilitySettings}
                onUpdate={handleCustomerEstimateUpdate}
                onVisibilityUpdate={handleVisibilityUpdate}
                companyId={SHARED_COMPANY_ID}
              />
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {(isGenerating || regenerating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-medium">
                  {regenerating ? 'Regenerating Estimate...' : 'Generating Estimate...'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <GeneratePOModal
        isOpen={showPOModal}
        onClose={() => setShowPOModal(false)}
        items={allItems}
        estimateId={viewState.type === 'editor' ? viewState.estimateId : ''}
        companyId={SHARED_COMPANY_ID}
        onSuccess={() => {
          alert('Purchase Order generated successfully!');
        }}
      />

      <GenerateWOModal
        isOpen={showWOModal}
        onClose={() => setShowWOModal(false)}
        items={allItems}
        sections={allSections}
        estimateId={viewState.type === 'editor' ? viewState.estimateId : ''}
        companyId={SHARED_COMPANY_ID}
        onSuccess={() => {
          alert('Work Order generated successfully!');
        }}
      />

      <VersionHistoryModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        estimateId={viewState.type === 'editor' ? viewState.estimateId : ''}
        companyId={SHARED_COMPANY_ID}
        onRestore={handleVersionRestore}
      />
    </div>
  );
}

export default function EstimateBuilderAIPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <EstimateBuilderAIPageInner />
    </QueryClientProvider>
  );
}

/*
 * DEVELOPER NOTES - Estimate Builder AI Module
 * 
 * TEMPLATE REGISTRATION:
 * - Templates are defined in domain/templateRegistry.ts
 * - Each template has: id, name, description, category, icon, steps (questions), promptBuilder
 * - To add a new template, add it to templateRegistry array
 * - Template questions support dependencies (show/hide based on other answers)
 * 
 * AI PROVIDER:
 * - Currently uses MockEstimateAIProvider (deterministic, UK heuristics)
 * - To switch to real AI, replace MockEstimateAIProvider with OpenAIProvider in EstimateBuilderAIPage.tsx
 * - OpenAIProvider requires VITE_OPENAI_API_KEY environment variable
 * - AI provider interface: IEstimateAIProvider.generateEstimate(brief) -> { internalCosting, customerEstimate, visibilitySettings }
 * 
 * ASSEMBLIES & BUNDLES:
 * - Seed assemblies in domain/assembliesRegistry.ts (10 UK domestic assemblies)
 * - Seed bundles in domain/bundlesRegistry.ts (smart recommendations)
 * - Assemblies use formula tokens (e.g., {floorAreaM2}) for quantity calculations
 * - Bundles can be applied to estimates, which applies all assemblies in the bundle
 * 
 * MEASUREMENTS & RATE SETTINGS:
 * - Measurements are persisted per estimate (1:1 relationship)
 * - Rate settings include region, multipliers, overhead, margin, contingency, VAT
 * - Both are used in estimate generation and can be edited
 * 
 * VERSIONING:
 * - Versions are automatically created after generation and before regeneration
 * - Version snapshots include: answers, measurements, rate settings, sections, visibility settings, brief
 * - Version history modal shows all versions with diff summary
 * - Restore functionality allows reverting to previous versions
 * 
 * REGENERATION:
 * - "Auto-rated Only": Only replaces items where isAutoRated=true and isManualOverride=false
 * - "Full Regenerate": Replaces all sections/items (requires confirmation)
 * - Always creates a version snapshot before regeneration
 * 
 * CONTENT LIBRARY:
 * - Seed content blocks in domain/contentBlocksRegistry.ts (25-40 UK domestic blocks)
 * - Blocks can be: scope, note, exclusion, ps_wording
 * - Users can insert blocks into customer estimate descriptions/notes
 * - Users can save custom blocks to the library
 * 
 * EXPORT:
 * - PDF export via @react-pdf/renderer (EstimatePdfRenderer.tsx)
 * - DOCX export via docx library (EstimateDocxBuilder.ts)
 * - Both respect visibility settings
 * 
 * PROJECT/OPPORTUNITY INTEGRATION:
 * - Opportunities loaded from useOpportunitiesStore (Zustand store)
 * - Projects currently placeholder (Projects page exists but no store)
 * - Assignment persists project_id and opportunity_id on estimate
 * - Links to /projects and /opportunities if assigned
 * 
 * DATABASE:
 * - Migration 017: Core estimate tables
 * - Migration 018: Measurements, rate settings, assemblies
 * - Migration 019: Briefs, bundles, versions, content blocks
 * - All tables use company_id for multi-tenancy (currently SHARED_COMPANY_ID for single-tenant)
 * - RLS policies allow all operations for authenticated users
 */

/*
 * DEVELOPER NOTES
 * 
 * Template Registration:
 * - Templates are registered in src/modules/EstimateBuilderAI/domain/templateRegistry.ts
 * - Each template defines: id, name, description, category, icon, steps (questions), and promptBuilder
 * - To add a new template:
 *   1. Create a new EstimateBuilderTemplate object in templateRegistry.ts
 *   2. Define the question steps with dependencies
 *   3. Implement the promptBuilder function to convert answers to EstimateBrief
 *   4. Add the template to the templateRegistry array
 * 
 * AI Provider:
 * - The AI provider interface is in src/modules/EstimateBuilderAI/ai/IEstimateAIProvider.ts
 * - MockEstimateAIProvider (MockEstimateAIProvider.ts) is the default working provider
 * - OpenAIProvider (OpenAIProvider.ts) is a placeholder for future OpenAI integration
 * - To swap providers, change the provider instantiation in EstimateBuilderAIPage.tsx
 * - To enable OpenAI: set VITE_OPENAI_API_KEY env var and implement the API calls in OpenAIProvider
 * 
 * Export Formatting:
 * - PDF export: src/modules/EstimateBuilderAI/components/Export/EstimatePdfRenderer.tsx
 *   Uses @react-pdf/renderer library
 * - DOCX export: src/modules/EstimateBuilderAI/components/Export/EstimateDocxBuilder.ts
 *   Currently a placeholder - install 'docx' and 'file-saver' to implement
 * 
 * Known Future Enhancements:
 * - Add more question types (number inputs, text areas, multi-select)
 * - Implement template versioning
 * - Add estimate comparison/diff view
 * - Implement estimate approval workflow
 * - Add estimate templates library (save custom templates)
 * - Integrate with actual Projects and Opportunities modules
 * - Add estimate history/versioning
 * - Implement estimate sharing/collaboration
 * - Add estimate analytics/reporting
 * - Implement bulk estimate operations
 */

