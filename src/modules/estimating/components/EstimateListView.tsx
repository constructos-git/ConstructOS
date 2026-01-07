import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EstimateRowActions } from './EstimateRowActions';
import type { Estimate } from '../domain/estimating.types';

export function EstimateListView({
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
  return (
    <div className="space-y-3">
      {estimates.map((estimate) => (
        <Card
          key={estimate.id}
          className="hover:bg-accent transition-colors"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => onEstimateClick(estimate)}>
                <CardTitle className="text-base">{estimate.title}</CardTitle>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Status: {estimate.status}</span>
                  <span>Total: £{estimate.total.toFixed(2)}</span>
                  {estimate.reference && <span>Ref: {estimate.reference}</span>}
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
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

