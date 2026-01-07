import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export function AssemblyParamsModal({
  open,
  paramsSchema,
  onConfirm,
  onClose,
}: {
  open: boolean;
  paramsSchema: Array<{ key: string; label: string; type: string; unit?: string; default?: number }>;
  onConfirm: (params: Record<string, number>) => void;
  onClose: () => void;
}) {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const param of paramsSchema) {
      initial[param.key] = param.default ?? 0;
    }
    return initial;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Assembly Parameters</div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <div className="p-3 space-y-3 overflow-auto">
          <Card className="p-3 space-y-3">
            {paramsSchema.map((param) => (
              <div key={param.key}>
                <label className="text-xs text-slate-600">
                  {param.label}{param.unit ? ` (${param.unit})` : ''}
                </label>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={params[param.key] ?? param.default ?? 0}
                  onChange={(e) => setParams({ ...params, [param.key]: Number(e.target.value) })}
                  min={0}
                  step={0.1}
                />
              </div>
            ))}
          </Card>
          <div className="flex gap-2">
            <Button onClick={() => onConfirm(params)}>Apply Assembly</Button>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

