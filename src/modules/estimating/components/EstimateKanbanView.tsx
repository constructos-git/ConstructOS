import { Card, CardContent } from '@/components/ui/Card';
import { EstimateRowActions } from './EstimateRowActions';
import type { Estimate } from '../domain/estimating.types';

type StatusGroup = 'draft' | 'sent' | 'accepted' | 'rejected' | 'won' | 'lost' | 'archived';

const statusGroups: StatusGroup[] = ['draft', 'sent', 'accepted', 'rejected', 'won', 'lost', 'archived'];

const statusLabels: Record<StatusGroup, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
};

// Map estimate status to kanban status group
function getStatusGroup(status: string): StatusGroup {
  if (status === 'won' || status === 'lost' || status === 'archived') {
    return status as StatusGroup;
  }
  if (status === 'draft' || status === 'sent' || status === 'accepted' || status === 'rejected') {
    return status as StatusGroup;
  }
  return 'draft';
}

export function EstimateKanbanView({
  estimates,
  onEstimateClick,
  onEdit,
  onDelete,
  onArchive,
  onAssignToProject,
  onAssignToOpportunity,
  onAssignToContact,
  onMarkWon,
  onMarkLost,
}: {
  estimates: Estimate[];
  onEstimateClick: (estimate: Estimate) => void;
  onEdit: (estimate: Estimate) => void;
  onDelete: (estimate: Estimate) => void;
  onArchive: (estimate: Estimate) => void;
  onAssignToProject: (estimate: Estimate) => void;
  onAssignToOpportunity: (estimate: Estimate) => void;
  onAssignToContact: (estimate: Estimate) => void;
  onMarkWon: (estimate: Estimate) => void;
  onMarkLost: (estimate: Estimate) => void;
}) {
  const groupedEstimates = statusGroups.reduce((acc, status) => {
    acc[status] = estimates.filter((e) => getStatusGroup(e.status) === status);
    return acc;
  }, {} as Record<StatusGroup, Estimate[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusGroups.map((status) => (
        <div key={status} className="flex-shrink-0 w-64">
          <div className="mb-2 text-sm font-semibold text-muted-foreground uppercase">
            {statusLabels[status]} ({groupedEstimates[status].length})
          </div>
          <div className="space-y-2">
            {groupedEstimates[status].map((estimate) => (
              <Card
                key={estimate.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onEstimateClick(estimate)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{estimate.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        £{estimate.total.toFixed(2)}
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <EstimateRowActions
                        estimate={estimate}
                        onEdit={() => onEdit(estimate)}
                        onDelete={() => onDelete(estimate)}
                        onArchive={() => onArchive(estimate)}
                        onAssignToProject={() => onAssignToProject(estimate)}
                        onAssignToOpportunity={() => onAssignToOpportunity(estimate)}
                        onAssignToContact={() => onAssignToContact(estimate)}
                        onMarkWon={() => onMarkWon(estimate)}
                        onMarkLost={() => onMarkLost(estimate)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

