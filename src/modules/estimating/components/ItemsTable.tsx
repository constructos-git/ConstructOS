import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

export function ItemsTable({
  items,
  onAdd,
  onEdit,
  onDelete,
}: {
  items: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Tooltip content="Line items are the individual products, services, or tasks that make up your estimate. Each item has a quantity, unit price, and total cost.">
          <div className="text-sm font-semibold">Line Items</div>
        </Tooltip>
        <Tooltip content="Add a new line item to your estimate. You can specify labour, materials, plant, subcontract, or combined items.">
          <Button size="sm" onClick={onAdd}>Add Item</Button>
        </Tooltip>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b">
              <Tooltip content="The name or description of the item">
                <th className="py-2 pr-3">Title</th>
              </Tooltip>
              <Tooltip content="The quantity of this item">
                <th className="py-2 pr-3">Qty</th>
              </Tooltip>
              <Tooltip content="The unit of measurement (e.g., hours, m², items)">
                <th className="py-2 pr-3">Unit</th>
              </Tooltip>
              <Tooltip content="Price per unit (excluding VAT)">
                <th className="py-2 pr-3">Unit Price</th>
              </Tooltip>
              <Tooltip content="Total cost for this line (quantity × unit price)">
                <th className="py-2 pr-3">Total</th>
              </Tooltip>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <div className="font-medium">{it.title}</div>
                  {it.description ? <div className="text-xs text-slate-500">{it.description}</div> : null}
                </td>
                <td className="py-2 pr-3">{it.quantity}</td>
                <td className="py-2 pr-3">{it.unit}</td>
                <td className="py-2 pr-3">{fmt(it.unit_price)}</td>
                <td className="py-2 pr-3 font-semibold">{fmt(it.line_total)}</td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <Tooltip content="Edit this line item">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(it)}>Edit</Button>
                    </Tooltip>
                    <Tooltip content="Delete this line item">
                      <Button size="sm" variant="ghost" onClick={() => onDelete(it.id)}>Delete</Button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">No items yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

