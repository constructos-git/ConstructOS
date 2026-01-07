import { useState } from 'react';
import {
  Edit,
  Trash2,
  Archive,
  FolderKanban,
  Target,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Estimate } from '../domain/estimating.types';

export function EstimateRowActions({
  estimate,
  onEdit,
  onDelete,
  onArchive,
  onAssignToProject,
  onAssignToOpportunity,
  onAssignToContact,
  onMarkWon,
  onMarkLost,
}: {
  estimate: Estimate;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onAssignToProject: () => void;
  onAssignToOpportunity: () => void;
  onAssignToContact: () => void;
  onMarkWon: () => void;
  onMarkLost: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Quick Won/Lost buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onMarkWon();
        }}
        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
        title="Mark as Won"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onMarkLost();
        }}
        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        title="Mark as Lost"
      >
        <XCircle className="h-4 w-4" />
      </Button>

      {/* More actions dropdown */}
      <Dropdown
        trigger={
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(true);
            }}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        }
        align="right"
        isOpen={showActions}
        onOpenChange={setShowActions}
      >
        <div className="p-1 min-w-[180px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setShowActions(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Edit className="h-4 w-4" />
            Edit Estimate
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignToProject();
              setShowActions(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <FolderKanban className="h-4 w-4" />
            Assign to Project
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignToOpportunity();
              setShowActions(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Target className="h-4 w-4" />
            Assign to Opportunity
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignToContact();
              setShowActions(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <User className="h-4 w-4" />
            Assign to Contact
          </button>
          <div className="my-1 border-t" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
              setShowActions(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete "${estimate.title}"? This action cannot be undone.`)) {
                onDelete();
              }
              setShowActions(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </Dropdown>
    </div>
  );
}

