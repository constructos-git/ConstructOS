import { useState, useRef, useEffect } from 'react';
import { X, Palette, ChevronDown, Check } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { Note, NoteColor } from '@/types/notes';
import Dropdown from '@/components/ui/Dropdown';

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onAssign: (id: string) => void;
  onQuickAssign?: (
    id: string,
    type: 'opportunity' | 'project',
    itemId: string,
    name: string
  ) => void;
  opportunities?: Array<{ id: string; title: string; company: string }>;
  projects?: Array<{ id: string; name: string }>;
  isDragging?: boolean;
}

const noteColors: { value: NoteColor; label: string; className: string }[] = [
  {
    value: 'yellow',
    label: 'Yellow',
    className: 'bg-yellow-200 border-yellow-300 shadow-yellow-400/30',
  },
  { value: 'pink', label: 'Pink', className: 'bg-pink-200 border-pink-300 shadow-pink-400/30' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-200 border-blue-300 shadow-blue-400/30' },
  {
    value: 'green',
    label: 'Green',
    className: 'bg-green-200 border-green-300 shadow-green-400/30',
  },
  {
    value: 'orange',
    label: 'Orange',
    className: 'bg-orange-200 border-orange-300 shadow-orange-400/30',
  },
  {
    value: 'purple',
    label: 'Purple',
    className: 'bg-purple-200 border-purple-300 shadow-purple-400/30',
  },
];

const colorClasses: Record<NoteColor, string> = {
  yellow: 'bg-yellow-200 border-yellow-300 shadow-yellow-400/30',
  pink: 'bg-pink-200 border-pink-300 shadow-pink-400/30',
  blue: 'bg-blue-200 border-blue-300 shadow-blue-400/30',
  green: 'bg-green-200 border-green-300 shadow-green-400/30',
  orange: 'bg-orange-200 border-orange-300 shadow-orange-400/30',
  purple: 'bg-purple-200 border-purple-300 shadow-purple-400/30',
};

export default function StickyNote({
  note,
  onUpdate,
  onDelete,
  onAssign,
  onQuickAssign,
  opportunities = [],
  projects = [],
  isDragging: externalIsDragging = false,
}: StickyNoteProps) {
  const [openDropdown, setOpenDropdown] = useState<'opportunity' | 'project' | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close other dropdowns when one opens
  useEffect(() => {
    // This effect ensures only one dropdown is open at a time
    // The state management in onOpenChange handles the closing
  }, [openDropdown]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDndDragging,
  } = useDraggable({
    id: note.id,
    disabled: false,
    data: {
      note,
    },
  });

  const isDragging = externalIsDragging || isDndDragging;

  // Update contentEditable elements when note changes
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== note.title) {
      titleRef.current.textContent = note.title || 'Untitled';
    }
    if (contentRef.current && contentRef.current.textContent !== note.content) {
      contentRef.current.textContent = note.content || '';
    }
  }, [note.title, note.content]);

  const [isSaving, setIsSaving] = useState(false);

  const handleTitleBlur = () => {
    if (titleRef.current) {
      const newTitle = titleRef.current.textContent?.trim() || '';
      if (newTitle !== note.title) {
        setIsSaving(true);
        onUpdate(note.id, { title: newTitle });
        setTimeout(() => setIsSaving(false), 500);
      }
    }
  };

  const handleContentBlur = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.textContent?.trim() || '';
      if (newContent !== note.content) {
        setIsSaving(true);
        onUpdate(note.id, { content: newContent });
        setTimeout(() => setIsSaving(false), 500);
      }
    }
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Create a drag handle that excludes interactive elements
  const dragHandleProps = {
    ...listeners,
    ...attributes,
    onMouseDown: (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't start drag if clicking on interactive elements
      if (
        target.tagName === 'BUTTON' ||
        target.isContentEditable ||
        target.closest('button') !== null ||
        target.closest('[contenteditable="true"]') !== null ||
        target.closest('.relative') !== null
      ) {
        e.stopPropagation();
        return;
      }
      // Allow drag to proceed
      listeners?.onMouseDown?.(e);
    },
  };

  return (
    <div
      ref={setNodeRef}
      {...dragHandleProps}
      className={cn(
        'w-full h-full p-5 rounded-lg shadow-lg border-2 flex flex-col',
        colorClasses[note.color],
        'text-gray-900', // Dark text for readability
        isDragging && 'cursor-grabbing scale-105 z-50 shadow-2xl opacity-90',
        !isDragging && 'cursor-move hover:scale-[1.02] transition-transform duration-200'
      )}
      style={{
        ...style,
        zIndex: isDragging ? 50 : openDropdown ? 40 : 10,
      }}
    >
      <div className="flex items-start justify-between mb-2 group">
        <div className="flex-1 flex items-center gap-2">
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="font-bold text-base flex-1 outline-none cursor-text text-gray-900 min-h-[1.5rem]"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            data-placeholder="Untitled"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                contentRef.current?.focus();
              }
            }}
          >
            {note.title || 'Untitled'}
          </div>
          {isSaving && <Check className="h-4 w-4 text-green-600 animate-in fade-in" />}
        </div>
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
                  title="Change color"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Palette className="h-3 w-3" />
                </button>
              }
              align="right"
            >
              {(close) => (
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {noteColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onUpdate(note.id, { color: color.value });
                          close();
                        }}
                        className={cn(
                          'w-8 h-8 rounded border-2 transition-all cursor-pointer hover:scale-110',
                          color.className,
                          note.color === color.value && 'ring-2 ring-black ring-offset-1 scale-110'
                        )}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Dropdown>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this note?')) {
                onDelete(note.id);
              }
            }}
            className="p-0.5 hover:bg-black/10 rounded"
            title="Delete"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleContentBlur}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="text-sm flex-1 overflow-y-auto mb-2 outline-none cursor-text text-gray-800 leading-relaxed min-h-[2rem]"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
        data-placeholder="Click to add content..."
      >
        {note.content || ''}
      </div>

      {/* Assignment Section - Separate Dropdowns for Projects and Opportunities */}
      <div
        className="border-t border-gray-300 pt-2 mt-2 space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Opportunity Assignment */}
        <div>
          <Dropdown
            trigger={
              <button
                type="button"
                className={cn(
                  'w-full flex items-center justify-between gap-2 text-xs rounded px-2 py-1.5 transition-colors cursor-pointer border',
                  note.assignedTo?.type === 'opportunity'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                    : 'hover:bg-black/5 border-transparent text-gray-700'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (openDropdown === 'opportunity') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown('opportunity');
                  }
                }}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="truncate font-medium">
                    {note.assignedTo?.type === 'opportunity'
                      ? note.assignedTo.name
                      : 'Assign to Opportunity...'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              </button>
            }
            align="left"
            isOpen={openDropdown === 'opportunity'}
            onOpenChange={(open) => {
              if (open) {
                // Close project dropdown if open
                if (openDropdown === 'project') {
                  setOpenDropdown('opportunity');
                } else {
                  setOpenDropdown('opportunity');
                }
              } else {
                setOpenDropdown(null);
              }
            }}
            onClose={() => {
              setOpenDropdown(null);
            }}
          >
            {(close) => {
              const handleClose = () => {
                setOpenDropdown(null);
                close();
              };
              return (
                <div className="p-2 min-w-[220px] bg-background">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-foreground mb-2 px-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Assign to Opportunity
                    </div>
                    {note.assignedTo?.type === 'opportunity' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onUpdate(note.id, { assignedTo: undefined });
                          handleClose();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded transition-colors"
                      >
                        Remove Assignment
                      </button>
                    )}
                    {opportunities.length > 0 ? (
                      opportunities.map((opp) => (
                        <button
                          key={opp.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (onQuickAssign) {
                              onQuickAssign(note.id, 'opportunity', opp.id, opp.title);
                            } else {
                              onAssign(note.id);
                            }
                            handleClose();
                          }}
                          className={cn(
                            'w-full text-left px-2 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors',
                            note.assignedTo?.type === 'opportunity' &&
                              note.assignedTo.id === opp.id &&
                              'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          {opp.title} - {opp.company}
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        No opportunities
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          </Dropdown>
        </div>

        {/* Project Assignment */}
        <div>
          <Dropdown
            trigger={
              <button
                type="button"
                className={cn(
                  'w-full flex items-center justify-between gap-2 text-xs rounded px-2 py-1.5 transition-colors cursor-pointer border',
                  note.assignedTo?.type === 'project'
                    ? 'bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
                    : 'hover:bg-black/5 border-transparent text-gray-700'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (openDropdown === 'project') {
                    setOpenDropdown(null);
                  } else {
                    setOpenDropdown('project');
                  }
                }}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="truncate font-medium">
                    {note.assignedTo?.type === 'project'
                      ? note.assignedTo.name
                      : 'Assign to Project...'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              </button>
            }
            align="left"
            isOpen={openDropdown === 'project'}
            onOpenChange={(open) => {
              if (open) {
                // Close opportunity dropdown if open
                if (openDropdown === 'opportunity') {
                  setOpenDropdown('project');
                } else {
                  setOpenDropdown('project');
                }
              } else {
                setOpenDropdown(null);
              }
            }}
            onClose={() => {
              setOpenDropdown(null);
            }}
          >
            {(close) => {
              const handleClose = () => {
                setOpenDropdown(null);
                close();
              };
              return (
                <div className="p-2 min-w-[220px] bg-background">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-foreground mb-2 px-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Assign to Project
                    </div>
                    {note.assignedTo?.type === 'project' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onUpdate(note.id, { assignedTo: undefined });
                          handleClose();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded transition-colors"
                      >
                        Remove Assignment
                      </button>
                    )}
                    {projects.length > 0 ? (
                      projects.map((proj) => (
                        <button
                          key={proj.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (onQuickAssign) {
                              onQuickAssign(note.id, 'project', proj.id, proj.name);
                            } else {
                              onAssign(note.id);
                            }
                            handleClose();
                          }}
                          className={cn(
                            'w-full text-left px-2 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground rounded transition-colors',
                            note.assignedTo?.type === 'project' &&
                              note.assignedTo.id === proj.id &&
                              'bg-green-50 dark:bg-green-900/20'
                          )}
                        >
                          {proj.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-muted-foreground">No projects</div>
                    )}
                  </div>
                </div>
              );
            }}
          </Dropdown>
        </div>
      </div>

      {/* Placeholder styles */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
