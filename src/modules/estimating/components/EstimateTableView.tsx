import { EstimateRowActions } from './EstimateRowActions';
import type { Estimate } from '../domain/estimating.types';

export function EstimateTableView({
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
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Updated</th>
            <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => (
            <tr
              key={estimate.id}
              className="border-t hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onEstimateClick(estimate)}
            >
              <td className="px-4 py-3">
                <div className="font-medium">{estimate.title}</div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {estimate.reference || '-'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted">
                  {estimate.status}
                </span>
              </td>
              <td className="px-4 py-3 font-medium">£{estimate.total.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(estimate.updated_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

