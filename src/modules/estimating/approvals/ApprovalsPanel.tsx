import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { approvalsRepo } from './approvals.repo';
import { RequestApprovalModal } from './RequestApprovalModal';
import { CollapsibleSection } from '../components/CollapsibleSection';
import Tooltip from '@/components/ui/Tooltip';

export function ApprovalsPanel({
  companyId,
  subjectType,
  subjectId,
  estimateId,
}: {
  companyId: string;
  subjectType: 'estimate' | 'variation';
  subjectId: string;
  estimateId?: string;
}) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [showRequest, setShowRequest] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, [companyId, subjectType, subjectId]);

  async function loadApprovals() {
    try {
      const data = await approvalsRepo.list(companyId, subjectType, subjectId);
      setApprovals(data);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    }
  }

  async function handleDecide(approvalId: string, status: 'approved' | 'rejected', message?: string) {
    setLoading(true);
    try {
      await approvalsRepo.decide(companyId, approvalId, status, message);
      await loadApprovals();
    } catch (error) {
      console.error('Failed to decide approval:', error);
    } finally {
      setLoading(false);
    }
  }

  const pending = approvals.filter((a) => a.status === 'pending');
  const decided = approvals.filter((a) => a.status !== 'pending');

  return (
    <Card className="p-4 space-y-4">
      <CollapsibleSection
        title="Approvals"
        tooltip="Request internal approvals from colleagues before sending quotes or variations. Track approval status and decisions."
        defaultExpanded={false}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Tooltip content="Request approval from a colleague. They will be able to approve or reject with comments.">
              <Button size="sm" onClick={() => setShowRequest(true)}>Request Approval</Button>
            </Tooltip>
          </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500">Pending</div>
          {pending.map((approval) => (
            <div key={approval.id} className="border rounded p-2 text-sm">
              <div className="font-medium">Requested to: {approval.requested_to}</div>
              {approval.request_message && (
                <div className="text-xs text-slate-500 mt-1">{approval.request_message}</div>
              )}
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => handleDecide(approval.id, 'approved')}
                  disabled={loading}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDecide(approval.id, 'rejected')}
                  disabled={loading}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500">Decided</div>
          {decided.map((approval) => (
            <div key={approval.id} className="border rounded p-2 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{approval.requested_to}</div>
                  <div className={`text-xs ${approval.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                    {approval.status}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {approval.decided_at ? new Date(approval.decided_at).toLocaleDateString() : ''}
                </div>
              </div>
              {approval.decision_message && (
                <div className="text-xs text-slate-500 mt-1">{approval.decision_message}</div>
              )}
            </div>
          ))}
        </div>
      )}

          {approvals.length === 0 && (
            <div className="text-xs text-muted-foreground py-2">No approval requests yet</div>
          )}
        </div>
      </CollapsibleSection>

      <RequestApprovalModal
        open={showRequest}
        onClose={() => setShowRequest(false)}
        onRequested={async () => {
          await loadApprovals();
          setShowRequest(false);
        }}
        companyId={companyId}
        subjectType={subjectType}
        subjectId={subjectId}
        estimateId={estimateId}
      />
    </Card>
  );
}

