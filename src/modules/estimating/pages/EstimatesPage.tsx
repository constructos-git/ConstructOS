import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { estimatesRepo } from '../data/estimates.repo';
import { estimateTemplatesRepo } from '../data/templates.repo';
import { seedTemplatesForCompany } from '../data/seedTemplates';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, FileText } from 'lucide-react';
import type { Estimate } from '../domain/estimating.types';
import { EstimateListToolbar, type ViewType } from '../components/EstimateListToolbar';
import { EstimateListView } from '../components/EstimateListView';
import { EstimateKanbanView } from '../components/EstimateKanbanView';
import { EstimateTableView } from '../components/EstimateTableView';
import { TemplateBuilderWorkflow } from '../components/template-builder/TemplateBuilderWorkflow';
import Dropdown from '@/components/ui/Dropdown';

export function EstimatesPage() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('list');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  // Single tenant mode - use shared company ID
  const companyId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const loadEstimates = async () => {
      try {
        setIsLoading(true);
        const data = await estimatesRepo.list();
        setEstimates(data);
      } catch (error) {
        console.error('Failed to load estimates:', error);
        setEstimates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEstimates();
  }, []);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        console.log('📥 Loading templates for company:', companyId);
        let data = await estimateTemplatesRepo.list(companyId);
        console.log(`📊 Found ${data.length} existing templates`);
        
        // If no templates exist, or if we have fewer than expected, seed them
        const expectedTemplateCount = 8; // Single Storey, Double Storey, Single Storey Flat Roof, Loft Conversion, Kitchen, Irregular, Wraparound, Dual Combo
        if (data.length === 0 || data.length < expectedTemplateCount) {
          console.log(`🌱 Found ${data.length} templates (expected ${expectedTemplateCount}). Seeding templates...`);
          const seededCount = await seedTemplatesForCompany(companyId);
          console.log(`✅ Seeded ${seededCount} templates, reloading...`);
          data = await estimateTemplatesRepo.list(companyId);
          console.log(`📊 Now have ${data.length} templates after seeding`);
        }
        
        console.log('✅ Setting templates state:', data);
        setTemplates(data);
      } catch (error) {
        console.error('❌ Failed to load templates:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    if (showTemplateBuilder) {
      loadTemplates();
    }
  }, [showTemplateBuilder, companyId]);

  const handleCreateEstimate = async () => {
    try {
      setIsCreating(true);
      const estimate = await estimatesRepo.create('New Estimate');
      navigate(`/estimating/${estimate.id}`);
    } catch (error) {
      console.error('Failed to create estimate:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      alert(`Failed to create estimate: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (estimate: Estimate) => {
    navigate(`/estimating/${estimate.id}`);
  };

  const handleDelete = async (estimate: Estimate) => {
    try {
      await estimatesRepo.delete(estimate.id);
      setEstimates(estimates.filter((e) => e.id !== estimate.id));
    } catch (error) {
      console.error('Failed to delete estimate:', error);
      alert('Failed to delete estimate. Please try again.');
    }
  };

  const handleArchive = async (estimate: Estimate) => {
    try {
      await estimatesRepo.update(estimate.id, { status: 'archived' });
      setEstimates(estimates.map((e) => (e.id === estimate.id ? { ...e, status: 'archived' } : e)));
    } catch (error) {
      console.error('Failed to archive estimate:', error);
      alert('Failed to archive estimate. Please try again.');
    }
  };

  const handleAssignToProject = (estimate: Estimate) => {
    // TODO: Implement project assignment modal
    alert(`Assign "${estimate.title}" to project - Feature coming soon`);
  };

  const handleAssignToOpportunity = (estimate: Estimate) => {
    // TODO: Implement opportunity assignment modal
    alert(`Assign "${estimate.title}" to opportunity - Feature coming soon`);
  };

  const handleAssignToContact = (estimate: Estimate) => {
    // TODO: Implement contact assignment modal
    alert(`Assign "${estimate.title}" to contact - Feature coming soon`);
  };

  const handleMarkWon = async (estimate: Estimate) => {
    try {
      await estimatesRepo.update(estimate.id, { status: 'won' as Estimate['status'] });
      setEstimates(estimates.map((e) => (e.id === estimate.id ? { ...e, status: 'won' as Estimate['status'] } : e)));
    } catch (error) {
      console.error('Failed to mark estimate as won:', error);
      alert('Failed to update estimate status. Please try again.');
    }
  };

  const handleMarkLost = async (estimate: Estimate) => {
    try {
      await estimatesRepo.update(estimate.id, { status: 'lost' as Estimate['status'] });
      setEstimates(estimates.map((e) => (e.id === estimate.id ? { ...e, status: 'lost' as Estimate['status'] } : e)));
    } catch (error) {
      console.error('Failed to mark estimate as lost:', error);
      alert('Failed to update estimate status. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {showTemplateBuilder ? (
        isLoadingTemplates ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </CardContent>
          </Card>
        ) : (
          <TemplateBuilderWorkflow
            companyId={companyId}
            templates={templates}
            onCancel={() => setShowTemplateBuilder(false)}
          />
        )
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">Estimates</h1>
            <div className="flex items-center gap-3">
              <EstimateListToolbar viewType={viewType} onViewChange={setViewType} />
              <Dropdown
                trigger={
                  <Button disabled={isCreating}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? 'Creating...' : 'Create Estimate'}
                  </Button>
                }
                align="right"
              >
                <div className="p-1 min-w-[200px]">
                  <button
                    onClick={() => {
                      handleCreateEstimate();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                    Create Blank Estimate
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateBuilder(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <FileText className="h-4 w-4" />
                    Create from Template
                  </button>
                </div>
              </Dropdown>
            </div>
          </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading estimates...</div>
      ) : estimates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first estimate.
            </p>
          </CardContent>
        </Card>
      ) : viewType === 'list' ? (
        <EstimateListView
          estimates={estimates}
          onEstimateClick={(e) => navigate(`/estimating/${e.id}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onAssignToProject={handleAssignToProject}
          onAssignToOpportunity={handleAssignToOpportunity}
          onAssignToContact={handleAssignToContact}
          onMarkWon={handleMarkWon}
          onMarkLost={handleMarkLost}
        />
      ) : viewType === 'kanban' ? (
        <EstimateKanbanView
          estimates={estimates}
          onEstimateClick={(e) => navigate(`/estimating/${e.id}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onAssignToProject={handleAssignToProject}
          onAssignToOpportunity={handleAssignToOpportunity}
          onAssignToContact={handleAssignToContact}
          onMarkWon={handleMarkWon}
          onMarkLost={handleMarkLost}
        />
      ) : (
        <EstimateTableView
          estimates={estimates}
          onEstimateClick={(e) => navigate(`/estimating/${e.id}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onAssignToProject={handleAssignToProject}
          onAssignToOpportunity={handleAssignToOpportunity}
          onAssignToContact={handleAssignToContact}
          onMarkWon={handleMarkWon}
          onMarkLost={handleMarkLost}
        />
      )}
        </>
      )}
    </div>
  );
}
