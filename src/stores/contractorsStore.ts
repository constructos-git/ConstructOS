import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Contractor, 
  ContactFilters, 
  ContactSortOptions, 
  ContactViewType 
} from '@/types/contacts';
import { supabase } from '@/lib/supabase';

interface ContractorsState {
  // State
  contractors: Contractor[];
  selectedContractor: Contractor | null;
  viewType: ContactViewType;
  filters: ContactFilters;
  sortOptions: ContactSortOptions;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContractors: (contractors: Contractor[]) => void;
  setSelectedContractor: (contractor: Contractor | null) => void;
  setViewType: (viewType: ContactViewType) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortOptions: (sort: ContactSortOptions) => void;
  
  // CRUD Operations
  fetchContractors: () => Promise<void>;
  createContractor: (contractor: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>) => Promise<Contractor | null>;
  updateContractor: (id: string, contractor: Partial<Contractor>) => Promise<boolean>;
  deleteContractor: (id: string) => Promise<boolean>;
  
  // Utility
  getContractorById: (id: string) => Contractor | undefined;
  getContractorsByTrade: (trade: string) => Contractor[];
  clearError: () => void;
}

export const useContractorsStore = create<ContractorsState>()(
  persist(
    (set, get) => ({
      // Initial State
      contractors: [],
      selectedContractor: null,
      viewType: 'grid',
      filters: {},
      sortOptions: { field: 'created_at', direction: 'desc' },
      isLoading: false,
      error: null,
      
      // Setters
      setContractors: (contractors) => set({ contractors }),
      setSelectedContractor: (contractor) => set({ selectedContractor: contractor }),
      setViewType: (viewType) => set({ viewType }),
      setFilters: (filters) => set({ filters }),
      setSortOptions: (sortOptions) => set({ sortOptions }),
      
      // Fetch Contractors
      fetchContractors: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contractors')
            .select(`
              *,
              company:companies(*),
              preferred_contact:contacts(*)
            `)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const contractors: Contractor[] = (data || []).map((item: any) => ({
            ...item,
            company: item.company?.[0] || null,
            preferred_contact: item.preferred_contact?.[0] || null,
          }));
          
          set({ contractors, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      // Create Contractor
      createContractor: async (contractorData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contractors')
            .insert(contractorData)
            .select(`
              *,
              company:companies(*),
              preferred_contact:contacts(*)
            `)
            .single();
          
          if (error) throw error;
          
          const newContractor: Contractor = {
            ...data,
            company: data.company?.[0] || null,
            preferred_contact: data.preferred_contact?.[0] || null,
          };
          
          set((state) => ({
            contractors: [newContractor, ...state.contractors],
            isLoading: false,
          }));
          
          return newContractor;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      // Update Contractor
      updateContractor: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contractors')
            .update(updates)
            .eq('id', id)
            .select(`
              *,
              company:companies(*),
              preferred_contact:contacts(*)
            `)
            .single();
          
          if (error) throw error;
          
          const updatedContractor: Contractor = {
            ...data,
            company: data.company?.[0] || null,
            preferred_contact: data.preferred_contact?.[0] || null,
          };
          
          set((state) => ({
            contractors: state.contractors.map((c) => (c.id === id ? updatedContractor : c)),
            selectedContractor: state.selectedContractor?.id === id ? updatedContractor : state.selectedContractor,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Delete Contractor
      deleteContractor: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('contractors')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            contractors: state.contractors.filter((c) => c.id !== id),
            selectedContractor: state.selectedContractor?.id === id ? null : state.selectedContractor,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Utility Functions
      getContractorById: (id) => {
        return get().contractors.find((c) => c.id === id);
      },
      
      getContractorsByTrade: (trade) => {
        return get().contractors.filter((c) => c.trade_types?.includes(trade));
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'contractors-storage',
      partialize: (state) => ({
        viewType: state.viewType,
        filters: state.filters,
        sortOptions: state.sortOptions,
      }),
    }
  )
);
