import { Card } from '@/components/ui/Card';
import { priceLine } from '../../rates/engine/breakdown';
import type { PricingSettings, LineInput } from '../../rates/engine/types';

export function LineBreakdownPopover({
  settings,
  line,
}: {
  settings: PricingSettings;
  line: LineInput;
}) {
  const breakdown = priceLine(settings, line);
  const fmt = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);

  return (
    <Card className="p-3 space-y-2 min-w-[300px]">
      <div className="text-sm font-semibold">Pricing Breakdown</div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">Base Cost</span>
          <span>{fmt(breakdown.baseCost)}</span>
        </div>
        {breakdown.wastageCost > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Wastage</span>
            <span>{fmt(breakdown.wastageCost)}</span>
          </div>
        )}
        {breakdown.labourBurdenCost > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Labour Burden</span>
            <span>{fmt(breakdown.labourBurdenCost)}</span>
          </div>
        )}
        {breakdown.overheadCost > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Overhead</span>
            <span>{fmt(breakdown.overheadCost)}</span>
          </div>
        )}
        {breakdown.marginCost > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Margin</span>
            <span>{fmt(breakdown.marginCost)}</span>
          </div>
        )}
        <div className="border-t pt-1 mt-1">
          <div className="flex justify-between font-medium">
            <span>Price (ex VAT)</span>
            <span>{fmt(breakdown.priceExVat)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">VAT</span>
            <span>{fmt(breakdown.vat)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total (inc VAT)</span>
            <span>{fmt(breakdown.totalIncVat)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

