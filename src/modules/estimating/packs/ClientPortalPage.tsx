import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export function ClientPortalPage() {
  const { token } = useParams();
  const [pack, setPack] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('quote');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_client_pack_by_token', { p_token: token });
      if (error) throw error;
      if (data?.pack) {
        setPack(data.pack);
      }

      const { data: timelineData, error: timelineError } = await supabase.rpc('get_client_portal_timeline', { p_token: token });
      if (timelineError) throw timelineError;
      if (timelineData?.events) {
        setEvents(timelineData.events);
      }
    } catch (error) {
      console.error('Failed to load portal data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!pack) return <div className="p-4">Pack not found or expired</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Card className="p-4">
          <h1 className="text-2xl font-bold">{pack.name}</h1>
          {pack.description && <p className="text-sm text-slate-600 mt-1">{pack.description}</p>}
        </Card>

        <div className="flex gap-2 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'quote' ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}
            onClick={() => setActiveTab('quote')}
            type="button"
          >
            Quote
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'timeline' ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}
            onClick={() => setActiveTab('timeline')}
            type="button"
          >
            Timeline
          </button>
        </div>

        {activeTab === 'quote' && (
          <Card className="p-4">
            <div className="text-sm text-slate-600">Quote content will be rendered here</div>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Timeline</div>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="border-l-2 pl-3 py-2">
                  <div className="text-sm font-medium">{event.event_type}</div>
                  {event.event_message && <div className="text-xs text-slate-500">{event.event_message}</div>}
                  <div className="text-xs text-slate-400">{new Date(event.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

