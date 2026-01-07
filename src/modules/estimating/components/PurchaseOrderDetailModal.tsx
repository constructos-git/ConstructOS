import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { tokensRepo } from '../data/tokens.repo';
import { activityRepo } from '../data/activity.repo';
import { ShareLinkPanel } from './ShareLinkPanel';
import { ActivityPanel } from './ActivityPanel';
import { PurchaseOrderPdf } from './pdf/PurchaseOrderPdf';

const STATUSES = ['draft','sent','accepted','in_progress','completed','cancelled'] as const;

export function PurchaseOrderDetailModal({
  open,
  data,
  companyId,
  estimateId,
  onClose,
  onUpdate,
}: {
  open: boolean;
  data: { purchaseOrder: any; lines: any[] } | null;
  companyId: string;
  estimateId: string;
  onClose: () => void;
  onUpdate: (patch: any) => Promise<void>;
}) {
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));
  const [status, setStatus] = useState('draft');

  const po = data?.purchaseOrder;
  const lines = data?.lines ?? [];

  const tokenQ = useQuery({
    queryKey: ['purchaseOrderToken', companyId, po?.id],
    queryFn: () => tokensRepo.getActive(companyId, 'purchase_order', po?.id as string),
    enabled: !!po?.id && open,
  });

  const activityQ = useQuery({
    queryKey: ['purchaseOrderActivity', companyId, po?.id],
    queryFn: () => activityRepo.list(companyId, 'purchase_order', po?.id as string),
    enabled: !!po?.id && open,
  });

  const tokenRow = tokenQ.data ?? null;
  const shareUrl = tokenRow ? `${window.location.origin}/shared/purchase-order/${tokenRow.token}` : null;
  const activity = activityQ.data ?? [];

  useEffect(() => {
    if (po?.status) setStatus(po.status);
  }, [po]);

  if (!open || !data) return null;

  async function handleGenerateLink(expiresAt: string | null) {
    if (!po?.id) return;
    await tokensRepo.create(companyId, 'purchase_order', po.id, expiresAt);
    await activityRepo.log(companyId, estimateId, 'purchase_order', po.id, 'token_created', 'Share link generated');
    await tokenQ.refetch();
    await activityQ.refetch();
  }

  async function handleRevokeLink() {
    if (!tokenRow?.id) return;
    await tokensRepo.revoke(companyId, tokenRow.id);
    await activityRepo.log(companyId, estimateId, 'purchase_order', po.id, 'token_revoked', 'Share link revoked');
    await tokenQ.refetch();
    await activityQ.refetch();
  }

  async function handleMarkAsSent() {
    if (!po?.id) return;
    if (po.status === 'draft') {
      await onUpdate({ status: 'sent' });
      const message = po.supplier_email ? `Sent to ${po.supplier_email}` : 'Marked as sent';
      await activityRepo.log(companyId, estimateId, 'purchase_order', po.id, 'sent', message);
      await activityQ.refetch();
      
      // Generate link if not exists and copy to clipboard
      if (!tokenRow) {
        await handleGenerateLink(null);
        const newToken = await tokensRepo.getActive(companyId, 'purchase_order', po.id);
        if (newToken) {
          const url = `${window.location.origin}/shared/purchase-order/${newToken.token}`;
          await navigator.clipboard.writeText(url);
        }
      } else if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
      }
    }
  }

  async function handlePdfDownload() {
    if (!po?.id) return;
    await activityRepo.log(companyId, estimateId, 'purchase_order', po.id, 'pdf_downloaded', 'PDF downloaded');
    await activityQ.refetch();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{po.title}</div>
            <div className="text-xs text-slate-500">Purchase Order • Total: {fmt(po.total)}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-3 space-y-3 overflow-auto">
          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">Supplier</div>
            <div className="text-sm">Supplier: {po.supplier_name || '—'}</div>
            <div className="text-sm">Email: {po.supplier_email || '—'}</div>
            <div className="text-sm">Delivery: {po.delivery_address || '—'}</div>
          </Card>

          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">Status</div>
            <select className="w-full rounded border px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <Button size="sm" onClick={async () => {
                const oldStatus = po.status;
                await onUpdate({ status });
                if (oldStatus !== status) {
                  await activityRepo.log(companyId, estimateId, 'purchase_order', po.id, 'status_changed', `Status changed from ${oldStatus} to ${status}`);
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
              {po.status === 'draft' && (
                <Button size="sm" onClick={handleMarkAsSent}>
                  Mark as Sent
                </Button>
              )}
              <div onClick={handlePdfDownload}>
                <PDFDownloadLink
                  document={<PurchaseOrderPdf purchaseOrder={po} lines={lines} />}
                  fileName={`Purchase-Order-${po.id}.pdf`}
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

