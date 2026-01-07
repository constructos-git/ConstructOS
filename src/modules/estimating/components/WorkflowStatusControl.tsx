import { useState } from 'react';
import Button from '@/components/ui/Button';
import { workflowService } from '../workflow/workflowService';
import type { EstimateStatus } from '../workflow/workflowTypes';

export function WorkflowStatusControl({
  companyId,
  estimateId,
  currentStatus,
  onStatusChanged,
}: {
  companyId: string;
  estimateId: string;
  currentStatus: string;
  onStatusChanged: () => void;
}) {
  const [changing, setChanging] = useState(false);
  const allowed = workflowService.getAllowedTransitions(currentStatus, 'estimate');

  async function handleTransition(toStatus: string) {
    if (!confirm(`Change status from ${currentStatus} to ${toStatus}?`)) return;
    setChanging(true);
    try {
      await workflowService.transitionEstimate(companyId, estimateId, toStatus as EstimateStatus);
      onStatusChanged();
    } catch (error) {
      console.error('Failed to transition:', error);
      alert(`Failed to change status: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setChanging(false);
    }
  }

  if (allowed.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Change status:</span>
      <select
        className="rounded border px-2 py-1 text-sm"
        value=""
        onChange={(e) => {
          if (e.target.value) handleTransition(e.target.value);
          e.target.value = '';
        }}
        disabled={changing}
      >
        <option value="">Select...</option>
        {allowed.map((status) => (
          <option key={status} value={status}>
            → {status}
          </option>
        ))}
      </select>
    </div>
  );
}

