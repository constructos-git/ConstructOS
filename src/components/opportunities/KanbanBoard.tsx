import { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import OpportunityCard from './OpportunityCard';
import type { Opportunity, OpportunityStage, KanbanColumn } from '@/types/opportunities';
import { cn } from '@/lib/utils';
import { useKanbanSettingsStore } from '@/stores/kanbanSettingsStore';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMoveOpportunity: (id: string, newStage: OpportunityStage, newPosition: number) => void;
  onEditOpportunity?: (opportunity: Opportunity) => void;
  onDeleteOpportunity?: (id: string) => void;
  onViewOpportunity?: (opportunity: Opportunity) => void;
  onAddOpportunity?: (stage: OpportunityStage) => void;
  onKanbanSettings?: () => void;
  onMoveToLost?: (opportunity: Opportunity) => void; // Called when opportunity is moved to "lost" stage
  onCreateProject?: (opportunity: Opportunity) => void; // Called when "Create Project" button is clicked on won opportunity
  onArchiveWon?: (opportunity: Opportunity) => void; // Called when "Archive" button is clicked on won opportunity
  autoScroll?: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
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

const colorOptions = [
  { name: 'Gray', value: '#6b7280' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
];

const defaultCardColor = (stage: OpportunityStage): string => {
  switch (stage) {
    case 'lead':
      return '#6b7280';
    case 'qualified':
      return '#3b82f6';
    case 'proposal':
      return '#eab308';
    case 'negotiation':
      return '#f97316';
    case 'won':
      return '#22c55e';
    case 'lost':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

export default function KanbanBoard({
  columns,
  onMoveOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onViewOpportunity,
  onAddOpportunity,
  onMoveToLost,
  onCreateProject,
  onArchiveWon,
  autoScroll: _autoScroll = true,
  scrollContainerRef: _scrollContainerRef,
}: KanbanBoardProps) {
  const [editingColumnName, setEditingColumnName] = useState<OpportunityStage | null>(null);
  const [columnNameValue, setColumnNameValue] = useState<string>('');
  const boardRef = useRef<HTMLDivElement>(null);
  const { columnSettings, updateColumnSettings } = useKanbanSettingsStore();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area, do nothing
    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Calculate new position
    const newStage = destination.droppableId as OpportunityStage;
    const newPosition = destination.index;

    // Find the opportunity being moved
    const opportunity = columns
      .flatMap((col) => col.opportunities)
      .find((opp) => opp.id === draggableId);

    if (!opportunity) {
      // If we can't find the opportunity, just move it normally
      onMoveOpportunity(draggableId, newStage, newPosition);
      return;
    }

    // Intercept moves to "lost" stage
    if (newStage === 'lost' && onMoveToLost) {
      onMoveToLost(opportunity);
      return; // Don't move yet - let the modal handle it
    }

    // For "won" stage, allow the move to happen immediately
    // The card will show buttons to create project or archive
    // For all other moves, proceed normally
    onMoveOpportunity(draggableId, newStage, newPosition);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        ref={boardRef}
        className="flex gap-4 pb-4"
        style={{ display: 'flex', width: 'max-content' }}
      >
        {columns.map((column) => {
          const sortedOpportunities = [...column.opportunities].sort(
            (a, b) => a.position - b.position
          );

          return (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn('flex-shrink-0 w-80 transition-all duration-200')}
                >
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Dropdown
                            trigger={
                              <button
                                type="button"
                                className="flex-shrink-0 h-4 w-4 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor:
                                    columnSettings[column.id]?.cardColor ||
                                    defaultCardColor(column.id),
                                }}
                                title="Change card color"
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                            align="left"
                          >
                            {(close) => (
                              <div className="p-2 min-w-[200px]">
                                <div className="text-xs font-semibold mb-2 px-2">Card Color</div>
                                <div className="grid grid-cols-5 gap-2">
                                  {colorOptions.map((color) => (
                                    <button
                                      key={color.value}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateColumnSettings(column.id, { cardColor: color.value });
                                        close();
                                      }}
                                      className={cn(
                                        'w-8 h-8 rounded border-2 transition-all cursor-pointer hover:scale-110',
                                        columnSettings[column.id]?.cardColor === color.value &&
                                          'ring-2 ring-black ring-offset-1 scale-110'
                                      )}
                                      style={{ backgroundColor: color.value }}
                                      title={color.name}
                                    />
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t">
                                  <input
                                    type="color"
                                    value={columnSettings[column.id]?.cardColor || '#6b7280'}
                                    onChange={(e) => {
                                      updateColumnSettings(column.id, {
                                        cardColor: e.target.value,
                                      });
                                    }}
                                    className="w-full h-8 rounded cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            )}
                          </Dropdown>
                          {editingColumnName === column.id ? (
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <input
                                type="text"
                                value={columnNameValue}
                                onChange={(e) => setColumnNameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (columnNameValue.trim()) {
                                      updateColumnSettings(column.id, {
                                        customName: columnNameValue.trim(),
                                      });
                                    }
                                    setEditingColumnName(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingColumnName(null);
                                  }
                                }}
                                onBlur={() => {
                                  if (columnNameValue.trim()) {
                                    updateColumnSettings(column.id, {
                                      customName: columnNameValue.trim(),
                                    });
                                  }
                                  setEditingColumnName(null);
                                }}
                                className="text-sm font-semibold bg-transparent border-b-2 border-primary-500 outline-none flex-1 min-w-0"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (columnNameValue.trim()) {
                                    updateColumnSettings(column.id, {
                                      customName: columnNameValue.trim(),
                                    });
                                  }
                                  setEditingColumnName(null);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingColumnName(null);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 flex-1 min-w-0 group">
                              <CardTitle
                                className="text-sm font-semibold cursor-pointer flex-1 min-w-0 truncate"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setColumnNameValue(
                                    columnSettings[column.id]?.customName || column.title
                                  );
                                  setEditingColumnName(column.id);
                                }}
                                title="Click to edit"
                              >
                                {columnSettings[column.id]?.customName || column.title}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setColumnNameValue(
                                    columnSettings[column.id]?.customName || column.title
                                  );
                                  setEditingColumnName(column.id);
                                }}
                                title="Edit column name"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {column.opportunities.length}
                          </Badge>
                        </div>
                        {onAddOpportunity && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => onAddOpportunity(column.id)}
                            title={`Add opportunity to ${column.title}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3 min-h-[200px]">
                      {sortedOpportunities.length === 0 && snapshot.isDraggingOver && (
                        <DropIndicator isVisible={true} />
                      )}
                      {sortedOpportunities.map((opportunity, index) => (
                        <Draggable key={opportunity.id} draggableId={opportunity.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                'relative transition-all select-none',
                                snapshot.isDragging && 'opacity-30'
                              )}
                              style={{
                                ...provided.draggableProps.style,
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                WebkitTouchCallout: 'none',
                                pointerEvents: 'auto',
                              }}
                            >
                              <OpportunityCard
                                opportunity={opportunity}
                                onEdit={onEditOpportunity}
                                onDelete={onDeleteOpportunity}
                                onView={onViewOpportunity}
                                onCreateProject={onCreateProject}
                                onArchiveWon={onArchiveWon}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {sortedOpportunities.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                          Drop opportunities here
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
