import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { clientPacksRepo } from '../data/clientPacks.repo';
import { versionsRepo } from '../data/versions.repo';
import { workOrdersRepo } from '../data/workOrders.repo';
import { purchaseOrdersRepo } from '../data/purchaseOrders.repo';

export function ClientPackBuilder({
  companyId,
  estimateId,
  onCreated,
}: {
  companyId: string;
  estimateId: string;
  onCreated: (token: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quoteVersionId, setQuoteVersionId] = useState<string>('');
  const [workOrderIds, setWorkOrderIds] = useState<string[]>([]);
  const [purchaseOrderIds, setPurchaseOrderIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Array<{ url: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);

  const [versions, setVersions] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [companyId, estimateId]);

  async function loadData() {
    try {
      const [v, wo, po] = await Promise.all([
        versionsRepo.list(companyId, estimateId),
        workOrdersRepo.listByEstimate(companyId, estimateId),
        purchaseOrdersRepo.listByEstimate(companyId, estimateId),
      ]);
      setVersions(v);
      setWorkOrders(wo);
      setPurchaseOrders(po);
      if (v.length > 0 && !quoteVersionId) {
        setQuoteVersionId(v[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !quoteVersionId) return;
    setLoading(true);
    try {
      const result = await clientPacksRepo.create(companyId, {
        estimate_id: estimateId,
        name,
        description: description || undefined,
        contents: {
          quoteVersionId,
          workOrderIds: workOrderIds.length > 0 ? workOrderIds : undefined,
          purchaseOrderIds: purchaseOrderIds.length > 0 ? purchaseOrderIds : undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      });
      if (result.token) {
        onCreated(result.token.token);
      }
    } catch (error) {
      console.error('Failed to create pack:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="text-sm font-semibold">Create Client Pack</div>
      <div>
        <label className="text-xs text-slate-600">Name</label>
        <input
          type="text"
          className="w-full rounded border px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client Pack Name"
        />
      </div>
      <div>
        <label className="text-xs text-slate-600">Description</label>
        <textarea
          className="w-full rounded border px-2 py-1 text-sm"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-slate-600">Quote Version</label>
        <select
          className="w-full rounded border px-2 py-1 text-sm"
          value={quoteVersionId}
          onChange={(e) => setQuoteVersionId(e.target.value)}
        >
          {versions.map((v) => (
            <option key={v.id} value={v.id}>Version {v.version_number}</option>
          ))}
        </select>
      </div>
      {workOrders.length > 0 && (
        <div>
          <label className="text-xs text-slate-600">Work Orders (optional)</label>
          <div className="space-y-1">
            {workOrders.map((wo) => (
              <label key={wo.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={workOrderIds.includes(wo.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setWorkOrderIds([...workOrderIds, wo.id]);
                    } else {
                      setWorkOrderIds(workOrderIds.filter((id) => id !== wo.id));
                    }
                  }}
                />
                <span>{wo.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {purchaseOrders.length > 0 && (
        <div>
          <label className="text-xs text-slate-600">Purchase Orders (optional)</label>
          <div className="space-y-1">
            {purchaseOrders.map((po) => (
              <label key={po.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={purchaseOrderIds.includes(po.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPurchaseOrderIds([...purchaseOrderIds, po.id]);
                    } else {
                      setPurchaseOrderIds(purchaseOrderIds.filter((id) => id !== po.id));
                    }
                  }}
                />
                <span>{po.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleCreate} disabled={loading || !name.trim() || !quoteVersionId}>
          {loading ? 'Creating...' : 'Create Pack'}
        </Button>
      </div>
    </Card>
  );
}

