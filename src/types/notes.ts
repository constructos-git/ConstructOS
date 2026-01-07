export interface Note {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';
  position: { x: number; y: number };
  assignedTo?: {
    type: 'opportunity' | 'project';
    id: string;
    name: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteColor = Note['color'];


