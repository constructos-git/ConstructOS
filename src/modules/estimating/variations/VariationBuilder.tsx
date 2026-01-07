import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { VariationLine } from './variations.repo';

export function VariationBuilder({
  estimateItems: _estimateItems,
  onSave,
  onCancel,
}: {
  estimateItems: any[];
  onSave: (variation: { title: string; description?: string; lines: VariationLine[] }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<VariationLine[]>([]);

  function addLine(item?: any) {
    setLines([
      ...lines,
      {
        itemType: item?.item_type || 'combined',
        title: item?.title || 'New Line',
        description: item?.description,
        quantity: item?.quantity || 1,
        unit: item?.unit || 'item',
        unitCost: Number(item?.unit_cost || 0),
        priceExVat: Number(item?.unit_price || 0),
        vat: 0,
        totalIncVat: 0,
      },
    ]);
  }

  function updateLine(idx: number, patch: Partial<VariationLine>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  const subtotal = lines.reduce((sum, l) => sum + l.priceExVat, 0);
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  return (
    <Card className="p-4 space-y-3">
      <div className="text-sm font-semibold">Create Variation</div>
      <div>
        <label className="text-xs text-slate-600">Title</label>
        <input
          type="text"
          className="w-full rounded border px-2 py-1 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-600">Variation Lines</label>
          <Button size="sm" onClick={() => addLine()}>Add Line</Button>
        </div>
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="border rounded p-2 space-y-1">
              <input
                type="text"
                className="w-full rounded border px-2 py-1 text-sm"
                value={line.title}
                onChange={(e) => updateLine(idx, { title: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                />
                <input
                  type="text"
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="Unit"
                  value={line.unit}
                  onChange={(e) => updateLine(idx, { unit: e.target.value })}
                />
                <input
                  type="number"
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="Price"
                  value={line.priceExVat}
                  onChange={(e) => updateLine(idx, { priceExVat: Number(e.target.value) })}
                />
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeLine(idx)}>Remove</Button>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t pt-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>VAT:</span>
          <span>£{vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Total:</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave({ title, description, lines })} disabled={!title.trim() || lines.length === 0}>
          Save Draft
        </Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </Card>
  );
}

