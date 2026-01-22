import { useState, useRef, ReactNode } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Dropdown from '@/components/ui/Dropdown';
import { cn } from '@/lib/utils';
import { useGenericKanbanSettingsStore } from '@/stores/genericKanbanSettingsStore';

export interface GenericKanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
}

export interface GenericKanbanBoardProps<T> {
  columns: GenericKanbanColumn<T>[];
  onMoveItem: (itemId: string, newColumnId: string, newPosition: number) => void;
  onEditItem?: (item: T) => void;
  onDeleteItem?: (item: T) => void;
  onViewItem?: (item: T) => void;
  onAddItem?: (columnId: string) => void;
  renderCard: (item: T, dragHandleProps?: any, columnId?: string) => ReactNode;
  getItemId: (item: T) => string;
  getItemPosition?: (item: T) => number;
  defaultCardColor?: (columnId: string) => string;
  emptyColumnMessage?: string;
  columnWidth?: number;
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

export default function GenericKanbanBoard<T>({
  columns,
  onMoveItem,
  onEditItem,
  onDeleteItem,
  onViewItem,
  onAddItem,
  renderCard,
  getItemId,
  getItemPosition,
  defaultCardColor,
  emptyColumnMessage = 'Drop items here',
  columnWidth = 320,
}: GenericKanbanBoardProps<T>) {
  const [editingColumnName, setEditingColumnName] = useState<string | null>(null);
  const [columnNameValue, setColumnNameValue] = useState<string>('');
  const boardRef = useRef<HTMLDivElement>(null);
  const { columnSettings, updateColumnSettings } = useGenericKanbanSettingsStore();

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
    const newColumnId = destination.droppableId;
    const newPosition = destination.index;

    // Move the item
    onMoveItem(draggableId, newColumnId, newPosition);
  };

  const getCardColor = (columnId: string): string => {
    if (columnSettings[columnId]?.cardColor) {
      return columnSettings[columnId].cardColor;
    }
    if (defaultCardColor) {
      return defaultCardColor(columnId);
    }
    return '#6b7280'; // Default gray
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        ref={boardRef}
        className="flex gap-4 pb-4"
        style={{ display: 'flex', width: 'max-content' }}
      >
        {columns.map((column) => {
          // Sort items by position if getItemPosition is provided
          const sortedItems = getItemPosition
            ? [...column.items].sort((a, b) => {
                const posA = getItemPosition(a) ?? 0;
                const posB = getItemPosition(b) ?? 0;
                return posA - posB;
              })
            : column.items;

          return (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-shrink-0 transition-all duration-200"
                  style={{ width: `${columnWidth}px` }}
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
                                  backgroundColor: getCardColor(column.id),
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
                                    value={columnSettings[column.id]?.cardColor || getCardColor(column.id)}
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
                            {column.items.length}
                          </Badge>
                        </div>
                        {onAddItem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => onAddItem(column.id)}
                            title={`Add item to ${column.title}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3 min-h-[200px]">
                      {sortedItems.length === 0 && snapshot.isDraggingOver && (
                        <DropIndicator isVisible={true} />
                      )}
                      {sortedItems.map((item, index) => {
                        const itemId = getItemId(item);
                        return (
                          <Draggable key={itemId} draggableId={itemId} index={index}>
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
                                {renderCard(item, provided.dragHandleProps, column.id)}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {sortedItems.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                          {emptyColumnMessage}
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
