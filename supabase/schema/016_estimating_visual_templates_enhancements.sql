-- ConstructOS Estimating — Visual Templates & Enhanced Statuses

-- Add more status options (already in workflowTypes, but ensure DB supports them)
-- Statuses are already flexible via text field, so no schema change needed

-- Add visual/graphic fields to estimate_templates
alter table public.estimate_templates
  add column if not exists thumbnail_url text,
  add column if not exists preview_image_url text,
  add column if not exists template_type text default 'standard', -- 'standard' | 'extension' | 'conversion' | 'refurbishment'
  add column if not exists tags text[], -- Array of tags for filtering
  add column if not exists difficulty text, -- 'beginner' | 'intermediate' | 'advanced'
  add column if not exists estimated_duration_hours numeric(6,2), -- Estimated time to complete
  add column if not exists typical_price_range jsonb, -- {min: number, max: number}
  add column if not exists visual_config jsonb; -- Stores visual configuration for interactive builder

-- Visual config structure:
-- {
--   "planView": {
--     "defaultDimensions": {"width": 0, "depth": 0, "height": 0},
--     "existingPropertyPlacement": {"x": 0, "y": 0, "width": 0, "depth": 0},
--     "extensionPlacement": {"x": 0, "y": 0, "width": 0, "depth": 0}
--   },
--   "roofOptions": {
--     "availableStyles": ["flat", "pitched", "hipped", "mansard"],
--     "defaultStyle": "pitched",
--     "ridgeDirections": ["north-south", "east-west"],
--     "defaultRidgeDirection": "north-south"
--   },
--   "fasciaSoffit": {
--     "defaultFasciaHeightFlat": 250, -- mm
--     "defaultSoffitDepthFlat": 150, -- mm
--     "defaultFasciaHeightPitched": 250, -- mm
--     "defaultSoffitDepthPitched": 250 -- mm
--   }
-- }

comment on column public.estimate_templates.thumbnail_url is 'Small thumbnail image for template selection';
comment on column public.estimate_templates.preview_image_url is 'Larger preview image for template details';
comment on column public.estimate_templates.template_type is 'Type of template (extension, conversion, refurbishment, etc.)';
comment on column public.estimate_templates.tags is 'Array of tags for filtering and searching templates';
comment on column public.estimate_templates.difficulty is 'Difficulty level of the template';
comment on column public.estimate_templates.estimated_duration_hours is 'Estimated time to complete estimate using this template';
comment on column public.estimate_templates.typical_price_range is 'Typical price range for this type of work';
comment on column public.estimate_templates.visual_config is 'Visual configuration for interactive builder (dimensions, roof, fascia, etc.)';

-- Add more status options to estimates table (if needed - currently using text field)
-- No change needed as status is already a text field


