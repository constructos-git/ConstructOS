import { useState } from 'react';
import { estimatesRepo } from '../data/estimates.repo';
import type { Estimate, EstimateStatus } from '../domain/estimating.types';
import Select from '@/components/ui/Select';

// Status options matching the kanban columns
const statusOptions: { value: EstimateStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'archived', label: 'Archived' },
];

export function WorkflowStatusControl({
  companyId: _companyId,
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

  async function handleStatusChange(newStatus: EstimateStatus) {
    if (currentStatus === newStatus) return;
    
    setChanging(true);
    try {
      await estimatesRepo.update(estimateId, { status: newStatus });
      onStatusChanged();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(`Failed to change status: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Change status:</span>
      <Select
        value={currentStatus}
        onChange={(e) => {
          handleStatusChange(e.target.value as EstimateStatus);
        }}
        disabled={changing}
        options={statusOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        className="text-sm"
      />
    </div>
  );
}

