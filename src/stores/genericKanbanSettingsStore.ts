import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ColumnSettings {
  customName?: string;
  cardColor: string; // Hex color
}

interface GenericKanbanSettingsState {
  columnSettings: Record<string, ColumnSettings>;
  updateColumnSettings: (columnId: string, settings: Partial<ColumnSettings>) => void;
  resetColumnSettings: (columnId: string) => void;
  resetAllSettings: () => void;
}

export const useGenericKanbanSettingsStore = create<GenericKanbanSettingsState>()(
  persist(
    (set) => ({
      columnSettings: {},

      updateColumnSettings: (columnId, settings) => {
        set((state) => ({
          columnSettings: {
            ...state.columnSettings,
            [columnId]: {
              ...state.columnSettings[columnId],
              ...settings,
            },
          },
        }));
      },

      resetColumnSettings: (columnId) => {
        set((state) => {
          const newSettings = { ...state.columnSettings };
          delete newSettings[columnId];
          return { columnSettings: newSettings };
        });
      },

      resetAllSettings: () => {
        set({ columnSettings: {} });
      },
    }),
    {
      name: 'constructos-generic-kanban-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
