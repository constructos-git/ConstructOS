import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OpportunityStage } from '@/types/opportunities';

export interface CardFieldVisibility {
  value: boolean;
  probability: boolean;
  contact: boolean;
  expectedCloseDate: boolean;
  assignedTo: boolean;
  source: boolean;
  tags: boolean;
  daysInStage: boolean;
  lastActivity: boolean;
  createdAt: boolean;
}

export interface ColumnSettings {
  customName?: string;
  cardColor: string; // Hex color or Tailwind class
}

interface KanbanSettingsState {
  columnSettings: Record<OpportunityStage, ColumnSettings>;
  cardFieldVisibility: CardFieldVisibility;
  updateColumnSettings: (stage: OpportunityStage, settings: Partial<ColumnSettings>) => void;
  updateCardFieldVisibility: (field: keyof CardFieldVisibility, visible: boolean) => void;
  resetSettings: () => void;
}

const defaultCardColor = (stage: OpportunityStage): string => {
  switch (stage) {
    case 'lead':
      return '#6b7280'; // gray-500
    case 'qualified':
      return '#3b82f6'; // blue-500
    case 'proposal':
      return '#eab308'; // yellow-500
    case 'negotiation':
      return '#f97316'; // orange-500
    case 'won':
      return '#22c55e'; // green-500
    case 'lost':
      return '#ef4444'; // red-500
    default:
      return '#6b7280';
  }
};

const defaultColumnSettings: Record<OpportunityStage, ColumnSettings> = {
  lead: { cardColor: defaultCardColor('lead') },
  qualified: { cardColor: defaultCardColor('qualified') },
  proposal: { cardColor: defaultCardColor('proposal') },
  negotiation: { cardColor: defaultCardColor('negotiation') },
  won: { cardColor: defaultCardColor('won') },
  lost: { cardColor: defaultCardColor('lost') },
};

const defaultCardFieldVisibility: CardFieldVisibility = {
  value: true,
  probability: true,
  contact: true,
  expectedCloseDate: true,
  assignedTo: true,
  source: false,
  tags: true,
  daysInStage: false,
  lastActivity: false,
  createdAt: false,
};

export const useKanbanSettingsStore = create<KanbanSettingsState>()(
  persist(
    (set) => ({
      columnSettings: defaultColumnSettings,
      cardFieldVisibility: defaultCardFieldVisibility,

      updateColumnSettings: (stage, settings) => {
        set((state) => ({
          columnSettings: {
            ...state.columnSettings,
            [stage]: {
              ...state.columnSettings[stage],
              ...settings,
            },
          },
        }));
      },

      updateCardFieldVisibility: (field, visible) => {
        set((state) => ({
          cardFieldVisibility: {
            ...state.cardFieldVisibility,
            [field]: visible,
          },
        }));
      },

      resetSettings: () => {
        set({
          columnSettings: defaultColumnSettings,
          cardFieldVisibility: defaultCardFieldVisibility,
        });
      },
    }),
    {
      name: 'constructos-kanban-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

