import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Contact, 
  ContactFilters, 
  ContactSortOptions, 
  ContactViewType 
} from '@/types/contacts';
import { supabase } from '@/lib/supabase';

interface ContactsState {
  // State
  contacts: Contact[];
  selectedContact: Contact | null;
  viewType: ContactViewType;
  filters: ContactFilters;
  sortOptions: ContactSortOptions;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setViewType: (viewType: ContactViewType) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortOptions: (sort: ContactSortOptions) => void;
  
  // CRUD Operations
  fetchContacts: () => Promise<void>;
  createContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => Promise<Contact | null>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  
  // Utility
  getContactById: (id: string) => Contact | undefined;
  getContactsByCompany: (companyId: string) => Contact[];
  clearError: () => void;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      // Initial State
      contacts: [],
      selectedContact: null,
      viewType: 'grid',
      filters: {},
      sortOptions: { field: 'created_at', direction: 'desc' },
      isLoading: false,
      error: null,
      
      // Setters
      setContacts: (contacts) => set({ contacts }),
      setSelectedContact: (contact) => set({ selectedContact: contact }),
      setViewType: (viewType) => set({ viewType }),
      setFilters: (filters) => set({ filters }),
      setSortOptions: (sortOptions) => set({ sortOptions }),
      
      // Fetch Contacts
      fetchContacts: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contacts')
            .select(`
              *,
              company:companies(*)
            `)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const contacts: Contact[] = (data || []).map((item: any) => ({
            ...item,
            company: item.company?.[0] || null,
            full_name: `${item.first_name} ${item.last_name}`,
          }));
          
          set({ contacts, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      // Create Contact
      createContact: async (contactData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contacts')
            .insert(contactData)
            .select(`
              *,
              company:companies(*)
            `)
            .single();
          
          if (error) throw error;
          
          const newContact: Contact = {
            ...data,
            company: data.company?.[0] || null,
            full_name: `${data.first_name} ${data.last_name}`,
          };
          
          set((state) => ({
            contacts: [newContact, ...state.contacts],
            isLoading: false,
          }));
          
          return newContact;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },
      
      // Update Contact
      updateContact: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('contacts')
            .update(updates)
            .eq('id', id)
            .select(`
              *,
              company:companies(*)
            `)
            .single();
          
          if (error) throw error;
          
          const updatedContact: Contact = {
            ...data,
            company: data.company?.[0] || null,
            full_name: `${data.first_name} ${data.last_name}`,
          };
          
          set((state) => ({
            contacts: state.contacts.map((c) => (c.id === id ? updatedContact : c)),
            selectedContact: state.selectedContact?.id === id ? updatedContact : state.selectedContact,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Delete Contact
      deleteContact: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set((state) => ({
            contacts: state.contacts.filter((c) => c.id !== id),
            selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
            isLoading: false,
          }));
          
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },
      
      // Utility Functions
      getContactById: (id) => {
        return get().contacts.find((c) => c.id === id);
      },
      
      getContactsByCompany: (companyId) => {
        return get().contacts.filter((c) => c.company_uuid === companyId);
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'contacts-storage',
      partialize: (state) => ({
        viewType: state.viewType,
        filters: state.filters,
        sortOptions: state.sortOptions,
      }),
    }
  )
);
