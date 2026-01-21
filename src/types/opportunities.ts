export type OpportunityStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  contact?: string;
  value: number;
  currency: string;
  stage: OpportunityStage;
  probability: number; // 0-100
  expectedCloseDate?: Date;
  source?: string;
  description?: string;
  assignedTo?: string;
  tags?: string[];
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  townCity?: string;
  county?: string;
  postcode?: string;
  position: number; // Position within the stage/column (for ordering)
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  isArchived?: boolean; // Whether the opportunity is archived
  archivedAt?: Date; // When the opportunity was archived
  archiveReason?: 'lost' | 'won'; // Reason for archiving (if archived)
}

export interface KanbanColumn {
  id: OpportunityStage;
  title: string;
  color: string;
  opportunities: Opportunity[];
}

export interface OpportunityMetrics {
  total: number;
  totalValue: number;
  byStage: Record<OpportunityStage, { count: number; value: number }>;
  winRate: number;
  averageDealSize: number;
  pipelineVelocity: number;
}

