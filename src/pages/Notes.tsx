import { useEffect } from 'react';
import { useNotesStore } from '@/stores/notesStore';
import NotesBoard from '@/components/notes/NotesBoard';

export default function Notes() {
  const { isOpen, setIsOpen } = useNotesStore();

  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  return isOpen ? <NotesBoard /> : null;
}

