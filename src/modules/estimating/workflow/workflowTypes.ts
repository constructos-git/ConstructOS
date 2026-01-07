export type EstimateStatus =
  | 'draft'
  | 'internal_review'
  | 'ready_to_send'
  | 'sent'
  | 'accepted'
  | 'won'
  | 'lost'
  | 'archived'
  | 'pending'
  | 'in_progress'
  | 'on_hold'
  | 'cancelled'
  | 'quoted'
  | 'negotiating';

export type VariationStatus =
  | 'draft'
  | 'internal_review'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export type WorkflowTransition = {
  from: string;
  to: string;
  requiresPermission?: string;
  requiresValidation?: string[];
};

export const estimateTransitions: WorkflowTransition[] = [
  { from: 'draft', to: 'internal_review' },
  { from: 'internal_review', to: 'draft' },
  { from: 'internal_review', to: 'ready_to_send', requiresPermission: 'estimating.send', requiresValidation: ['hasTotals', 'hasAtLeastOneVersion', 'hasLayoutOrDefault'] },
  { from: 'ready_to_send', to: 'sent', requiresPermission: 'estimating.send' },
  { from: 'sent', to: 'accepted' },
  { from: 'accepted', to: 'won' },
  { from: 'accepted', to: 'lost' },
  { from: 'sent', to: 'lost' },
  { from: 'draft', to: 'archived' },
  { from: 'internal_review', to: 'archived' },
  { from: 'ready_to_send', to: 'archived' },
  { from: 'sent', to: 'archived' },
  { from: 'lost', to: 'archived' },
];

export const variationTransitions: WorkflowTransition[] = [
  { from: 'draft', to: 'internal_review' },
  { from: 'internal_review', to: 'draft' },
  { from: 'internal_review', to: 'sent', requiresPermission: 'estimating.send' },
  { from: 'sent', to: 'approved' },
  { from: 'sent', to: 'rejected' },
  { from: 'sent', to: 'withdrawn', requiresPermission: 'estimating.write' },
];

