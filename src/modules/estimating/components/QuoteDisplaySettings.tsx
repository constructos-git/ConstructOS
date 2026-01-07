import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';
import { CollapsibleSection } from './CollapsibleSection';

export interface QuoteDisplaySettings {
  // Section visibility
  show_section_totals?: boolean;
  show_vat?: boolean;
  show_descriptions?: boolean;
  
  // Item type visibility
  show_labour?: boolean;
  show_materials?: boolean;
  show_plant?: boolean;
  show_subcontract?: boolean;
  show_combined?: boolean;
  
  // Item detail visibility
  show_quantities?: boolean;
  show_unit_prices?: boolean;
  show_line_totals?: boolean;
  show_item_categories?: boolean;
  
  // Grouping and organization
  group_by_item_type?: boolean;
  
  // Breakdown visibility
  show_cost_breakdown?: boolean;
  show_margin_breakdown?: boolean;
  show_overhead_breakdown?: boolean;
  show_wastage_breakdown?: boolean;
  
  // Content visibility
  show_pricing_summary?: boolean;
  show_inclusions_exclusions?: boolean;
  show_assumptions?: boolean;
  show_programme_notes?: boolean;
  show_payment_notes?: boolean;
  show_warranty_notes?: boolean;
  show_terms?: boolean;
  show_client_narratives?: boolean;
  
  // Display modes
  item_display_mode?: 'detailed' | 'summary' | 'minimal';
  section_display_mode?: 'expanded' | 'collapsed' | 'summary_only';
}

export function QuoteDisplaySettings({
  settings,
  onChange,
}: {
  settings: QuoteDisplaySettings;
  onChange: (settings: QuoteDisplaySettings) => void;
}) {
  const [localSettings, setLocalSettings] = useState<QuoteDisplaySettings>({
    show_section_totals: true,
    show_vat: true,
    show_descriptions: true,
    show_labour: true,
    show_materials: true,
    show_plant: true,
    show_subcontract: true,
    show_combined: true,
    show_quantities: true,
    show_unit_prices: true,
    show_line_totals: true,
    show_item_categories: false,
    group_by_item_type: false,
    show_cost_breakdown: false,
    show_margin_breakdown: false,
    show_overhead_breakdown: false,
    show_wastage_breakdown: false,
    show_pricing_summary: true,
    show_inclusions_exclusions: true,
    show_assumptions: true,
    show_programme_notes: true,
    show_payment_notes: true,
    show_warranty_notes: true,
    show_terms: true,
    show_client_narratives: true,
    item_display_mode: 'detailed',
    section_display_mode: 'expanded',
    ...settings,
  });

  useEffect(() => {
    setLocalSettings({
      show_section_totals: true,
      show_vat: true,
      show_descriptions: true,
      show_labour: true,
      show_materials: true,
      show_plant: true,
      show_subcontract: true,
      show_combined: true,
      show_quantities: true,
      show_unit_prices: true,
      show_line_totals: true,
      show_item_categories: false,
      group_by_item_type: false,
      show_cost_breakdown: false,
      show_margin_breakdown: false,
      show_overhead_breakdown: false,
      show_wastage_breakdown: false,
      show_pricing_summary: true,
      show_inclusions_exclusions: true,
      show_assumptions: true,
      show_programme_notes: true,
      show_payment_notes: true,
      show_warranty_notes: true,
      show_terms: true,
      show_client_narratives: true,
      item_display_mode: 'detailed',
      section_display_mode: 'expanded',
      ...settings,
    });
  }, [settings]);

  const updateSetting = (key: keyof QuoteDisplaySettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onChange(updated);
  };

  return (
    <Card className="p-4 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-base">Quote Display Settings</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Control how your quote appears to customers
        </p>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Pricing & Totals */}
        <CollapsibleSection title="Pricing & Totals" defaultExpanded={true}>
          <div className="space-y-2">
            <Tooltip content="Show subtotal, VAT, and total at the bottom of the quote">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_pricing_summary ?? true}
                  onChange={(e) => updateSetting('show_pricing_summary', e.target.checked)}
                />
                Show Pricing Summary
              </label>
            </Tooltip>
            <Tooltip content="Show section subtotals for each section">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_section_totals ?? true}
                  onChange={(e) => updateSetting('show_section_totals', e.target.checked)}
                />
                Show Section Totals
              </label>
            </Tooltip>
            <Tooltip content="Show VAT amount and rate in the pricing summary">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_vat ?? true}
                  onChange={(e) => updateSetting('show_vat', e.target.checked)}
                />
                Show VAT
              </label>
            </Tooltip>
          </div>
        </CollapsibleSection>

        {/* Item Visibility */}
        <CollapsibleSection title="Item Type Visibility" defaultExpanded={true}>
          <div className="space-y-2">
            <Tooltip content="Show labour items in the quote">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_labour ?? true}
                  onChange={(e) => updateSetting('show_labour', e.target.checked)}
                />
                Show Labour Items
              </label>
            </Tooltip>
            <Tooltip content="Show material items in the quote">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_materials ?? true}
                  onChange={(e) => updateSetting('show_materials', e.target.checked)}
                />
                Show Materials
              </label>
            </Tooltip>
            <Tooltip content="Show plant/equipment items in the quote">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_plant ?? true}
                  onChange={(e) => updateSetting('show_plant', e.target.checked)}
                />
                Show Plant/Equipment
              </label>
            </Tooltip>
            <Tooltip content="Show subcontract items in the quote">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_subcontract ?? true}
                  onChange={(e) => updateSetting('show_subcontract', e.target.checked)}
                />
                Show Subcontract
              </label>
            </Tooltip>
            <Tooltip content="Show combined items (labour + materials) in the quote">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_combined ?? true}
                  onChange={(e) => updateSetting('show_combined', e.target.checked)}
                />
                Show Combined Items
              </label>
            </Tooltip>
          </div>
        </CollapsibleSection>

        {/* Item Details */}
        <CollapsibleSection title="Item Details" defaultExpanded={true}>
          <div className="space-y-2">
            <Tooltip content="Show item descriptions below item titles">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_descriptions ?? true}
                  onChange={(e) => updateSetting('show_descriptions', e.target.checked)}
                />
                Show Descriptions
              </label>
            </Tooltip>
            <Tooltip content="Show quantity for each line item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_quantities ?? true}
                  onChange={(e) => updateSetting('show_quantities', e.target.checked)}
                />
                Show Quantities
              </label>
            </Tooltip>
            <Tooltip content="Show unit price for each line item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_unit_prices ?? true}
                  onChange={(e) => updateSetting('show_unit_prices', e.target.checked)}
                />
                Show Unit Prices
              </label>
            </Tooltip>
            <Tooltip content="Show line total (quantity × unit price) for each item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_line_totals ?? true}
                  onChange={(e) => updateSetting('show_line_totals', e.target.checked)}
                />
                Show Line Totals
              </label>
            </Tooltip>
            <Tooltip content="Show item categories if assigned">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_item_categories ?? false}
                  onChange={(e) => updateSetting('show_item_categories', e.target.checked)}
                />
                Show Item Categories
              </label>
            </Tooltip>
          </div>
        </CollapsibleSection>

        {/* Organization */}
        <CollapsibleSection title="Organization" defaultExpanded={false}>
          <div className="space-y-2">
            <Tooltip content="Group items by type (labour, materials, etc.) within each section">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.group_by_item_type ?? false}
                  onChange={(e) => updateSetting('group_by_item_type', e.target.checked)}
                />
                Group by Item Type
              </label>
            </Tooltip>
            <div>
              <Tooltip content="How items are displayed: Detailed (full info), Summary (title + total), Minimal (title only)">
                <label className="text-sm font-medium mb-1 block">Item Display Mode</label>
              </Tooltip>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={localSettings.item_display_mode ?? 'detailed'}
                onChange={(e) => updateSetting('item_display_mode', e.target.value)}
              >
                <option value="detailed">Detailed</option>
                <option value="summary">Summary</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <Tooltip content="How sections are displayed: Expanded (all items), Collapsed (section title only), Summary Only (section total only)">
                <label className="text-sm font-medium mb-1 block">Section Display Mode</label>
              </Tooltip>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={localSettings.section_display_mode ?? 'expanded'}
                onChange={(e) => updateSetting('section_display_mode', e.target.value)}
              >
                <option value="expanded">Expanded</option>
                <option value="collapsed">Collapsed</option>
                <option value="summary_only">Summary Only</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Cost Breakdowns */}
        <CollapsibleSection title="Cost Breakdowns" defaultExpanded={false}>
          <div className="space-y-2">
            <Tooltip content="Show cost breakdown (base cost, wastage, etc.) for each item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_cost_breakdown ?? false}
                  onChange={(e) => updateSetting('show_cost_breakdown', e.target.checked)}
                />
                Show Cost Breakdown
              </label>
            </Tooltip>
            <Tooltip content="Show margin percentage and amount for each item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_margin_breakdown ?? false}
                  onChange={(e) => updateSetting('show_margin_breakdown', e.target.checked)}
                />
                Show Margin Breakdown
              </label>
            </Tooltip>
            <Tooltip content="Show overhead percentage and amount for each item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_overhead_breakdown ?? false}
                  onChange={(e) => updateSetting('show_overhead_breakdown', e.target.checked)}
                />
                Show Overhead Breakdown
              </label>
            </Tooltip>
            <Tooltip content="Show wastage percentage and amount for each item">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_wastage_breakdown ?? false}
                  onChange={(e) => updateSetting('show_wastage_breakdown', e.target.checked)}
                />
                Show Wastage Breakdown
              </label>
            </Tooltip>
          </div>
        </CollapsibleSection>

        {/* Content Sections */}
        <CollapsibleSection title="Content Sections" defaultExpanded={false}>
          <div className="space-y-2">
            <Tooltip content="Show client-facing narratives for each section">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_client_narratives ?? true}
                  onChange={(e) => updateSetting('show_client_narratives', e.target.checked)}
                />
                Show Client Narratives
              </label>
            </Tooltip>
            <Tooltip content="Show inclusions and exclusions lists">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_inclusions_exclusions ?? true}
                  onChange={(e) => updateSetting('show_inclusions_exclusions', e.target.checked)}
                />
                Show Inclusions & Exclusions
              </label>
            </Tooltip>
            <Tooltip content="Show assumptions list">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_assumptions ?? true}
                  onChange={(e) => updateSetting('show_assumptions', e.target.checked)}
                />
                Show Assumptions
              </label>
            </Tooltip>
            <Tooltip content="Show programme/timeline notes">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_programme_notes ?? true}
                  onChange={(e) => updateSetting('show_programme_notes', e.target.checked)}
                />
                Show Programme Notes
              </label>
            </Tooltip>
            <Tooltip content="Show payment terms and schedule">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_payment_notes ?? true}
                  onChange={(e) => updateSetting('show_payment_notes', e.target.checked)}
                />
                Show Payment Notes
              </label>
            </Tooltip>
            <Tooltip content="Show warranty and guarantee information">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_warranty_notes ?? true}
                  onChange={(e) => updateSetting('show_warranty_notes', e.target.checked)}
                />
                Show Warranty Notes
              </label>
            </Tooltip>
            <Tooltip content="Show terms and conditions">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.show_terms ?? true}
                  onChange={(e) => updateSetting('show_terms', e.target.checked)}
                />
                Show Terms & Conditions
              </label>
            </Tooltip>
          </div>
        </CollapsibleSection>
      </CardContent>
    </Card>
  );
}


