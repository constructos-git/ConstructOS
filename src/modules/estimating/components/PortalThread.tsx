import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { portalRepo } from '../data/portal.repo';

export function PortalThread({ token }: { token: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [token]);

  async function loadEvents() {
    try {
      const data = await portalRepo.getEvents(token);
      setEvents(data);
      setAcknowledged(data.some((e: any) => e.event_type === 'acknowledged'));
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  }

  async function handleAcknowledge() {
    try {
      setLoading(true);
      await portalRepo.submitEvent(token, 'acknowledged');
      setAcknowledged(true);
      await loadEvents();
    } catch (error) {
      console.error('Failed to acknowledge:', error);
      alert('Failed to acknowledge. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitNote() {
    if (!noteText.trim()) return;
    try {
      setLoading(true);
      await portalRepo.submitEvent(token, 'note', noteText);
      setNoteText('');
      await loadEvents();
    } catch (error) {
      console.error('Failed to submit note:', error);
      alert('Failed to submit note. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAvailability() {
    if (!availabilityDate) return;
    try {
      setLoading(true);
      await portalRepo.submitEvent(token, 'availability', undefined, availabilityDate);
      setAvailabilityDate('');
      await loadEvents();
    } catch (error) {
      console.error('Failed to submit availability:', error);
      alert('Failed to submit availability. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Communication</div>

      {!acknowledged && (
        <div>
          <Button size="sm" onClick={handleAcknowledge} disabled={loading}>
            Acknowledge
          </Button>
        </div>
      )}

      {acknowledged && (
        <div className="text-xs text-green-600">✓ Acknowledged</div>
      )}

      <div className="space-y-2">
        <div>
          <label className="text-xs text-slate-600">Add a note or question</label>
          <textarea
            className="w-full rounded border px-2 py-1 text-sm"
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your message..."
          />
          <Button size="sm" onClick={handleSubmitNote} disabled={loading || !noteText.trim()}>
            Send
          </Button>
        </div>

        <div>
          <label className="text-xs text-slate-600">Confirm availability date (optional)</label>
          <input
            type="date"
            className="w-full rounded border px-2 py-1 text-sm"
            value={availabilityDate}
            onChange={(e) => setAvailabilityDate(e.target.value)}
          />
          <Button size="sm" onClick={handleSubmitAvailability} disabled={loading || !availabilityDate}>
            Submit
          </Button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold">Event History</div>
          {events.map((e: any) => (
            <div key={e.id} className="rounded border p-2 text-xs">
              <div className="font-medium">{e.event_type}</div>
              {e.event_message && <div className="text-slate-600">{e.event_message}</div>}
              {e.availability_date && <div className="text-slate-600">Available: {new Date(e.availability_date).toLocaleDateString()}</div>}
              <div className="text-slate-400">{new Date(e.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

