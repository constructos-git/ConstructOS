import { useState, useRef } from 'react';
import { Plus, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import KanbanBoard from '@/components/opportunities/KanbanBoard';
import OpportunityMetrics from '@/components/opportunities/OpportunityMetrics';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import KanbanSettings, { type KanbanSettings as KanbanSettingsType } from '@/components/opportunities/KanbanSettings';
import CardSettings from '@/components/opportunities/CardSettings';
import {
  useOpportunitiesStore,
} from '@/stores/opportunitiesStore';
import type { Opportunity, OpportunityStage } from '@/types/opportunities';

export default function Opportunities() {
  const {
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    moveOpportunity,
    getMetrics,
    getColumns,
  } = useOpportunitiesStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | null>(null);
  const [initialStage, setInitialStage] = useState<OpportunityStage | undefined>();
  const [kanbanSettings, setKanbanSettings] = useState<KanbanSettingsType>({
    autoScroll: true,
    cardWidth: 320,
    showMetrics: true,
    showProbability: true,
    showTags: true,
    columnOrder: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    collapsedColumns: [],
  });

  const columns = getColumns();
  const metrics = getMetrics();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNewOpportunity = (stage?: OpportunityStage) => {
    setEditingOpportunity(undefined);
    setInitialStage(stage);
    setIsFormOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setInitialStage(undefined);
    setIsFormOpen(true);
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setViewingOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  const handleSaveOpportunity = (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    if (editingOpportunity) {
      updateOpportunity(editingOpportunity.id, opportunityData);
    } else {
      addOpportunity(opportunityData);
    }
    setIsFormOpen(false);
    setEditingOpportunity(undefined);
    setInitialStage(undefined);
  };

  const handleDeleteOpportunity = (id: string) => {
    deleteOpportunity(id);
  };

  return (
    <div className="space-y-6" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header - Fixed in viewport */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline with Kanban boards and drag-and-drop.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => setIsCardSettingsOpen(true)} size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Card Settings
          </Button>
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)} size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Board Settings
          </Button>
          <Button onClick={() => handleNewOpportunity()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Metrics - Fixed in viewport */}
      {kanbanSettings.showMetrics && (
        <div>
          <OpportunityMetrics metrics={metrics} />
        </div>
      )}

      {/* Kanban Board Wrapper - ONLY scrollable area */}
      <div 
        ref={scrollContainerRef}
        className="border rounded-lg bg-muted/20 h-[calc(100vh-24rem)] scrollbar-thin"
        style={{ width: '100%', overflowX: 'auto', overflowY: 'auto' }}
      >
        <KanbanBoard
          columns={columns}
          onMoveOpportunity={moveOpportunity}
          onEditOpportunity={handleEditOpportunity}
          onDeleteOpportunity={handleDeleteOpportunity}
          onViewOpportunity={handleViewOpportunity}
          onAddOpportunity={handleNewOpportunity}
          autoScroll={kanbanSettings.autoScroll}
          scrollContainerRef={scrollContainerRef}
        />
      </div>

      {/* Modals */}
      <OpportunityForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOpportunity(undefined);
          setInitialStage(undefined);
        }}
        onSave={handleSaveOpportunity}
        opportunity={editingOpportunity}
        initialStage={initialStage}
      />

      <OpportunityDetail
        opportunity={viewingOpportunity}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingOpportunity(null);
        }}
        onEdit={handleEditOpportunity}
      />

      <KanbanSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(settings) => {
          setKanbanSettings(settings);
        }}
        currentSettings={kanbanSettings}
      />

      <CardSettings
        isOpen={isCardSettingsOpen}
        onClose={() => setIsCardSettingsOpen(false)}
      />
    </div>
  );
}

