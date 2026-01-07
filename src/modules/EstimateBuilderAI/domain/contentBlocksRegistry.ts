// Content Blocks Registry - Seed content blocks for UK domestic construction

import type { ContentBlock } from './types';

export const seedContentBlocks: Omit<ContentBlock, 'id' | 'isSeed'>[] = [
  // Scope blocks
  {
    type: 'scope',
    title: 'Foundations and Groundworks',
    body: 'Excavation, foundations, and groundworks to Building Regulations. Includes site clearance, excavation, concrete foundations, and backfilling.',
    tags: ['foundations', 'groundworks', 'excavation'],
  },
  {
    type: 'scope',
    title: 'Cavity Wall Construction',
    body: 'External cavity wall construction with inner leaf blockwork, cavity insulation, and external finish (facing brick/render/cladding as specified).',
    tags: ['walls', 'construction', 'insulation'],
  },
  {
    type: 'scope',
    title: 'Warm Deck Roof System',
    body: 'Flat roof warm deck construction with timber structure, insulation, and EPDM/GRP covering. Includes all necessary flashings and edge details.',
    tags: ['roof', 'flat', 'insulation'],
  },
  {
    type: 'scope',
    title: 'Pitched Roof Construction',
    body: 'Pitched roof structure with timber joists, roof covering (slate/tile as specified), and all associated flashings and ridge details.',
    tags: ['roof', 'pitched', 'structure'],
  },
  {
    type: 'scope',
    title: 'Bifold Door Installation',
    body: 'Supply and installation of bifold doors including frame, glazing, and all necessary fixings. Includes making good to surrounding areas.',
    tags: ['doors', 'openings', 'glazing'],
  },
  {
    type: 'scope',
    title: 'First Fix Electrics',
    body: 'First fix electrical installation including wiring, sockets, switches, and consumer unit. All work to BS 7671 standards.',
    tags: ['electrics', 'services', 'first-fix'],
  },
  {
    type: 'scope',
    title: 'Heating Installation',
    body: 'Heating installation including radiators, pipework, and controls. Connection to existing heating system where applicable.',
    tags: ['heating', 'services', 'plumbing'],
  },
  {
    type: 'scope',
    title: 'Plasterboard and Skim',
    body: 'Plasterboard installation and plaster skim finish to walls and ceilings. Includes all necessary preparation and making good.',
    tags: ['finishes', 'plastering', 'walls'],
  },
  
  // Standard notes
  {
    type: 'note',
    title: 'Working Hours',
    body: 'Work will be carried out during normal working hours (Monday to Friday, 8:00 AM to 5:00 PM) unless otherwise agreed.',
    tags: ['working-hours', 'site'],
  },
  {
    type: 'note',
    title: 'Site Access',
    body: 'Adequate site access must be provided. The client is responsible for ensuring clear access routes for materials and plant.',
    tags: ['access', 'site', 'logistics'],
  },
  {
    type: 'note',
    title: 'Party Wall',
    body: 'If this work affects a party wall, the client is responsible for obtaining any necessary Party Wall Awards and serving appropriate notices.',
    tags: ['party-wall', 'legal', 'notices'],
  },
  {
    type: 'note',
    title: 'Protection of Existing',
    body: 'Reasonable care will be taken to protect existing structures and finishes. However, some minor damage may occur during construction.',
    tags: ['protection', 'existing', 'damage'],
  },
  {
    type: 'note',
    title: 'Making Good',
    body: 'Making good to surrounding areas is included where specified. Decoration of new work is included; decoration of existing areas is excluded.',
    tags: ['making-good', 'decoration', 'finishes'],
  },
  {
    type: 'note',
    title: 'Building Regulations',
    body: 'All work will be carried out in accordance with current Building Regulations. Building Control approval is the responsibility of the client.',
    tags: ['building-regulations', 'compliance', 'approvals'],
  },
  {
    type: 'note',
    title: 'Planning Permission',
    body: 'This estimate assumes that all necessary planning permissions and building regulations approvals are in place. The client is responsible for obtaining these.',
    tags: ['planning', 'permissions', 'approvals'],
  },
  
  // Exclusions
  {
    type: 'exclusion',
    title: 'Planning and Building Control Fees',
    body: 'Planning application fees, Building Control fees, and any other statutory fees are excluded from this estimate.',
    tags: ['fees', 'planning', 'building-control'],
  },
  {
    type: 'exclusion',
    title: 'Services Connections',
    body: 'Connection to mains services (water, gas, electricity, drainage) is excluded unless specifically included in the estimate.',
    tags: ['services', 'connections', 'utilities'],
  },
  {
    type: 'exclusion',
    title: 'Ground Conditions',
    body: 'This estimate assumes normal ground conditions. Any additional work required due to poor ground conditions is excluded.',
    tags: ['ground-conditions', 'foundations', 'site'],
  },
  {
    type: 'exclusion',
    title: 'Existing Services',
    body: 'Alteration or relocation of existing services (gas, water, electricity, drainage) is excluded unless specifically included.',
    tags: ['services', 'existing', 'alterations'],
  },
  {
    type: 'exclusion',
    title: 'Decoration of Existing Areas',
    body: 'Decoration of existing areas affected by the work is excluded. Only new work will be decorated.',
    tags: ['decoration', 'existing', 'finishes'],
  },
  {
    type: 'exclusion',
    title: 'Furniture and Fittings',
    body: 'Removal, storage, and replacement of furniture, fittings, and personal belongings is excluded.',
    tags: ['furniture', 'fittings', 'logistics'],
  },
  
  // Provisional Sum wording
  {
    type: 'ps_wording',
    title: 'Foundations Provisional Sum',
    body: 'A provisional sum of £[AMOUNT] is included for foundations. This will be adjusted based on actual ground conditions and requirements determined during site investigation.',
    tags: ['foundations', 'provisional-sum', 'ground-conditions'],
  },
  {
    type: 'ps_wording',
    title: 'Scaffolding Provisional Sum',
    body: 'A provisional sum of £[AMOUNT] is included for scaffolding. This will be adjusted based on actual requirements and site conditions.',
    tags: ['scaffolding', 'provisional-sum', 'access'],
  },
  {
    type: 'ps_wording',
    title: 'Standard Provisional Sum',
    body: 'A provisional sum of £[AMOUNT] is included for [DESCRIPTION]. This will be adjusted based on actual requirements and will be confirmed prior to commencement of this element of work.',
    tags: ['provisional-sum', 'general'],
  },
];

