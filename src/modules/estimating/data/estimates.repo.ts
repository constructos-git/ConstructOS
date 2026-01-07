import { supabase } from '@/lib/supabase';
import type { Estimate } from '../domain/estimating.types';

/**
 * Estimates Repository
 * 
 * ConstructOS is an internal single-tenant system.
 * All authenticated users share access to all estimates.
 * No company_id filtering needed.
 */
export const estimatesRepo = {
  list: async (): Promise<Estimate[]> => {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  getById: async (id: string): Promise<Estimate | null> => {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ?? null;
  },

  create: async (title: string): Promise<Estimate> => {
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be signed in to create estimates. Please sign in and try again.');
    }

    // TEMPORARY WORKAROUND: Use a shared dummy UUID if company_id is NOT NULL
    // TODO: Remove this once schema is fixed: ALTER TABLE public.estimates ALTER COLUMN company_id DROP NOT NULL;
    // This is a single shared UUID for all estimates in the internal system
    const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('estimates')
      .insert({ 
        title,
        company_id: SHARED_COMPANY_ID, // Temporary: use shared UUID until schema is fixed
        created_by: user.id,
        updated_by: user.id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error creating estimate:', error);
      
      // If it's still a NOT NULL constraint error, provide clear instructions
      if (error.message?.includes('null value in column "company_id"')) {
        throw new Error(
          'Database schema error: company_id column must be nullable. ' +
          'Please run this SQL in Supabase: ALTER TABLE public.estimates ALTER COLUMN company_id DROP NOT NULL;'
        );
      }
      
      throw new Error(error.message || `Database error: ${error.code || 'unknown'}`);
    }
    
    if (!data) {
      throw new Error('No data returned from database after creating estimate');
    }
    
    return data as Estimate;
  },

  update: async (id: string, patch: Partial<Estimate>): Promise<Estimate> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be signed in to update estimates.');
    }

    const { data, error } = await supabase
      .from('estimates')
      .update({
        ...patch,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned after update');
    return data as Estimate;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};


