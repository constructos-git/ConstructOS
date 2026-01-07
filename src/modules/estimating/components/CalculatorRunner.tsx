import React, { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCalculator } from '../calculators/registry';
import type { CalcResultLine } from '../calculators/types';

export function CalculatorRunner({
  open,
  calculator,
  onClose,
  onAddToEstimate,
  onSaveAsAssembly,
}: {
  open: boolean;
  calculator: any | null; // DB calculator registry row
  onClose: () => void;
  onAddToEstimate: (lines: CalcResultLine[]) => void;
  onSaveAsAssembly?: (lines: CalcResultLine[], params: Record<string, any>) => void;
}) {
  const plugin = calculator ? getCalculator(calculator.key) : null;
  const schema = plugin?.schema ?? null;

  const initial = useMemo(() => {
    const o: any = {};
    const fields = schema?.fields ?? [];
    for (const f of fields) {
      if (f.type === 'number') {
        o[f.key] = f.default ?? 0;
      } else if (f.type === 'select') {
        o[f.key] = f.default ?? f.options[0]?.value ?? '';
      }
    }
    return o;
  }, [schema]);

  const [values, setValues] = useState<any>({});
  const [computedLines, setComputedLines] = useState<CalcResultLine[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setValues(initial);
    setComputedLines([]);
    setShowPreview(false);
  }, [initial, calculator]);

  if (!open || !calculator || !plugin) return null;

  function handleCompute() {
    if (!plugin) return;
    const result = plugin.compute(values);
    setComputedLines(result.lines);
    setShowPreview(true);
  }

  function handleAddToEstimate() {
    onAddToEstimate(computedLines);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-lg bg-background shadow-lg flex flex-col">
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-sm font-semibold">{calculator.name}</div>
            {calculator.description && (
              <div className="text-xs text-muted-foreground">{calculator.description}</div>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
          {!showPreview ? (
            <>
              <Card className="p-3 space-y-3">
                {(schema?.fields ?? []).map((f) => (
                  <div key={f.key} className="space-y-1">
                    <div className="text-xs text-slate-600">
                      {f.label}{f.unit ? ` (${f.unit})` : ''}
                    </div>
                    {f.type === 'number' ? (
                      <input
                        className="w-full rounded border px-2 py-1 text-sm"
                        type="number"
                        min={f.min ?? 0}
                        step={0.1}
                        value={values[f.key] ?? f.default ?? 0}
                        onChange={(e) => setValues((p: any) => ({ ...p, [f.key]: Number(e.target.value) }))}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        className="w-full rounded border px-2 py-1 text-sm text-slate-900 bg-white dark:text-slate-100 dark:bg-slate-900"
                        value={values[f.key] ?? f.default ?? ''}
                        onChange={(e) => setValues((p: any) => ({ ...p, [f.key]: e.target.value }))}
                      >
                        {f.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ))}
              </Card>
              <div className="flex gap-2">
                <Button onClick={handleCompute}>Compute</Button>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <Card className="p-3 space-y-2">
                <div className="text-sm font-semibold">Preview Results</div>
                <div className="space-y-1 text-sm">
                  {computedLines.map((line, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-1">
                      <div>
                        <div className="font-medium">{line.title}</div>
                        {line.description && <div className="text-xs text-slate-500">{line.description}</div>}
                      </div>
                      <div className="text-right">
                        <div>{line.quantity} {line.unit}</div>
                        {line.unitCostHint && (
                          <div className="text-xs text-slate-500">~£{line.unitCostHint.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="flex gap-2">
                <Button onClick={handleAddToEstimate}>Add to Estimate</Button>
                {onSaveAsAssembly && (
                  <Button variant="secondary" onClick={() => {
                    onSaveAsAssembly(computedLines, values);
                    onClose();
                  }}>
                    Save as Assembly
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setShowPreview(false)}>Back</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

