import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CollapsibleSection } from './CollapsibleSection';
import Tooltip from '@/components/ui/Tooltip';

export function DocumentsPanel({
  workOrders,
  purchaseOrders,
  onCreate,
  onOpenWorkOrder,
  onOpenPurchaseOrder,
}: {
  workOrders: any[];
  purchaseOrders: any[];
  onCreate: (kind: 'work_order' | 'purchase_order') => void;
  onOpenWorkOrder: (id: string) => void;
  onOpenPurchaseOrder: (id: string) => void;
}) {
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

  const woCount = workOrders.length;
  const poCount = purchaseOrders.length;

  return (
    <Card className="p-4 space-y-4">
      <CollapsibleSection
        title="Work Orders & Purchase Orders"
        tooltip="Work Orders are for labour and subcontract work. Purchase Orders are for materials and plant. Generate these documents to assign work to contractors and suppliers."
        defaultExpanded={true}
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Tooltip content="Create a work order for labour or subcontract work. Select items from your estimate to include.">
              <Button size="sm" variant="secondary" onClick={() => onCreate('work_order')}>
                New Work Order
              </Button>
            </Tooltip>
            <Tooltip content="Create a purchase order for materials or plant. Select items from your estimate to include.">
              <Button size="sm" variant="secondary" onClick={() => onCreate('purchase_order')}>
                New Purchase Order
              </Button>
            </Tooltip>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Work Orders ({woCount})
              </div>
              <div className="space-y-2">
                {workOrders.map((wo) => (
                  <Tooltip key={wo.id} content={`Click to view details for ${wo.title}`}>
                    <button
                      className="w-full text-left rounded-lg border px-3 py-2 hover:bg-accent transition-colors"
                      onClick={() => onOpenWorkOrder(wo.id)}
                      type="button"
                    >
                      <div className="text-sm font-medium">{wo.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Status: {wo.status} • Total: {fmt(wo.total)}
                      </div>
                    </button>
                  </Tooltip>
                ))}
                {woCount === 0 && (
                  <div className="text-xs text-muted-foreground py-2">No work orders yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-xs font-semibold text-muted-foreground mb-2">
                Purchase Orders ({poCount})
              </div>
              <div className="space-y-2">
                {purchaseOrders.map((po) => (
                  <Tooltip key={po.id} content={`Click to view details for ${po.title}`}>
                    <button
                      className="w-full text-left rounded-lg border px-3 py-2 hover:bg-accent transition-colors"
                      onClick={() => onOpenPurchaseOrder(po.id)}
                      type="button"
                    >
                      <div className="text-sm font-medium">{po.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Status: {po.status} • Total: {fmt(po.total)}
                      </div>
                    </button>
                  </Tooltip>
                ))}
                {poCount === 0 && (
                  <div className="text-xs text-muted-foreground py-2">No purchase orders yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </Card>
  );
}

