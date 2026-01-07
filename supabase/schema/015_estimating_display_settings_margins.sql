-- ConstructOS Estimating — Comprehensive Display Settings & Margin Overrides

-- Add comprehensive display settings to estimate_quotes
alter table public.estimate_quotes
  add column if not exists display_settings jsonb not null default '{}'::jsonb;

-- Display settings structure (stored as JSONB):
-- {
--   "show_section_totals": true,
--   "show_vat": true,
--   "show_descriptions": true,
--   "show_labour": true,
--   "show_materials": true,
--   "show_plant": true,
--   "show_subcontract": true,
--   "show_combined": true,
--   "show_quantities": true,
--   "show_unit_prices": true,
--   "show_line_totals": true,
--   "show_item_categories": false,
--   "group_by_item_type": false,
--   "show_cost_breakdown": false,
--   "show_margin_breakdown": false,
--   "show_overhead_breakdown": false,
--   "show_wastage_breakdown": false,
--   "show_pricing_summary": true,
--   "show_inclusions_exclusions": true,
--   "show_assumptions": true,
--   "show_programme_notes": true,
--   "show_payment_notes": true,
--   "show_warranty_notes": true,
--   "show_terms": true,
--   "show_client_narratives": true,
--   "item_display_mode": "detailed", -- "detailed" | "summary" | "minimal"
--   "section_display_mode": "expanded" -- "expanded" | "collapsed" | "summary_only"
-- }

-- Add margin override columns to estimate_sections
alter table public.estimate_sections
  add column if not exists margin_override_percent numeric(6,2),
  add column if not exists overhead_override_percent numeric(6,2),
  add column if not exists labour_burden_override_percent numeric(6,2),
  add column if not exists wastage_override_percent numeric(6,2);

-- Add margin override columns to estimate_items
alter table public.estimate_items
  add column if not exists margin_override_percent numeric(6,2),
  add column if not exists overhead_override_percent numeric(6,2),
  add column if not exists labour_burden_override_percent numeric(6,2),
  add column if not exists wastage_override_percent numeric(6,2);

-- Add overhead and profit settings to estimate_quotes
alter table public.estimate_quotes
  add column if not exists overhead_profit_settings jsonb not null default '{}'::jsonb;

-- Overhead and profit settings structure (stored as JSONB):
-- {
--   "default_margin_percent": 20.0,
--   "default_overhead_percent": 15.0,
--   "default_labour_burden_percent": 25.0,
--   "default_wastage_percent": 10.0,
--   "apply_overhead_to_labour": true,
--   "apply_overhead_to_materials": true,
--   "apply_overhead_to_plant": true,
--   "apply_overhead_to_subcontract": true,
--   "margin_on_cost_plus": true, -- true = margin on (cost + overhead), false = margin on cost only
--   "rounding_mode": "nearest", -- "nearest" | "up" | "down" | "none"
--   "rounding_precision": 2
-- }

-- Add comments for documentation
comment on column public.estimate_quotes.display_settings is 'Comprehensive display settings for customer-facing quote presentation';
comment on column public.estimate_quotes.overhead_profit_settings is 'Overhead and profit calculation settings for this quote';
comment on column public.estimate_sections.margin_override_percent is 'Override default margin percentage for all items in this section (null = use estimate default)';
comment on column public.estimate_sections.overhead_override_percent is 'Override default overhead percentage for all items in this section (null = use estimate default)';
comment on column public.estimate_sections.labour_burden_override_percent is 'Override default labour burden percentage for all items in this section (null = use estimate default)';
comment on column public.estimate_sections.wastage_override_percent is 'Override default wastage percentage for all items in this section (null = use estimate default)';
comment on column public.estimate_items.margin_override_percent is 'Override default margin percentage for this item (null = use section or estimate default)';
comment on column public.estimate_items.overhead_override_percent is 'Override default overhead percentage for this item (null = use section or estimate default)';
comment on column public.estimate_items.labour_burden_override_percent is 'Override default labour burden percentage for this item (null = use section or estimate default)';
comment on column public.estimate_items.wastage_override_percent is 'Override default wastage percentage for this item (null = use section or estimate default)';


