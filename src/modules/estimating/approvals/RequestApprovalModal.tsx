import { useState } from 'react';
import Button from '@/components/ui/Button';
import { approvalsRepo } from './approvals.repo';

export function RequestApprovalModal({
  open,
  onClose,
  onRequested,
  companyId,
  subjectType,
  subjectId,
  estimateId,
}: {
  open: boolean;
  onClose: () => void;
  onRequested: () => void;
  companyId: string;
  subjectType: 'estimate' | 'variation';
  subjectId: string;
  estimateId?: string;
}) {
  const [requestedTo, setRequestedTo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!requestedTo.trim()) return;
    setSubmitting(true);
    try {
      await approvalsRepo.request(companyId, {
        subjectType,
        subjectId,
        estimateId,
        requestedTo,
        message: message || undefined,
      });
      onRequested();
    } catch (error) {
      console.error('Failed to request approval:', error);
      alert('Failed to request approval');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Request Approval</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <label className="text-xs text-slate-600">Request to (User ID)</label>
            <input
              type="text"
              className="w-full rounded border px-2 py-1 text-sm"
              value={requestedTo}
              onChange={(e) => setRequestedTo(e.target.value)}
              placeholder="User UUID"
            />
            <div className="text-xs text-slate-400 mt-1">
              Note: In a full implementation, this would be a user picker
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-600">Message (optional)</label>
            <textarea
              className="w-full rounded border px-2 py-1 text-sm"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting || !requestedTo.trim()}>
              {submitting ? 'Submitting...' : 'Request'}
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

