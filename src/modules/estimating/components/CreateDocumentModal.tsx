import { useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CreateDocumentModal({
  open,
  kind,
  items,
  onClose,
  onCreateWorkOrder,
  onCreatePurchaseOrder,
}: {
  open: boolean;
  kind: 'work_order' | 'purchase_order';
  items: any[];
  onClose: () => void;
  onCreateWorkOrder: (args: { title: string; assigned_to_name?: string; assigned_to_email?: string; vat_rate?: number; itemIds: string[] }) => Promise<void>;
  onCreatePurchaseOrder: (args: { title: string; supplier_name?: string; supplier_email?: string; delivery_address?: string; vat_rate?: number; itemIds: string[] }) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState('');
  const [vatRate, setVatRate] = useState<number>(0);

  const filtered = useMemo(() => {
    if (kind === 'work_order') return items.filter((it) => ['labour', 'subcontract'].includes(it.item_type));
    return items.filter((it) => ['material', 'plant'].includes(it.item_type));
  }, [items, kind]);

  const allIds = filtered.map((i) => i.id);
  const selectedIds = allIds.filter((id) => selected[id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">
            {kind === 'work_order' ? 'Create work order' : 'Create purchase order'}
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-3 space-y-3 overflow-auto">
          <Card className="p-3 space-y-2">
            <div className="text-xs text-slate-500">Document details</div>
            <label className="text-xs text-slate-600">Title</label>
            <input className="w-full rounded border px-2 py-1 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />

            {kind === 'work_order' ? (
              <>
                <label className="text-xs text-slate-600">Contractor name</label>
                <input className="w-full rounded border px-2 py-1 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                <label className="text-xs text-slate-600">Contractor email (optional)</label>
                <input className="w-full rounded border px-2 py-1 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
              </>
            ) : (
              <>
                <label className="text-xs text-slate-600">Supplier name</label>
                <input className="w-full rounded border px-2 py-1 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
                <label className="text-xs text-slate-600">Supplier email (optional)</label>
                <input className="w-full rounded border px-2 py-1 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="text-xs text-slate-600">Delivery address (optional)</label>
                <input className="w-full rounded border px-2 py-1 text-sm" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
              </>
            )}

            <label className="text-xs text-slate-600">VAT rate (document-specific)</label>
            <input className="w-full rounded border px-2 py-1 text-sm" type="number" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} />
          </Card>

          <Card className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500">
                Select items ({filtered.length})
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => {
                  const next: any = {};
                  for (const id of allIds) next[id] = true;
                  setSelected(next);
                }}>Select all</Button>
                <Button size="sm" variant="secondary" onClick={() => setSelected({})}>Clear</Button>
              </div>
            </div>

            <div className="space-y-2">
              {filtered.map((it) => (
                <label key={it.id} className="flex items-start gap-2 rounded border px-2 py-2">
                  <input
                    type="checkbox"
                    checked={!!selected[it.id]}
                    onChange={(e) => setSelected((p) => ({ ...p, [it.id]: e.target.checked }))}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{it.title}</div>
                    <div className="text-xs text-slate-500">
                      Type: {it.item_type} • Qty: {it.quantity} {it.unit}
                    </div>
                  </div>
                </label>
              ))}
              {filtered.length === 0 ? (
                <div className="text-xs text-slate-500">
                  No eligible items found for this document type.
                </div>
              ) : null}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const finalTitle = title.trim() || (kind === 'work_order' ? 'Work Order' : 'Purchase Order');
                if (kind === 'work_order') {
                  await onCreateWorkOrder({
                    title: finalTitle,
                    assigned_to_name: name.trim() || undefined,
                    assigned_to_email: email.trim() || undefined,
                    vat_rate: vatRate,
                    itemIds: selectedIds,
                  });
                } else {
                  await onCreatePurchaseOrder({
                    title: finalTitle,
                    supplier_name: name.trim() || undefined,
                    supplier_email: email.trim() || undefined,
                    delivery_address: delivery.trim() || undefined,
                    vat_rate: vatRate,
                    itemIds: selectedIds,
                  });
                }
                onClose();
              }}
              disabled={selectedIds.length === 0}
            >
              Create
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>

          <div className="text-xs text-slate-500">
            Note: This creates a snapshot of selected estimate items for audit. Future Prompt will add syncing/variations.
          </div>
        </div>
      </div>
    </div>
  );
}

