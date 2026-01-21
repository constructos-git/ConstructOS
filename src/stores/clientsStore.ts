import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Client, 
  ContactFilters, 
  ContactSortOptions, 
  ContactViewType 
} from '@/types/contacts';
import { supabase } from '@/lib/supabase';

interface ClientsState {
  // State
  clients: Client[];
  selectedClient: Client | null;
  viewType: ContactViewType;
  filters: ContactFilters;
  sortOptions: ContactSortOptions;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setViewType: (viewType: ContactViewType) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortOptions: (sort: ContactSortOptions) => void;
  
  // CRUD Operations
  fetchClients: () => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client | null>;
  updateClient: (id: string, client: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  
  // Utility
  getClientById: (id: string) => Client | undefined;
  clearError: () => void;
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      // Initial State
      clients: [],
      selectedClient: null,
      viewType: 'grid',
      filters: {},
      sortOptions: { field: 'created_at', direction: 'desc' },
      isLoading: false,
      error: null,
      
      // Setters
      setClients: (clients) => set({ clients }),
      setSelectedClient: (client) => set({ selectedClient: client }),
      setViewType: (viewType) => set({ viewType }),
      setFilters: (filters) => set({ filters }),
      setSortOptions: (sortOptions) => set({ sortOptions }),
      
      // Fetch Clients
      fetchClients: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('clients')
            .select(`
              *,
              company:companies(*)
            `)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const clients: Client[] = (data || []).map((item: any) => ({
            ...item,
            company: item.company?.[0] || null,
          }));
          
          set({ clients, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      // Create Client
      createClient: async (clientData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('clients')
            .insert(clientData)
            .select(`
              *,
              company:companies(*)
            `)
            .single();
          
          if (error) throw error;
          
          const newClient: Client = {
            ...data,
            company: data.company?.[0] || null,
          };
          
          set((state) => ({
            clients: [newClient, ...state.clients],
            isLoading: false,
          }));
          
          return newClient;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      // Update Client
      updateClient: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select(`
              *,
              company:companies(*)
            `)
            .single();
          
          if (error) throw error;
          
          const updatedClient: Client = {
            ...data,
            company: data.company?.[0] || null,
          };
          
          set((state) => ({
            clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
            selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Delete Client
      deleteClient: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            clients: state.clients.filter((c) => c.id !== id),
            selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Utility Functions
      getClientById: (id) => {
        return get().clients.find((c) => c.id === id);
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'clients-storage',
      partialize: (state) => ({
        viewType: state.viewType,
        filters: state.filters,
        sortOptions: state.sortOptions,
      }),
    }
  )
);
