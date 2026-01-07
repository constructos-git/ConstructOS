import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RichTextEditor } from './rich/RichTextEditor';
import { QuoteDisplaySettings, type QuoteDisplaySettings as QuoteDisplaySettingsType } from './QuoteDisplaySettings';
import { OverheadProfitSettings, type OverheadProfitSettings as OverheadProfitSettingsType } from './OverheadProfitSettings';
import { CollapsibleSection } from './CollapsibleSection';
import Tooltip from '@/components/ui/Tooltip';

function JsonListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <Card className="p-3 space-y-2">
      <div className="text-sm font-semibold">{label}</div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              className="flex-1 rounded border px-2 py-1 text-sm"
              value={it}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
            />
            <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded border px-2 py-1 text-sm" placeholder="Add item…" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button size="sm" onClick={() => {
          const v = draft.trim();
          if (!v) return;
          onChange([...items, v]);
          setDraft('');
        }}>Add</Button>
      </div>
    </Card>
  );
}

export function QuoteEditorPanel({
  quote,
  brandingDefaults,
  onSave,
}: {
  quote: any;
  brandingDefaults: any;
  onSave: (patch: any) => Promise<void>;
}) {
  const inclusions = (Array.isArray(quote.inclusions) ? quote.inclusions : typeof quote.inclusions === 'string' ? JSON.parse(quote.inclusions || '[]') : []) as string[];
  const exclusions = (Array.isArray(quote.exclusions) ? quote.exclusions : typeof quote.exclusions === 'string' ? JSON.parse(quote.exclusions || '[]') : []) as string[];
  const assumptions = (Array.isArray(quote.assumptions) ? quote.assumptions : typeof quote.assumptions === 'string' ? JSON.parse(quote.assumptions || '[]') : []) as string[];

  const mergedBranding = useMemo(() => ({
    logo_url: quote.logo_url ?? brandingDefaults?.logo_url ?? '',
    primary_color: quote.primary_color ?? brandingDefaults?.primary_color ?? '#0f172a',
    secondary_color: quote.secondary_color ?? brandingDefaults?.secondary_color ?? '#334155',
    font_family: quote.font_family ?? brandingDefaults?.font_family ?? 'Inter',
    layout_style: quote.layout_style ?? brandingDefaults?.layout_style ?? 'classic',
  }), [quote, brandingDefaults]);

  const displaySettings = useMemo(() => {
    if (typeof quote.display_settings === 'string') {
      try {
        return JSON.parse(quote.display_settings);
      } catch {
        return {};
      }
    }
    return quote.display_settings || {};
  }, [quote.display_settings]);

  const overheadProfitSettings = useMemo(() => {
    if (typeof quote.overhead_profit_settings === 'string') {
      try {
        return JSON.parse(quote.overhead_profit_settings);
      } catch {
        return {};
      }
    }
    return quote.overhead_profit_settings || {};
  }, [quote.overhead_profit_settings]);

  const handleDisplaySettingsChange = async (settings: QuoteDisplaySettingsType) => {
    await onSave({ display_settings: settings });
  };

  const handleOverheadProfitSettingsChange = async (settings: OverheadProfitSettingsType) => {
    await onSave({ overhead_profit_settings: settings });
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 space-y-2">
        <div className="text-sm font-semibold">Quote content</div>

        <label className="text-xs text-slate-600">Intro title</label>
        <input className="w-full rounded border px-2 py-1 text-sm" value={quote.intro_title ?? ''} onChange={(e) => onSave({ intro_title: e.target.value })} />

        <label className="text-xs text-slate-600">Intro body</label>
        <RichTextEditor value={quote.intro_body_rich} onChange={(next) => onSave({ intro_body_rich: next })} minHeight={120} />

        <label className="text-xs text-slate-600">Programme / timeline notes</label>
        <RichTextEditor value={quote.programme_notes_rich} onChange={(next) => onSave({ programme_notes_rich: next })} minHeight={90} />

        <label className="text-xs text-slate-600">Payment notes</label>
        <RichTextEditor value={quote.payment_notes_rich} onChange={(next) => onSave({ payment_notes_rich: next })} minHeight={90} />

        <label className="text-xs text-slate-600">Warranty / guarantees</label>
        <RichTextEditor value={quote.warranty_notes_rich} onChange={(next) => onSave({ warranty_notes_rich: next })} minHeight={90} />

        <label className="text-xs text-slate-600">Terms & conditions</label>
        <RichTextEditor value={quote.terms_body_rich} onChange={(next) => onSave({ terms_body_rich: next })} minHeight={140} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <JsonListEditor label="Inclusions" items={inclusions} onChange={(next) => onSave({ inclusions: next })} />
        <JsonListEditor label="Exclusions" items={exclusions} onChange={(next) => onSave({ exclusions: next })} />
        <JsonListEditor label="Assumptions" items={assumptions} onChange={(next) => onSave({ assumptions: next })} />
      </div>

      {/* Display Settings */}
      <QuoteDisplaySettings
        settings={displaySettings}
        onChange={handleDisplaySettingsChange}
      />

      {/* Overhead & Profit Settings */}
      <OverheadProfitSettings
        settings={overheadProfitSettings}
        onChange={handleOverheadProfitSettingsChange}
      />

      <Card className="p-4 space-y-2">
        <CollapsibleSection
          title="Branding (Override)"
          tooltip="Override company branding defaults for this quote"
          defaultExpanded={false}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Tooltip content="URL to your company logo image">
                <label className="text-xs text-muted-foreground mb-1 block">Logo URL</label>
              </Tooltip>
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={mergedBranding.logo_url}
                onBlur={(e) => onSave({ logo_url: e.target.value })}
              />
            </div>
            <div>
              <Tooltip content="Font family for the quote document">
                <label className="text-xs text-muted-foreground mb-1 block">Font</label>
              </Tooltip>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={mergedBranding.font_family}
                onChange={(e) => onSave({ font_family: e.target.value })}
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Roboto">Roboto</option>
              </select>
            </div>
            <div>
              <Tooltip content="Primary brand color (hex code)">
                <label className="text-xs text-muted-foreground mb-1 block">Primary Colour</label>
              </Tooltip>
              <input
                type="color"
                className="w-full h-10 rounded-md border"
                defaultValue={mergedBranding.primary_color}
                onChange={(e) => onSave({ primary_color: e.target.value })}
              />
            </div>
            <div>
              <Tooltip content="Secondary brand color (hex code)">
                <label className="text-xs text-muted-foreground mb-1 block">Secondary Colour</label>
              </Tooltip>
              <input
                type="color"
                className="w-full h-10 rounded-md border"
                defaultValue={mergedBranding.secondary_color}
                onChange={(e) => onSave({ secondary_color: e.target.value })}
              />
            </div>
            <div>
              <Tooltip content="Overall layout style for the quote">
                <label className="text-xs text-muted-foreground mb-1 block">Layout</label>
              </Tooltip>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={mergedBranding.layout_style}
                onChange={(e) => onSave({ layout_style: e.target.value })}
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>
      </Card>
    </div>
  );
}

