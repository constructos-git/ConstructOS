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
  position: number; // Position within the stage/column (for ordering)
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
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

