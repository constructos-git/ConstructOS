import { useState, useRef, useEffect } from 'react';
import { Plus, Settings, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import KanbanBoard from '@/components/opportunities/KanbanBoard';
import OpportunityMetrics from '@/components/opportunities/OpportunityMetrics';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import OpportunityDetail from '@/components/opportunities/OpportunityDetail';
import ArchiveConfirmModal from '@/components/opportunities/ArchiveConfirmModal';
import ProjectCreationWizard from '@/components/projects/ProjectCreationWizard';
import KanbanSettings, { type KanbanSettings as KanbanSettingsType } from '@/components/opportunities/KanbanSettings';
import CardSettings from '@/components/opportunities/CardSettings';
import {
  useOpportunitiesStore,
} from '@/stores/opportunitiesStore';
import type { Opportunity, OpportunityStage } from '@/types/opportunities';

export default function Opportunities() {
  const navigate = useNavigate();
  const {
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    moveOpportunity,
    archiveOpportunity,
    getMetrics,
    getColumns,
  } = useOpportunitiesStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isProjectWizardOpen, setIsProjectWizardOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | null>(null);
  const [opportunityToArchive, setOpportunityToArchive] = useState<Opportunity | null>(null);
  const [opportunityForProject, setOpportunityForProject] = useState<Opportunity | null>(null);
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
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);

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

  const handleMoveToLost = (opportunity: Opportunity) => {
    setOpportunityToArchive(opportunity);
    setIsArchiveModalOpen(true);
  };

  const handleCreateProject = (opportunity: Opportunity) => {
    setOpportunityForProject(opportunity);
    setIsProjectWizardOpen(true);
  };

  // Auto-scroll on hover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!scrollDirection) {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    const scrollSpeed = 8; // pixels per frame
    let lastTime = performance.now();

    const scroll = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Smooth scrolling based on frame time
      const pixelsToScroll = (scrollSpeed * deltaTime) / 16; // Normalize to 60fps
      
      if (scrollDirection === 'left') {
        container.scrollLeft = Math.max(0, container.scrollLeft - pixelsToScroll);
      } else if (scrollDirection === 'right') {
        const maxScroll = container.scrollWidth - container.clientWidth;
        container.scrollLeft = Math.min(maxScroll, container.scrollLeft + pixelsToScroll);
      }

      scrollIntervalRef.current = requestAnimationFrame(scroll);
    };

    scrollIntervalRef.current = requestAnimationFrame(scroll);

    return () => {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [scrollDirection]);

  const handleArchiveWon = (opportunity: Opportunity) => {
    if (confirm(`Archive "${opportunity.title}"? It will be moved to the Archive Won section.`)) {
      archiveOpportunity(opportunity.id, 'won');
    }
  };

  const handleConfirmArchive = () => {
    if (opportunityToArchive) {
      // Move to lost stage and archive
      const lostColumn = getColumns().find((col) => col.id === 'lost');
      const newPosition = lostColumn ? lostColumn.opportunities.length : 0;
      moveOpportunity(opportunityToArchive.id, 'lost', newPosition);
      archiveOpportunity(opportunityToArchive.id, 'lost');
      setIsArchiveModalOpen(false);
      setOpportunityToArchive(null);
    }
  };

  const handleProjectCreated = (projectId: string) => {
    setIsProjectWizardOpen(false);
    setOpportunityForProject(null);
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
          <Button variant="outline" onClick={() => navigate('/opportunities/archive')} size="sm">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
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
      <div className="relative">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
          onMouseEnter={(e) => {
            e.stopPropagation();
            setScrollDirection('left');
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setScrollDirection(null);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
          onMouseEnter={(e) => {
            e.stopPropagation();
            setScrollDirection('right');
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setScrollDirection(null);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="border rounded-lg bg-muted/20 h-[calc(100vh-24rem)] scrollbar-thin group"
          style={{ width: '100%', overflowX: 'auto', overflowY: 'auto' }}
        >
          <KanbanBoard
            columns={columns}
            onMoveOpportunity={moveOpportunity}
            onEditOpportunity={handleEditOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            onViewOpportunity={handleViewOpportunity}
            onAddOpportunity={handleNewOpportunity}
            onMoveToLost={handleMoveToLost}
            onCreateProject={handleCreateProject}
            onArchiveWon={handleArchiveWon}
            autoScroll={kanbanSettings.autoScroll}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
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

      <ArchiveConfirmModal
        isOpen={isArchiveModalOpen}
        opportunity={opportunityToArchive}
        onConfirm={handleConfirmArchive}
        onCancel={() => {
          setIsArchiveModalOpen(false);
          setOpportunityToArchive(null);
        }}
      />

      <ProjectCreationWizard
        isOpen={isProjectWizardOpen}
        opportunity={opportunityForProject}
        onClose={() => {
          setIsProjectWizardOpen(false);
          setOpportunityForProject(null);
        }}
        onComplete={handleProjectCreated}
      />
    </div>
  );
}

