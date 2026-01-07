import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AssemblyParamsModal } from './AssemblyParamsModal';
import { CollapsibleSection } from './CollapsibleSection';
import Tooltip from '@/components/ui/Tooltip';

export function AssembliesPanel({
  assemblies,
  calculators,
  onApplyAssembly,
  onRunCalculator,
  activeSectionId,
}: {
  assemblies: any[];
  calculators: any[];
  onApplyAssembly: (assemblyId: string, vars: Record<string, number>) => void;
  onRunCalculator: (calculator: any) => void;
  activeSectionId: string | null;
}) {
  const [filter, setFilter] = useState('');
  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const [selectedAssembly, setSelectedAssembly] = useState<any>(null);
  
  const filteredAssemblies = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return assemblies;
    return assemblies.filter((a) => String(a.name || '').toLowerCase().includes(f) || String(a.category || '').toLowerCase().includes(f));
  }, [assemblies, filter]);

  function handleApplyAssembly(assembly: any) {
    const paramsSchema = assembly.params_schema || [];
    if (paramsSchema.length > 0) {
      setSelectedAssembly(assembly);
      setParamsModalOpen(true);
    } else {
      onApplyAssembly(assembly.id, {});
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">
        <Tooltip content="Assemblies are reusable bundles of items. Calculators help you quickly calculate quantities and costs for common tasks.">
          <span>Assemblies & Calculators</span>
        </Tooltip>
      </div>

      <input
        className="w-full rounded-md border px-3 py-2 text-sm"
        placeholder="Search assemblies..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <CollapsibleSection
        title="Quick Calculators"
        tooltip="Quick calculators help you calculate quantities and costs for common construction tasks. Enter measurements and get a list of items to add to your estimate."
        defaultExpanded={true}
      >
        <div className="grid gap-2">
          {calculators.map((c) => (
            <Tooltip key={c.id} content={`${c.description || c.name} - Click to open calculator`}>
              <button
                className="w-full text-left rounded-lg border px-3 py-2.5 hover:bg-accent transition-colors"
                onClick={() => onRunCalculator(c)}
                type="button"
              >
                <div className="text-sm font-medium">{c.name}</div>
                {c.category && <div className="text-xs text-muted-foreground mt-0.5">{c.category}</div>}
              </button>
            </Tooltip>
          ))}
          {calculators.length === 0 && (
            <div className="text-xs text-muted-foreground py-2">No calculators available.</div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Assemblies"
        tooltip="Assemblies are reusable bundles of items that you can quickly add to estimates. They can include parameters (like area or length) that calculate quantities automatically."
        defaultExpanded={true}
      >
        <div className="grid gap-2">
          {filteredAssemblies.map((a) => (
            <div key={a.id} className="rounded-lg border px-3 py-2.5 space-y-2">
              <div>
                <div className="text-sm font-medium">{a.name}</div>
                {a.category && <div className="text-xs text-muted-foreground mt-0.5">{a.category}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content={`Add this assembly to ${activeSectionId ? 'the current section' : 'your estimate'}`}>
                  <Button size="sm" onClick={() => handleApplyAssembly(a)}>
                    Add to Estimate
                  </Button>
                </Tooltip>
                <span className="text-xs text-muted-foreground">
                  {activeSectionId ? 'Current section' : 'All items'}
                </span>
              </div>
            </div>
          ))}
          {filteredAssemblies.length === 0 && (
            <div className="text-xs text-muted-foreground py-2">
              {filter ? 'No assemblies match your search.' : 'No assemblies available.'}
            </div>
          )}
        </div>
      </CollapsibleSection>

      <AssemblyParamsModal
        open={paramsModalOpen}
        paramsSchema={selectedAssembly?.params_schema || []}
        onConfirm={(params) => {
          if (selectedAssembly) {
            onApplyAssembly(selectedAssembly.id, params);
            setParamsModalOpen(false);
            setSelectedAssembly(null);
          }
        }}
        onClose={() => {
          setParamsModalOpen(false);
          setSelectedAssembly(null);
        }}
      />
    </Card>
  );
}

