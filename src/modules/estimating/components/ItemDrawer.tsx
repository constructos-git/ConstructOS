import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RatePicker } from './settings/RatePicker';

export function ItemDrawer({
  open,
  item,
  onClose,
  onSave,
  companyId,
}: {
  open: boolean;
  item: any | null;
  onClose: () => void;
  onSave: (patch: any) => void;
  companyId?: string;
}) {
  const [ratePickerOpen, setRatePickerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState('combined');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('item');
  const [unitCost, setUnitCost] = useState(0);
  const [margin, setMargin] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [autoPrice, setAutoPrice] = useState(true);
  const [marginOverride, setMarginOverride] = useState<string>('');
  const [overheadOverride, setOverheadOverride] = useState<string>('');
  const [labourBurdenOverride, setLabourBurdenOverride] = useState<string>('');
  const [wastageOverride, setWastageOverride] = useState<string>('');
  const fmt = (n: any) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));

  useEffect(() => {
    if (!item) return;
    setTitle(item.title ?? '');
    setDescription(item.description ?? '');
    setItemType(item.item_type ?? 'combined');
    setQuantity(Number(item.quantity ?? 1));
    setUnit(item.unit ?? 'item');
    setUnitCost(Number(item.unit_cost ?? 0));
    setMargin(Number(item.margin_percent ?? 0));
    setUnitPrice(Number(item.unit_price ?? 0));
    setAutoPrice(true);
    setMarginOverride(item.margin_override_percent?.toString() || '');
    setOverheadOverride(item.overhead_override_percent?.toString() || '');
    setLabourBurdenOverride(item.labour_burden_override_percent?.toString() || '');
    setWastageOverride(item.wastage_override_percent?.toString() || '');
  }, [item]);

  const computed = useMemo(() => {
    const lineCost = Number(quantity || 0) * Number(unitCost || 0);
    const lineTotal = Number(quantity || 0) * Number(unitPrice || 0);
    return { lineCost, lineTotal };
  }, [quantity, unitCost, unitPrice]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Edit item</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-3 space-y-3 overflow-auto">
          <Card className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-600">Title</label>
              {companyId && ['material', 'labour', 'plant'].includes(itemType) && (
                <Button size="sm" variant="ghost" onClick={() => setRatePickerOpen(true)}>
                  Pick Rate
                </Button>
              )}
            </div>
            <input className="w-full rounded border px-2 py-1 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="text-xs text-slate-600">Description</label>
            <input className="w-full rounded border px-2 py-1 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Card>

          <Card className="p-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-600">Type</label>
              <select className="w-full rounded border px-2 py-1 text-sm" value={itemType} onChange={(e) => setItemType(e.target.value)}>
                <option value="combined">Combined</option>
                <option value="labour">Labour</option>
                <option value="material">Material</option>
                <option value="plant">Plant</option>
                <option value="subcontract">Subcontract</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600">Unit</label>
              <input className="w-full rounded border px-2 py-1 text-sm" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-600">Quantity</label>
              <input className="w-full rounded border px-2 py-1 text-sm" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-slate-600">Unit cost (internal)</label>
              <input className="w-full rounded border px-2 py-1 text-sm" type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-slate-600">Margin %</label>
              <input className="w-full rounded border px-2 py-1 text-sm" type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-slate-600">Unit price (sell)</label>
              <input className="w-full rounded border px-2 py-1 text-sm" type="number" value={unitPrice} onChange={(e) => { setUnitPrice(Number(e.target.value)); setAutoPrice(false); }} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={autoPrice} onChange={(e) => setAutoPrice(e.target.checked)} />
              <span className="text-xs text-slate-600">Auto-calc unit price from unit cost + margin</span>
            </div>
          </Card>

          <Card className="p-3 space-y-2">
            <div className="text-xs font-semibold text-slate-600 border-b pb-2">Margin Overrides</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600">Margin Override (%)</label>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  type="number"
                  step="0.1"
                  value={marginOverride}
                  onChange={(e) => setMarginOverride(e.target.value)}
                  placeholder="Use default"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Overhead Override (%)</label>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  type="number"
                  step="0.1"
                  value={overheadOverride}
                  onChange={(e) => setOverheadOverride(e.target.value)}
                  placeholder="Use default"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Labour Burden Override (%)</label>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  type="number"
                  step="0.1"
                  value={labourBurdenOverride}
                  onChange={(e) => setLabourBurdenOverride(e.target.value)}
                  placeholder="Use default"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Wastage Override (%)</label>
                <input
                  className="w-full rounded border px-2 py-1 text-sm"
                  type="number"
                  step="0.1"
                  value={wastageOverride}
                  onChange={(e) => setWastageOverride(e.target.value)}
                  placeholder="Use default"
                />
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-xs text-slate-500">Computed</div>
            <div className="text-sm">Line cost: {fmt(computed.lineCost)}</div>
            <div className="text-sm font-semibold">Line total: {fmt(computed.lineTotal)}</div>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onSave({
                  title: title.trim() || 'Untitled',
                  description: description.trim() || null,
                  item_type: itemType,
                  quantity,
                  unit,
                  unit_cost: unitCost,
                  margin_percent: margin,
                  ...(autoPrice ? {} : { unit_price: unitPrice }),
                  margin_override_percent: marginOverride ? parseFloat(marginOverride) : null,
                  overhead_override_percent: overheadOverride ? parseFloat(overheadOverride) : null,
                  labour_burden_override_percent: labourBurdenOverride ? parseFloat(labourBurdenOverride) : null,
                  wastage_override_percent: wastageOverride ? parseFloat(wastageOverride) : null,
                });
                onClose();
              }}
            >
              Save
            </Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>

      {ratePickerOpen && companyId && (
        <RatePicker
          companyId={companyId}
          itemType={itemType as 'labour' | 'material' | 'plant'}
          onSelect={(rate) => {
            setTitle(rate.title);
            setUnit(rate.unit);
            setUnitCost(rate.unitCost);
            if (rate.category) {
              // Could store category if items table supports it
            }
          }}
          onClose={() => setRatePickerOpen(false)}
        />
      )}
    </div>
  );
}

