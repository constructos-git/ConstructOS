import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RoadmapItem, RoadmapStage, RoadmapMetrics, RoadmapKanbanColumn } from '@/types/roadmap';

interface RoadmapState {
  items: RoadmapItem[];
  addItem: (item: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  updateItem: (id: string, updates: Partial<RoadmapItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newStage: RoadmapStage, newPosition: number) => void;
  getMetrics: () => RoadmapMetrics;
  getColumns: () => RoadmapKanbanColumn[];
}

const defaultStages: { id: RoadmapStage; title: string; color: string }[] = [
  { id: 'ideas', title: 'Ideas', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'released', title: 'Released', color: 'bg-green-500' },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to deserialize dates from localStorage
const deserializeRoadmapItems = (items: any[]): RoadmapItem[] => {
  return items.map((item, index) => ({
    ...item,
    position: typeof item.position === 'number' ? item.position : index,
    targetDate: item.targetDate ? new Date(item.targetDate) : undefined,
    releaseDate: item.releaseDate ? new Date(item.releaseDate) : undefined,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    lastActivity: item.lastActivity ? new Date(item.lastActivity) : new Date(),
  }));
};

const defaultItems: RoadmapItem[] = [
  {
    id: '1',
    title: 'Enhanced Dashboard Analytics',
    description: 'Add more detailed analytics and reporting to the dashboard',
    stage: 'ideas',
    priority: 'high',
    category: 'Feature',
    tags: ['Analytics', 'Dashboard'],
    position: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    lastActivity: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Build native mobile apps for iOS and Android',
    stage: 'in-progress',
    priority: 'critical',
    category: 'Feature',
    assignedTo: 'Development Team',
    tags: ['Mobile', 'iOS', 'Android'],
    targetDate: new Date('2024-06-01'),
    position: 0,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
    lastActivity: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'AI Estimate Builder',
    description: 'AI-powered estimate generation from plans and drawings',
    stage: 'released',
    priority: 'high',
    category: 'Feature',
    tags: ['AI', 'Estimates'],
    releaseDate: new Date('2024-01-15'),
    position: 0,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-01-15'),
  },
];

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      items: defaultItems,

      addItem: (itemData) => {
        const newItem: RoadmapItem = {
          ...itemData,
          id: generateId(),
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => {
          const stageItems = state.items.filter((item) => item.stage === newItem.stage);
          const maxPosition = stageItems.length > 0
            ? Math.max(...stageItems.map((item) => item.position))
            : -1;
          newItem.position = maxPosition + 1;

          return {
            items: [...state.items, newItem],
          };
        });
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          const updatedItems = state.items
            .filter((i) => i.id !== id)
            .map((i) => {
              if (i.stage === item.stage && i.position > item.position) {
                return { ...i, position: i.position - 1 };
              }
              return i;
            });

          return { items: updatedItems };
        });
      },

      moveItem: (id, newStage, newPosition) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          const isSameStage = item.stage === newStage;
          const oldPosition = item.position;
          const oldStage = item.stage;

          const updatedItems = state.items.map((i) => {
            if (i.id === id) {
              return {
                ...i,
                stage: newStage,
                position: newPosition,
                updatedAt: new Date(),
                lastActivity: new Date(),
                // If moving to released, set release date
                releaseDate: newStage === 'released' && !i.releaseDate ? new Date() : i.releaseDate,
              };
            }

            if (isSameStage) {
              if (oldPosition < newPosition) {
                if (i.stage === oldStage && i.position > oldPosition && i.position <= newPosition) {
                  return { ...i, position: i.position - 1 };
                }
              } else if (oldPosition > newPosition) {
                if (i.stage === oldStage && i.position >= newPosition && i.position < oldPosition) {
                  return { ...i, position: i.position + 1 };
                }
              }
            } else {
              if (i.stage === oldStage && i.position > oldPosition) {
                return { ...i, position: i.position - 1 };
              }
              if (i.stage === newStage && i.position >= newPosition) {
                return { ...i, position: i.position + 1 };
              }
            }

            return i;
          });

          return { items: updatedItems };
        });
      },

      getMetrics: () => {
        const { items } = get();
        const total = items.length;

        const byStage: Record<RoadmapStage, { count: number }> = {
          ideas: { count: 0 },
          'in-progress': { count: 0 },
          released: { count: 0 },
        };

        const byPriority = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        };

        const byCategory: Record<string, number> = {};

        items.forEach((item) => {
          byStage[item.stage].count++;
          if (item.priority) {
            byPriority[item.priority]++;
          }
          if (item.category) {
            byCategory[item.category] = (byCategory[item.category] || 0) + 1;
          }
        });

        return {
          total,
          byStage,
          byPriority,
          byCategory,
        };
      },

      getColumns: () => {
        const { items } = get();
        return defaultStages.map((stage) => ({
          ...stage,
          items: items
            .filter((item) => item.stage === stage.id)
            .sort((a, b) => a.position - b.position),
        }));
      },
    }),
    {
      name: 'constructos-roadmap',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        if (persistedState && typeof persistedState === 'object' && 'items' in persistedState) {
          return {
            ...currentState,
            items: deserializeRoadmapItems((persistedState as any).items),
          };
        }
        return currentState;
      },
    }
  )
);
