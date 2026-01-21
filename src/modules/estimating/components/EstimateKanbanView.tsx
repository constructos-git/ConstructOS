import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GenericKanbanBoard, { type GenericKanbanColumn } from '@/components/kanban/GenericKanbanBoard';
import EstimateCard from './EstimateCard';
import type { Estimate } from '../domain/estimating.types';

type StatusGroup = 'draft' | 'sent' | 'accepted' | 'rejected' | 'won' | 'lost' | 'archived';

const statusGroups: StatusGroup[] = ['draft', 'sent', 'accepted', 'rejected', 'won', 'lost', 'archived'];

const statusLabels: Record<StatusGroup, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
};

// Map estimate status to kanban status group
function getStatusGroup(status: string): StatusGroup {
  if (status === 'won' || status === 'lost' || status === 'archived') {
    return status as StatusGroup;
  }
  if (status === 'draft' || status === 'sent' || status === 'accepted' || status === 'rejected') {
    return status as StatusGroup;
  }
  return 'draft';
}

export function EstimateKanbanView({
  estimates,
  onEstimateClick,
  onEdit,
  onDelete,
  onArchive,
  onAssignToProject,
  onAssignToOpportunity,
  onAssignToContact,
  onMarkWon,
  onMarkLost,
  onStatusChange,
  onEstimatesUpdate,
}: {
  estimates: Estimate[];
  onEstimateClick: (estimate: Estimate) => void;
  onEdit: (estimate: Estimate) => void;
  onDelete: (estimate: Estimate) => void;
  onArchive: (estimate: Estimate) => void;
  onAssignToProject: (estimate: Estimate) => void;
  onAssignToOpportunity: (estimate: Estimate) => void;
  onAssignToContact: (estimate: Estimate) => void;
  onMarkWon: (estimate: Estimate) => void;
  onMarkLost: (estimate: Estimate) => void;
  onStatusChange?: (estimate: Estimate, newStatus: Estimate['status']) => void;
  onEstimatesUpdate?: (updater: (prev: Estimate[]) => Estimate[]) => void;
}) {
  // Convert estimates to Kanban columns
  const kanbanColumns = useMemo<GenericKanbanColumn<Estimate>[]>(() => {
    return statusGroups.map((status) => ({
      id: status,
      title: statusLabels[status],
      items: estimates.filter((e) => getStatusGroup(e.status) === status),
    }));
  }, [estimates]);

  const defaultCardColor = (status: string): string => {
    const colors: Record<StatusGroup, string> = {
      draft: '#6b7280',
      sent: '#3b82f6',
      accepted: '#22c55e',
      rejected: '#ef4444',
      won: '#22c55e',
      lost: '#ef4444',
      archived: '#9ca3af',
    };
    return colors[status as StatusGroup] || '#6b7280';
  };

  const handleMoveEstimate = async (estimateId: string, newStatus: string, newPosition: number) => {
    const estimate = estimates.find((e) => e.id === estimateId);
    if (!estimate) return;

    // Update status based on the new column
    const newStatusGroup = getStatusGroup(newStatus);
    if (newStatusGroup !== getStatusGroup(estimate.status)) {
      // Optimistically update the state immediately for smooth UI
      if (onEstimatesUpdate) {
        onEstimatesUpdate((prevEstimates) =>
          prevEstimates.map((e) =>
            e.id === estimateId ? { ...e, status: newStatusGroup as Estimate['status'] } : e
          )
        );
      }

      // Then sync with database (async)
      if (newStatusGroup === 'won') {
        onMarkWon(estimate);
      } else if (newStatusGroup === 'lost') {
        onMarkLost(estimate);
      } else if (newStatusGroup === 'archived') {
        onArchive(estimate);
      } else if (onStatusChange) {
        // Use the status change handler for draft, sent, accepted, rejected
        onStatusChange(estimate, newStatusGroup as Estimate['status']);
      } else {
        // Fallback to onEdit if onStatusChange is not provided
        onEdit({ ...estimate, status: newStatusGroup as Estimate['status'] });
      }
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<'left' | 'right' | null>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Auto-scroll on hover
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !scrollDirection) {
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

  return (
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
        ref={scrollRef}
        className="border rounded-lg bg-muted/20 h-[calc(100vh-24rem)] scrollbar-thin overflow-x-auto overflow-y-auto"
        style={{ width: '100%' }}
      >
        <GenericKanbanBoard
          columns={kanbanColumns}
          onMoveItem={handleMoveEstimate}
          onEditItem={onEdit}
          onDeleteItem={onDelete}
          onViewItem={onEstimateClick}
          renderCard={(estimate, dragHandleProps, columnId) => (
            <EstimateCard
              estimate={estimate}
              onView={onEstimateClick}
              onEdit={onEdit}
              onDelete={(est) => onDelete(est)}
              dragHandleProps={dragHandleProps}
              columnId={columnId || ''}
            />
          )}
          getItemId={(estimate) => estimate.id}
          defaultCardColor={defaultCardColor}
          emptyColumnMessage="Drop estimates here"
          columnWidth={320}
        />
      </div>
    </div>
  );
}

