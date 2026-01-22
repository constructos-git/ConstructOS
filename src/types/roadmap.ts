export type RoadmapStage = 'ideas' | 'in-progress' | 'released';

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  stage: RoadmapStage;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string; // e.g., 'Feature', 'Bug Fix', 'Enhancement', 'Infrastructure'
  assignedTo?: string;
  tags?: string[];
  targetDate?: Date;
  releaseDate?: Date; // For released items
  position: number; // Position within the stage/column (for ordering)
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
}

export interface RoadmapKanbanColumn {
  id: RoadmapStage;
  title: string;
  color: string;
  items: RoadmapItem[];
}

export interface RoadmapMetrics {
  total: number;
  byStage: Record<RoadmapStage, { count: number }>;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byCategory: Record<string, number>;
}
