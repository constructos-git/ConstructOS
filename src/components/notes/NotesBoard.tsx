import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useNotesStore } from '@/stores/notesStore';
import { useOpportunitiesStore } from '@/stores/opportunitiesStore';
import StickyNote from './StickyNote';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import type { NoteColor } from '@/types/notes';

export default function NotesBoard() {
  const { notes, setIsOpen, addNote, updateNote, deleteNote, updateNotePosition } = useNotesStore();

  const { opportunities } = useOpportunitiesStore();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<'opportunity' | 'project'>('opportunity');
  const [assignItemId, setAssignItemId] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    })
  );

  const handleAddNote = () => {
    const colors: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Place note aligned to grid
    const gridCols = 3;
    const rowHeight = 280;
    const padding = 24;

    const colIndex = notes.length % gridCols;
    const newX = (colIndex / gridCols) * 100; // Aligned to grid column

    // Find next available row
    const lastRow =
      notes.length > 0
        ? Math.max(0, ...notes.map((n) => Math.floor(n.position.y / rowHeight)))
        : -1;
    const nextRow = lastRow + 1;
    const newY = nextRow * rowHeight + padding;

    const newNote = {
      title: 'New Note',
      content: '',
      color: randomColor,
      position: {
        x: newX, // Percentage with smooth positioning
        y: newY, // Pixel position
      },
      createdBy: 'Current User', // TODO: Get from auth context
    };
    addNote(newNote);
  };

  const handleAssign = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowAssignModal(true);
  };

  const handleQuickAssign = (
    noteId: string,
    type: 'opportunity' | 'project',
    id: string,
    name: string
  ) => {
    console.log('handleQuickAssign called:', { noteId, type, id, name });
    updateNote(noteId, {
      assignedTo: { type, id, name },
    });
    // Close any open dropdowns
    setShowAssignModal(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);

    if (!delta) return;

    const note = notes.find((n) => n.id === active.id);
    if (!note) return;

    const gridCols = 3;
    const rowHeight = 280;
    const padding = 24;

    // Get current position
    const currentX = note.position.x;
    const currentY = note.position.y;

    // Calculate new position based on delta
    const gridContainer = document.querySelector('.notes-grid');
    if (!gridContainer) return;

    const gridRect = gridContainer.getBoundingClientRect();

    // Convert delta to percentage for X, pixels for Y
    const deltaXPercent = (delta.x / gridRect.width) * 100;
    const newX = Math.max(0, Math.min(100 - 100 / gridCols, currentX + deltaXPercent));
    const newY = Math.max(padding, currentY + delta.y);

    // Snap to grid
    const gridCol = Math.round((newX / 100) * gridCols);
    const gridRow = Math.round((newY - padding) / rowHeight);

    const snappedX = (gridCol / gridCols) * 100;
    const snappedY = gridRow * rowHeight + padding;

    updateNotePosition(note.id, { x: snappedX, y: snappedY });
  };

  const handleAssignSubmit = () => {
    if (!selectedNoteId) return;

    if (!assignItemId) {
      // Unassign
      updateNote(selectedNoteId, {
        assignedTo: undefined,
      });
      setShowAssignModal(false);
      setSelectedNoteId(null);
      setAssignItemId('');
      return;
    }

    let name = '';
    if (assignType === 'opportunity') {
      const opp = opportunities.find((o) => o.id === assignItemId);
      name = opp?.title || '';
    } else {
      // TODO: Get from projects store when available
      name = 'Project Name';
    }

    if (name) {
      updateNote(selectedNoteId, {
        assignedTo: { type: assignType, id: assignItemId, name },
      });
      setShowAssignModal(false);
      setSelectedNoteId(null);
      setAssignItemId('');
    }
  };

  const opportunityOptions = opportunities.map((opp) => ({
    value: opp.id,
    label: `${opp.title} - ${opp.company}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Notes Board Panel - Slides in from right */}
      <div className="ml-auto w-full max-w-5xl h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Notes Board</h2>
            <p className="text-sm text-gray-400">Drag notes around, double-click to edit</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddNote} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chalkboard Area */}
        <div className="flex-1 overflow-auto relative notes-board">
          {/* Chalkboard Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 min-h-full min-w-full">
            {/* Chalkboard texture */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)
              `,
              }}
            />
            {/* Chalkboard frame */}
            <div className="absolute inset-0 border-8 border-gray-700 shadow-inner" />
            {/* Chalkboard grid lines */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Notes Grid Container */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="relative w-full h-full overflow-y-auto overflow-x-hidden notes-grid scrollbar-thin">
              {notes.length > 0 ? (
                <div
                  className="relative"
                  style={{
                    padding: '24px',
                    minHeight:
                      notes.length > 0
                        ? `${Math.max(...notes.map((n) => n.position.y + 300))}px`
                        : '100%',
                  }}
                >
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="absolute group transition-all duration-200"
                      style={{
                        left: `${note.position.x}%`,
                        top: `${note.position.y}px`,
                        width: `calc(${100 / 3}% - 11px)`, // 3 columns with gap
                        height: '260px',
                        transform: 'translateZ(0)', // Enable hardware acceleration
                      }}
                    >
                      <StickyNote
                        note={note}
                        onUpdate={updateNote}
                        onDelete={deleteNote}
                        onAssign={handleAssign}
                        onQuickAssign={handleQuickAssign}
                        opportunities={opportunities}
                        projects={[
                          { id: '1', name: 'Office Renovation' },
                          { id: '2', name: 'Warehouse Build' },
                          { id: '3', name: 'Residential Development' },
                        ]}
                        isDragging={activeId === note.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-xl mb-2">No notes yet</p>
                    <p className="text-sm">Click "New Note" to create your first sticky note</p>
                  </div>
                </div>
              )}

              {/* Floating Add Note Button */}
              <div className="absolute bottom-6 right-6 z-30">
                <Button
                  onClick={handleAddNote}
                  className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg rounded-full h-14 w-14 p-0 flex items-center justify-center"
                  title="Add New Note"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>

              <DragOverlay>
                {activeId ? (
                  <div style={{ width: 'calc(33.33% - 11px)', height: '260px' }}>
                    <StickyNote
                      note={notes.find((n) => n.id === activeId)!}
                      onUpdate={updateNote}
                      onDelete={deleteNote}
                      onAssign={handleAssign}
                      onQuickAssign={handleQuickAssign}
                      opportunities={opportunities}
                      projects={[
                        { id: '1', name: 'Office Renovation' },
                        { id: '2', name: 'Warehouse Build' },
                        { id: '3', name: 'Residential Development' },
                      ]}
                      isDragging={true}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </div>
          </DndContext>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedNoteId(null);
          setAssignItemId('');
        }}
        title="Assign Note"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedNoteId(null);
                setAssignItemId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit}>{assignItemId ? 'Assign' : 'Unassign'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Type"
            value={assignType}
            onChange={(e) => {
              setAssignType(e.target.value as 'opportunity' | 'project');
              setAssignItemId(''); // Reset selection when type changes
            }}
            options={[
              { value: 'opportunity', label: 'Opportunity' },
              { value: 'project', label: 'Project' },
            ]}
          />
          <Select
            label={assignType === 'opportunity' ? 'Select Opportunity' : 'Select Project'}
            value={assignItemId}
            onChange={(e) => setAssignItemId(e.target.value)}
            options={[
              { value: '', label: 'None (Unassign)' },
              ...(assignType === 'opportunity'
                ? opportunityOptions
                : [
                    { value: '1', label: 'Office Renovation' },
                    { value: '2', label: 'Warehouse Build' },
                    { value: '3', label: 'Residential Development' },
                  ]),
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
