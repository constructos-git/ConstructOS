import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Consultant, 
  ContactFilters, 
  ContactSortOptions, 
  ContactViewType 
} from '@/types/contacts';
import { supabase } from '@/lib/supabase';

interface ConsultantsState {
  // State
  consultants: Consultant[];
  selectedConsultant: Consultant | null;
  viewType: ContactViewType;
  filters: ContactFilters;
  sortOptions: ContactSortOptions;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConsultants: (consultants: Consultant[]) => void;
  setSelectedConsultant: (consultant: Consultant | null) => void;
  setViewType: (viewType: ContactViewType) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortOptions: (sort: ContactSortOptions) => void;
  
  // CRUD Operations
  fetchConsultants: () => Promise<void>;
  createConsultant: (consultant: Omit<Consultant, 'id' | 'created_at' | 'updated_at'>) => Promise<Consultant | null>;
  updateConsultant: (id: string, consultant: Partial<Consultant>) => Promise<boolean>;
  deleteConsultant: (id: string) => Promise<boolean>;
  
  // Utility
  getConsultantById: (id: string) => Consultant | undefined;
  getConsultantsByType: (type: string) => Consultant[];
  clearError: () => void;
}

export const useConsultantsStore = create<ConsultantsState>()(
  persist(
    (set, get) => ({
      // Initial State
      consultants: [],
      selectedConsultant: null,
      viewType: 'grid',
      filters: {},
      sortOptions: { field: 'created_at', direction: 'desc' },
      isLoading: false,
      error: null,
      
      // Setters
      setConsultants: (consultants) => set({ consultants }),
      setSelectedConsultant: (consultant) => set({ selectedConsultant: consultant }),
      setViewType: (viewType) => set({ viewType }),
      setFilters: (filters) => set({ filters }),
      setSortOptions: (sortOptions) => set({ sortOptions }),
      
      // Fetch Consultants
      fetchConsultants: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('consultants')
            .select(`
              *,
              company:companies(*),
              contact:contacts(*)
            `)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const consultants: Consultant[] = (data || []).map((item: any) => ({
            ...item,
            company: item.company?.[0] || null,
            contact: item.contact?.[0] || null,
          }));
          
          set({ consultants, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      // Create Consultant
      createConsultant: async (consultantData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('consultants')
            .insert(consultantData)
            .select(`
              *,
              company:companies(*),
              contact:contacts(*)
            `)
            .single();
          
          if (error) throw error;
          
          const newConsultant: Consultant = {
            ...data,
            company: data.company?.[0] || null,
            contact: data.contact?.[0] || null,
          };
          
          set((state) => ({
            consultants: [newConsultant, ...state.consultants],
            isLoading: false,
          }));
          
          return newConsultant;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      // Update Consultant
      updateConsultant: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('consultants')
            .update(updates)
            .eq('id', id)
            .select(`
              *,
              company:companies(*),
              contact:contacts(*)
            `)
            .single();
          
          if (error) throw error;
          
          const updatedConsultant: Consultant = {
            ...data,
            company: data.company?.[0] || null,
            contact: data.contact?.[0] || null,
          };
          
          set((state) => ({
            consultants: state.consultants.map((c) => (c.id === id ? updatedConsultant : c)),
            selectedConsultant: state.selectedConsultant?.id === id ? updatedConsultant : state.selectedConsultant,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Delete Consultant
      deleteConsultant: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('consultants')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            consultants: state.consultants.filter((c) => c.id !== id),
            selectedConsultant: state.selectedConsultant?.id === id ? null : state.selectedConsultant,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Utility Functions
      getConsultantById: (id) => {
        return get().consultants.find((c) => c.id === id);
      },
      
      getConsultantsByType: (type) => {
        return get().consultants.filter((c) => c.consultant_type === type);
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'consultants-storage',
      partialize: (state) => ({
        viewType: state.viewType,
        filters: state.filters,
        sortOptions: state.sortOptions,
      }),
    }
  )
);
