import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Opportunity, OpportunityStage, OpportunityMetrics, KanbanColumn } from '@/types/opportunities';

interface OpportunitiesState {
  opportunities: Opportunity[];
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  moveOpportunity: (id: string, newStage: OpportunityStage, newPosition: number) => void;
  archiveOpportunity: (id: string, reason?: 'lost' | 'won') => void;
  restoreOpportunity: (id: string) => void;
  getArchivedOpportunities: (reason?: 'lost' | 'won') => Opportunity[];
  getMetrics: () => OpportunityMetrics;
  getColumns: () => KanbanColumn[];
}

const defaultStages: { id: OpportunityStage; title: string; color: string }[] = [
  { id: 'lead', title: 'Lead', color: 'bg-gray-500' },
  { id: 'qualified', title: 'Qualified', color: 'bg-blue-500' },
  { id: 'proposal', title: 'Proposal', color: 'bg-yellow-500' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-500' },
  { id: 'won', title: 'Won', color: 'bg-green-500' },
  { id: 'lost', title: 'Lost', color: 'bg-red-500' },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to deserialize dates from localStorage
const deserializeOpportunities = (opportunities: any[]): Opportunity[] => {
  return opportunities.map((opp, index) => ({
    ...opp,
    position: typeof opp.position === 'number' ? opp.position : index, // Default to index if position missing
    expectedCloseDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate) : undefined,
    createdAt: opp.createdAt ? new Date(opp.createdAt) : new Date(),
    updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : new Date(),
    lastActivity: opp.lastActivity ? new Date(opp.lastActivity) : new Date(),
    archivedAt: opp.archivedAt ? new Date(opp.archivedAt) : undefined,
    isArchived: opp.isArchived || false,
    archiveReason: opp.archiveReason,
  }));
};

const defaultOpportunities: Opportunity[] = [
        {
          id: '1',
          title: 'Office Renovation Project',
          company: 'ABC Construction',
          contact: 'John Smith',
          value: 125000,
          currency: 'GBP',
          stage: 'proposal',
          probability: 75,
          expectedCloseDate: new Date('2024-02-15'),
          source: 'Website',
          description: 'Full office renovation including flooring, lighting, and HVAC',
          assignedTo: 'John Doe',
          tags: ['Commercial', 'Renovation'],
          position: 0,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20'),
          lastActivity: new Date('2024-01-20'),
        },
        {
          id: '2',
          title: 'Warehouse Build',
          company: 'XYZ Logistics',
          contact: 'Sarah Johnson',
          value: 450000,
          currency: 'GBP',
          stage: 'negotiation',
          probability: 60,
          expectedCloseDate: new Date('2024-03-01'),
          source: 'Referral',
          description: 'New warehouse construction project',
          assignedTo: 'Sarah Miller',
          tags: ['New Build', 'Warehouse'],
          position: 0,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-18'),
          lastActivity: new Date('2024-01-18'),
        },
        {
          id: '3',
          title: 'Residential Development',
          company: 'Smith & Co',
          contact: 'Mike Brown',
          value: 850000,
          currency: 'GBP',
          stage: 'qualified',
          probability: 40,
          expectedCloseDate: new Date('2024-04-15'),
          source: 'Cold Call',
          description: 'Multi-unit residential development',
          assignedTo: 'Mike Brown',
          tags: ['Residential', 'Development'],
          position: 0,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-19'),
          lastActivity: new Date('2024-01-19'),
        },
        {
          id: '4',
          title: 'Retail Store Fit-Out',
          company: 'Fashion Retail Ltd',
          contact: 'Emma Wilson',
          value: 75000,
          currency: 'GBP',
          stage: 'lead',
          probability: 25,
          expectedCloseDate: new Date('2024-02-28'),
          source: 'Website',
          description: 'Complete retail store fit-out',
          assignedTo: 'Alex Lee',
          tags: ['Retail', 'Fit-Out'],
          position: 0,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
          lastActivity: new Date('2024-01-20'),
        },
        {
          id: '5',
          title: 'Hospital Extension',
          company: 'NHS Trust',
          contact: 'Dr. James Taylor',
          value: 1200000,
          currency: 'GBP',
          stage: 'won',
          probability: 100,
          expectedCloseDate: new Date('2024-01-30'),
          source: 'Tender',
          description: 'Hospital extension and renovation',
          assignedTo: 'John Doe',
          tags: ['Healthcare', 'Extension'],
          position: 0,
          createdAt: new Date('2023-12-01'),
          updatedAt: new Date('2024-01-15'),
          lastActivity: new Date('2024-01-15'),
        },
      ];

export const useOpportunitiesStore = create<OpportunitiesState>()(
  persist(
    (set, get) => ({
      opportunities: defaultOpportunities,

        addOpportunity: (opportunityData) => {
        const newOpportunity: Opportunity = {
          ...opportunityData,
          id: generateId(),
          position: 0, // Will be set correctly by moveOpportunity if needed
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => {
          // Find max position in the target stage and add 1
          const stageOpportunities = state.opportunities.filter(
            (opp) => opp.stage === newOpportunity.stage
          );
          const maxPosition = stageOpportunities.length > 0
            ? Math.max(...stageOpportunities.map((opp) => opp.position))
            : -1;
          newOpportunity.position = maxPosition + 1;
          
          return {
            opportunities: [...state.opportunities, newOpportunity],
          };
        });
      },

      updateOpportunity: (id, updates) => {
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id
              ? { ...opp, ...updates, updatedAt: new Date() }
              : opp
          ),
        }));
      },

      deleteOpportunity: (id) => {
        set((state) => {
          const opportunity = state.opportunities.find((opp) => opp.id === id);
          if (!opportunity) return state;
          
          // Remove the opportunity and adjust positions of others in the same stage
          const updatedOpportunities = state.opportunities
            .filter((opp) => opp.id !== id)
            .map((opp) => {
              // Shift down positions of opportunities in the same stage that were after the deleted one
              if (opp.stage === opportunity.stage && opp.position > opportunity.position) {
                return { ...opp, position: opp.position - 1 };
              }
              return opp;
            });
          
          return { opportunities: updatedOpportunities };
        });
      },

      moveOpportunity: (id, newStage, newPosition) => {
        set((state) => {
          const opportunity = state.opportunities.find((opp) => opp.id === id);
          if (!opportunity) return state;

          const isSameStage = opportunity.stage === newStage;
          const oldPosition = opportunity.position;
          const oldStage = opportunity.stage;
          
          // Update positions for all opportunities
          const updatedOpportunities = state.opportunities.map((opp) => {
            if (opp.id === id) {
              // Update the moved opportunity
              return {
                ...opp,
                stage: newStage,
                position: newPosition,
                updatedAt: new Date(),
                lastActivity: new Date(),
              };
            }
            
            // Adjust positions of other opportunities
            if (isSameStage) {
              // Moving within same stage
              if (oldPosition < newPosition) {
                // Moving down: shift items between old and new position up by 1
                if (opp.stage === oldStage && opp.position > oldPosition && opp.position <= newPosition) {
                  return { ...opp, position: opp.position - 1 };
                }
              } else if (oldPosition > newPosition) {
                // Moving up: shift items between new and old position down by 1
                if (opp.stage === oldStage && opp.position >= newPosition && opp.position < oldPosition) {
                  return { ...opp, position: opp.position + 1 };
                }
              }
            } else {
              // Moving to different stage
              // Shift items in old stage that were after the moved item
              if (opp.stage === oldStage && opp.position > oldPosition) {
                return { ...opp, position: opp.position - 1 };
              }
              // Shift items in new stage that are at or after the new position
              if (opp.stage === newStage && opp.position >= newPosition) {
                return { ...opp, position: opp.position + 1 };
              }
            }
            
            return opp;
          });

          return { opportunities: updatedOpportunities };
        });
      },

      getMetrics: () => {
        const { opportunities } = get();
        const total = opportunities.length;
        const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
        const won = opportunities.filter((opp) => opp.stage === 'won').length;
        const lost = opportunities.filter((opp) => opp.stage === 'lost').length;
        const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;
        const averageDealSize = total > 0 ? totalValue / total : 0;

        const byStage: Record<OpportunityStage, { count: number; value: number }> = {
          lead: { count: 0, value: 0 },
          qualified: { count: 0, value: 0 },
          proposal: { count: 0, value: 0 },
          negotiation: { count: 0, value: 0 },
          won: { count: 0, value: 0 },
          lost: { count: 0, value: 0 },
        };

        opportunities.forEach((opp) => {
          byStage[opp.stage].count++;
          byStage[opp.stage].value += opp.value;
        });

        return {
          total,
          totalValue,
          byStage,
          winRate,
          averageDealSize,
          pipelineVelocity: 0, // Calculate based on your business logic
        };
      },

      archiveOpportunity: (id, reason?: 'lost' | 'won') => {
        set((state) => {
          const opportunity = state.opportunities.find((opp) => opp.id === id);
          const archiveReason = reason || (opportunity?.stage === 'won' ? 'won' : 'lost');
          return {
            opportunities: state.opportunities.map((opp) =>
              opp.id === id
                ? { ...opp, isArchived: true, archivedAt: new Date(), archiveReason, updatedAt: new Date() }
                : opp
            ),
          };
        });
      },

      restoreOpportunity: (id) => {
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id
              ? { ...opp, isArchived: false, archivedAt: undefined, archiveReason: undefined, updatedAt: new Date() }
              : opp
          ),
        }));
      },

      getArchivedOpportunities: (reason?: 'lost' | 'won') => {
        const { opportunities } = get();
        return opportunities
          .filter((opp) => {
            if (!opp.isArchived) return false;
            if (reason) return opp.archiveReason === reason;
            return true;
          })
          .sort((a, b) => {
            const aDate = a.archivedAt || a.updatedAt;
            const bDate = b.archivedAt || b.updatedAt;
            if (!aDate || !bDate) return 0;
            const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
            const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();
            return bTime - aTime;
          });
      },

      getColumns: () => {
        const { opportunities } = get();
        // Filter out archived opportunities from the kanban board
        const activeOpportunities = opportunities.filter((opp) => !opp.isArchived);
        return defaultStages.map((stage) => ({
          ...stage,
          opportunities: activeOpportunities
            .filter((opp) => opp.stage === stage.id)
            .sort((a, b) => a.position - b.position), // Sort by position
        }));
      },
    }),
    {
      name: 'constructos-opportunities',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ opportunities: state.opportunities }),
      merge: (persistedState, currentState) => {
        if (persistedState && typeof persistedState === 'object' && 'opportunities' in persistedState) {
          return {
            ...currentState,
            opportunities: deserializeOpportunities((persistedState as any).opportunities),
          };
        }
        return currentState;
      },
    }
  )
);

