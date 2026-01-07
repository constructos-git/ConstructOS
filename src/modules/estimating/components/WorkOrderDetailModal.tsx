import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { tokensRepo } from '../data/tokens.repo';
import { activityRepo } from '../data/activity.repo';
import { ShareLinkPanel } from './ShareLinkPanel';
import { ActivityPanel } from './ActivityPanel';
import { WorkOrderPdf } from './pdf/WorkOrderPdf';

const STATUSES = ['draft','sent','accepted','in_progress','completed','cancelled'] as const;

export function WorkOrderDetailModal({
  open,
  data,
  companyId,
  estimateId,
  onClose,
  onUpdate,
}: {
  open: boolean;
  data: { workOrder: any; lines: any[] } | null;
  companyId: string;
  estimateId: string;
  onClose: () => void;
  onUpdate: (patch: any) => Promise<void>;
}) {
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));
  const [status, setStatus] = useState('draft');

  const wo = data?.workOrder;
  const lines = data?.lines ?? [];

  const tokenQ = useQuery({
    queryKey: ['workOrderToken', companyId, wo?.id],
    queryFn: () => tokensRepo.getActive(companyId, 'work_order', wo?.id as string),
    enabled: !!wo?.id && open,
  });

  const activityQ = useQuery({
    queryKey: ['workOrderActivity', companyId, wo?.id],
    queryFn: () => activityRepo.list(companyId, 'work_order', wo?.id as string),
    enabled: !!wo?.id && open,
  });

  const tokenRow = tokenQ.data ?? null;
  const shareUrl = tokenRow ? `${window.location.origin}/shared/work-order/${tokenRow.token}` : null;
  const activity = activityQ.data ?? [];

  useEffect(() => {
    if (wo?.status) setStatus(wo.status);
  }, [wo]);

  if (!open || !data) return null;

  async function handleGenerateLink(expiresAt: string | null) {
    if (!wo?.id) return;
    await tokensRepo.create(companyId, 'work_order', wo.id, expiresAt);
    await activityRepo.log(companyId, estimateId, 'work_order', wo.id, 'token_created', 'Share link generated');
    await tokenQ.refetch();
    await activityQ.refetch();
  }

  async function handleRevokeLink() {
    if (!tokenRow?.id) return;
    await tokensRepo.revoke(companyId, tokenRow.id);
    await activityRepo.log(companyId, estimateId, 'work_order', wo.id, 'token_revoked', 'Share link revoked');
    await tokenQ.refetch();
    await activityQ.refetch();
  }

  async function handleMarkAsSent() {
    if (!wo?.id) return;
    if (wo.status === 'draft') {
      await onUpdate({ status: 'sent' });
      const message = wo.assigned_to_email ? `Sent to ${wo.assigned_to_email}` : 'Marked as sent';
      await activityRepo.log(companyId, estimateId, 'work_order', wo.id, 'sent', message);
      await activityQ.refetch();
      
      // Generate link if not exists and copy to clipboard
      if (!tokenRow) {
        await handleGenerateLink(null);
        const newToken = await tokensRepo.getActive(companyId, 'work_order', wo.id);
        if (newToken) {
          const url = `${window.location.origin}/shared/work-order/${newToken.token}`;
          await navigator.clipboard.writeText(url);
        }
      } else if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
      }
    }
  }

  async function handlePdfDownload() {
    if (!wo?.id) return;
    await activityRepo.log(companyId, estimateId, 'work_order', wo.id, 'pdf_downloaded', 'PDF downloaded');
    await activityQ.refetch();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{wo.title}</div>
            <div className="text-xs text-slate-500">Work Order • Total: {fmt(wo.total)}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-3 space-y-3 overflow-auto">
          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">Assignment</div>
            <div className="text-sm">Contractor: {wo.assigned_to_name || '—'}</div>
            <div className="text-sm">Email: {wo.assigned_to_email || '—'}</div>
          </Card>

          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">Status</div>
            <select className="w-full rounded border px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <Button size="sm" onClick={async () => {
                const oldStatus = wo.status;
                await onUpdate({ status });
                if (oldStatus !== status) {
                  await activityRepo.log(companyId, estimateId, 'work_order', wo.id, 'status_changed', `Status changed from ${oldStatus} to ${status}`);
                  await activityQ.refetch();
                }
              }}>
                Save status
              </Button>
            </div>
          </Card>

          <Card className="p-3 space-y-2">
            <div className="text-xs font-semibold text-slate-500">Lines</div>
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.id} className="rounded border px-2 py-2">
                  <div className="text-sm font-medium">{l.title}</div>
                  <div className="text-xs text-slate-500">
                    Qty: {l.quantity} {l.unit} • Unit cost: {fmt(l.unit_cost)} • Line: {fmt(l.line_cost)}
                  </div>
                </div>
              ))}
              {lines.length === 0 ? <div className="text-xs text-slate-500">No lines.</div> : null}
            </div>
          </Card>

          <ShareLinkPanel
            tokenRow={tokenRow}
            shareUrl={shareUrl}
            onGenerate={handleGenerateLink}
            onRevoke={handleRevokeLink}
          />

          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">Actions</div>
            <div className="flex gap-2 flex-wrap">
              {wo.status === 'draft' && (
                <Button size="sm" onClick={handleMarkAsSent}>
                  Mark as Sent
                </Button>
              )}
              <div onClick={handlePdfDownload}>
                <PDFDownloadLink
                  document={<WorkOrderPdf workOrder={wo} lines={lines} />}
                  fileName={`Work-Order-${wo.id}.pdf`}
                >
                  {({ loading }) => (
                    <Button size="sm" variant="secondary" disabled={loading}>
                      {loading ? 'Preparing…' : 'Download PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </Card>

          <ActivityPanel rows={activity} />
        </div>
      </div>
    </div>
  );
}

