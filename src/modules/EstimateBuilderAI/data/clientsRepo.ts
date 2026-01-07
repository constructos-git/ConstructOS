// Clients Repository (for Estimate Builder AI)

import { supabase } from '@/lib/supabase';

const SHARED_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

function getCompanyId(companyId: string | null | undefined): string {
  return companyId || SHARED_COMPANY_ID;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  companyId: string;
}

export const clientsRepo = {
  async list(companyId: string | null | undefined) {
    const cid = getCompanyId(companyId);
    // Try to get from clients table if it exists
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', cid)
        .order('name', { ascending: true });
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') throw error;
      return (data ?? []) as Client[];
    } catch (error: any) {
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return [] as Client[];
      }
      throw error;
    }
  },

  async create(companyId: string | null | undefined, payload: { name: string; email?: string; phone?: string; address?: string }) {
    const cid = getCompanyId(companyId);
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          company_id: cid,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as Client;
    } catch (error: any) {
      // If table doesn't exist, create a minimal client object
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return {
          id: `client-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          companyId: cid,
        } as Client;
      }
      throw error;
    }
  },
};

