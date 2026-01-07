export type BlockKey =
  | 'cover'
  | 'project_summary'
  | 'scope_sections'
  | 'pricing_summary'
  | 'inclusions_exclusions'
  | 'programme'
  | 'payment_terms'
  | 'warranty'
  | 'terms'
  | 'acceptance'
  | 'attachments';

export type BlockSettings = {
  showLogo?: boolean;
  showSectionTotals?: boolean;
  showItemDetail?: boolean;
  showDescriptions?: boolean;
  [key: string]: any;
};

export type LayoutBlock = {
  key: BlockKey;
  enabled: boolean;
  order: number;
  settings: BlockSettings;
};

export const blockDefinitions: Record<BlockKey, { label: string; description: string; defaultSettings: BlockSettings }> = {
  cover: {
    label: 'Cover Page',
    description: 'Title, logo, and introduction',
    defaultSettings: { showLogo: true },
  },
  project_summary: {
    label: 'Project Summary',
    description: 'Overview of the project scope',
    defaultSettings: {},
  },
  scope_sections: {
    label: 'Scope Sections',
    description: 'Detailed breakdown by section',
    defaultSettings: { showSectionTotals: true, showItemDetail: true, showDescriptions: true },
  },
  pricing_summary: {
    label: 'Pricing Summary',
    description: 'Totals and VAT breakdown',
    defaultSettings: { showSectionTotals: true },
  },
  inclusions_exclusions: {
    label: 'Inclusions & Exclusions',
    description: 'What is and is not included',
    defaultSettings: {},
  },
  programme: {
    label: 'Programme / Timeline',
    description: 'Project schedule notes',
    defaultSettings: {},
  },
  payment_terms: {
    label: 'Payment Terms',
    description: 'Payment schedule and terms',
    defaultSettings: {},
  },
  warranty: {
    label: 'Warranty / Guarantee',
    description: 'Warranty information',
    defaultSettings: {},
  },
  terms: {
    label: 'Terms & Conditions',
    description: 'Legal terms and conditions',
    defaultSettings: {},
  },
  acceptance: {
    label: 'Acceptance / Signature',
    description: 'Client acceptance section',
    defaultSettings: {},
  },
  attachments: {
    label: 'Attachments',
    description: 'Drawings, photos, documents',
    defaultSettings: {},
  },
};

export const defaultLayout: LayoutBlock[] = [
  { key: 'cover', enabled: true, order: 10, settings: { showLogo: true } },
  { key: 'project_summary', enabled: true, order: 20, settings: {} },
  { key: 'scope_sections', enabled: true, order: 30, settings: { showSectionTotals: true, showItemDetail: true } },
  { key: 'pricing_summary', enabled: true, order: 40, settings: { showSectionTotals: true } },
  { key: 'inclusions_exclusions', enabled: true, order: 50, settings: {} },
  { key: 'programme', enabled: true, order: 60, settings: {} },
  { key: 'payment_terms', enabled: true, order: 70, settings: {} },
  { key: 'warranty', enabled: true, order: 80, settings: {} },
  { key: 'terms', enabled: true, order: 90, settings: {} },
  { key: 'acceptance', enabled: true, order: 100, settings: {} },
  { key: 'attachments', enabled: false, order: 110, settings: {} },
];

