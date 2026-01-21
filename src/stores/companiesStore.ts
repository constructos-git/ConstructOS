import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Company, 
  ContactFilters, 
  ContactSortOptions, 
  ContactViewType 
} from '@/types/contacts';
import { supabase } from '@/lib/supabase';

interface CompaniesState {
  // State
  companies: Company[];
  selectedCompany: Company | null;
  viewType: ContactViewType;
  filters: ContactFilters;
  sortOptions: ContactSortOptions;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setViewType: (viewType: ContactViewType) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortOptions: (sort: ContactSortOptions) => void;
  
  // CRUD Operations
  fetchCompanies: () => Promise<void>;
  createCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<Company | null>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<boolean>;
  deleteCompany: (id: string) => Promise<boolean>;
  
  // Utility
  getCompanyById: (id: string) => Company | undefined;
  getCompaniesByType: (type: string) => Company[];
  clearError: () => void;
}

export const useCompaniesStore = create<CompaniesState>()(
  persist(
    (set, get) => ({
      // Initial State
      companies: [],
      selectedCompany: null,
      viewType: 'grid',
      filters: {},
      sortOptions: { field: 'created_at', direction: 'desc' },
      isLoading: false,
      error: null,
      
      // Setters
      setCompanies: (companies) => set({ companies }),
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      setViewType: (viewType) => set({ viewType }),
      setFilters: (filters) => set({ filters }),
      setSortOptions: (sortOptions) => set({ sortOptions }),
      
      // Fetch Companies
      fetchCompanies: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ companies: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      // Create Company
      createCompany: async (companyData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('companies')
            .insert(companyData)
            .select()
            .single();
          
          if (error) throw error;
          
          set((state) => ({
            companies: [data, ...state.companies],
            isLoading: false,
          }));
          
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      // Update Company
      updateCompany: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('companies')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          set((state) => ({
            companies: state.companies.map((c) => (c.id === id ? data : c)),
            selectedCompany: state.selectedCompany?.id === id ? data : state.selectedCompany,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Delete Company
      deleteCompany: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            companies: state.companies.filter((c) => c.id !== id),
            selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Utility Functions
      getCompanyById: (id) => {
        return get().companies.find((c) => c.id === id);
      },
      
      getCompaniesByType: (type) => {
        return get().companies.filter((c) => c.type === type);
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'companies-storage',
      partialize: (state) => ({
        viewType: state.viewType,
        filters: state.filters,
        sortOptions: state.sortOptions,
      }),
    }
  )
);
