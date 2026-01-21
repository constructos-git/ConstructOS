import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Opportunity } from '@/types/opportunities';
import { Archive } from 'lucide-react';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ArchiveConfirmModal({
  isOpen,
  opportunity,
  onConfirm,
  onCancel,
}: ArchiveConfirmModalProps) {
  if (!opportunity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Archive Opportunity"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Archive className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Are you sure you want to archive this opportunity? It will be moved to the archive and hidden from the main board.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">{opportunity.title}</p>
          <p className="text-sm text-muted-foreground">
            Company: {opportunity.company}
          </p>
          {opportunity.value && (
            <p className="text-sm text-muted-foreground">
              Value: {opportunity.currency} {opportunity.value.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="default">
            <Archive className="h-4 w-4 mr-2" />
            Archive Opportunity
          </Button>
        </div>
      </div>
    </Modal>
  );
}
