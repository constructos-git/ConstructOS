import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Note } from '@/types/notes';

interface NotesState {
  notes: Note[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updateNotePosition: (id: string, position: { x: number; y: number }) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [
        {
          id: '1',
          title: 'Project Kickoff',
          content: 'Schedule meeting with client next week',
          color: 'yellow',
          position: { x: 50, y: 50 },
          assignedTo: {
            type: 'project',
            id: 'proj-1',
            name: 'Office Renovation',
          },
          createdBy: 'John Doe',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          content: 'Follow up on quote',
          title: 'Opportunity Follow-up',
          color: 'pink',
          position: { x: 300, y: 100 },
          assignedTo: {
            type: 'opportunity',
            id: 'opp-1',
            name: 'Warehouse Build',
          },
          createdBy: 'Sarah Miller',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16'),
        },
        {
          id: '3',
          title: 'Team Meeting',
          content: 'Discuss Q1 goals and objectives',
          color: 'blue',
          position: { x: 550, y: 200 },
          createdBy: 'Mike Brown',
          createdAt: new Date('2024-01-17'),
          updatedAt: new Date('2024-01-17'),
        },
      ],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      updateNotePosition: (id, position) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, position } : note
          ),
        }));
      },
    }),
    {
      name: 'constructos-notes',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

