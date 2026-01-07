import { supabase } from '@/lib/supabase';

export const portalRepo = {
  async submitEvent(token: string, eventType: 'acknowledged' | 'note' | 'availability', message?: string, availabilityDate?: string) {
    const { data, error } = await supabase.rpc('submit_portal_event', {
      p_token: token,
      p_event_type: eventType,
      p_message: message ?? '',
      p_availability: availabilityDate ?? null,
    });
    if (error) throw error;
    return data;
  },

  async getEvents(token: string) {
    const { data, error } = await supabase.rpc('get_portal_events_by_token', {
      p_token: token,
    });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

