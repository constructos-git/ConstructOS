import { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GenericKanbanBoard, { type GenericKanbanColumn } from '@/components/kanban/GenericKanbanBoard';
import RoadmapCard from './RoadmapCard';
import type { RoadmapItem, RoadmapStage, RoadmapKanbanColumn } from '@/types/roadmap';

interface RoadmapBoardProps {
  columns: RoadmapKanbanColumn[];
  onMoveItem: (id: string, newStage: RoadmapStage, newPosition: number) => void;
  onEditItem?: (item: RoadmapItem) => void;
  onDeleteItem?: (id: string) => void;
  onViewItem?: (item: RoadmapItem) => void;
  onAddItem?: (stage: RoadmapStage) => void;
}

function DropIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="relative my-2 animate-in fade-in duration-200">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-1 bg-blue-500 rounded-full opacity-100 shadow-lg shadow-blue-500/50" />
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
        <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
        <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
      </div>
    </div>
  );
}

const defaultCardColor = (stage: RoadmapStage): string => {
  switch (stage) {
    case 'ideas':
      return '#3b82f6';
    case 'in-progress':
      return '#eab308';
    case 'released':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

export default function RoadmapBoard({
  columns,
  onMoveItem,
  onEditItem,
  onDeleteItem,
  onViewItem,
  onAddItem,
}: RoadmapBoardProps) {
  // Convert columns to GenericKanbanColumn format
  const kanbanColumns = useMemo<GenericKanbanColumn<RoadmapItem>[]>(() => {
    return columns.map((col) => ({
      id: col.id,
      title: col.title,
      items: col.items,
    }));
  }, [columns]);

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
          onMoveItem={(itemId, newColumnId, newPosition) => {
            onMoveItem(itemId, newColumnId as RoadmapStage, newPosition);
          }}
          onEditItem={onEditItem}
          onDeleteItem={(item) => onDeleteItem?.(item.id)}
          onViewItem={onViewItem}
          onAddItem={(columnId) => onAddItem?.(columnId as RoadmapStage)}
          renderCard={(item, dragHandleProps, columnId) => (
            <RoadmapCard
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onView={onViewItem}
              cardColor={defaultCardColor(columnId as RoadmapStage)}
              dragHandleProps={dragHandleProps}
            />
          )}
          getItemId={(item) => item.id}
          getItemPosition={(item) => item.position}
          defaultCardColor={(columnId) => defaultCardColor(columnId as RoadmapStage)}
          emptyColumnMessage="Drop items here"
          columnWidth={320}
        />
      </div>
    </div>
  );
}
