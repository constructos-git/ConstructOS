import { useState } from 'react';
import {
  Calendar,
  User,
  Building2,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  MapPin,
  PoundSterling,
  Target,
  GripVertical,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Project, ProjectStatus, ProjectPriority } from '@/types/projects';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onView?: (project: Project) => void;
  dragHandleProps?: any; // Props from @hello-pangea/dnd
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onView,
  dragHandleProps,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatCurrency = (value: number | undefined, currency: string = 'GBP') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      planning: 'bg-gray-500',
      active: 'bg-green-500',
      on_hold: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500',
      archived: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    const colors: Record<ProjectPriority, string> = {
      low: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
      medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      urgent: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusLabel = (status: ProjectStatus) => {
    const labels: Record<ProjectStatus, string> = {
      planning: 'Planning',
      active: 'Active',
      on_hold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
      archived: 'Archived',
    };
    return labels[status] || status;
  };

  const daysUntilDeadline = project.end_date
    ? differenceInDays(new Date(project.end_date), new Date())
    : null;

  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg cursor-pointer group relative',
        isHovered && 'ring-2 ring-primary-500'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(project)}
    >
      {/* Drag Handle - Top right corner */}
      {dragHandleProps && (
        <div className="absolute top-2 right-2 flex items-center gap-1" style={{ zIndex: 20, pointerEvents: 'auto' }}>
          <div
            {...dragHandleProps}
            className="w-6 h-6 cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-muted/50 transition-colors rounded opacity-40 group-hover:opacity-100"
            style={{ 
              touchAction: 'none',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>
        </div>
      )}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{project.name}</h3>
            {project.reference && (
              <p className="text-sm text-muted-foreground mb-1">Ref: {project.reference}</p>
            )}
          </div>
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: 'View Details',
                icon: Eye,
                onClick: () => onView?.(project),
              },
              {
                label: 'Edit',
                icon: Edit,
                onClick: () => onEdit?.(project),
              },
              {
                label: 'Delete',
                icon: Trash2,
                onClick: () => {
                  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                    onDelete?.(project.id);
                  }
                },
                variant: 'destructive',
              },
            ]}
          />
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={cn('text-xs', getStatusColor(project.status))}>
            {getStatusLabel(project.status)}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', getPriorityColor(project.priority))}>
            {project.priority}
          </Badge>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{project.progress_percentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Key Information */}
        <div className="space-y-2 mb-3">
          {project.client_company_id && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium">{project.client_company?.name || 'N/A'}</span>
            </div>
          )}
          
          {project.project_value && (
            <div className="flex items-center gap-2 text-sm">
              <PoundSterling className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Value:</span>
              <span className="font-medium">{formatCurrency(project.project_value, project.currency)}</span>
            </div>
          )}

          {project.site_town_city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{project.site_town_city}</span>
            </div>
          )}

          {project.end_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className={cn(
                'font-medium',
                isOverdue && 'text-red-600',
                !isOverdue && daysUntilDeadline !== null && daysUntilDeadline <= 7 && 'text-orange-600'
              )}>
                {format(new Date(project.end_date), 'MMM dd, yyyy')}
                {isOverdue && ' (Overdue)'}
                {!isOverdue && daysUntilDeadline !== null && daysUntilDeadline <= 7 && ` (${daysUntilDeadline} days)`}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {format(new Date(project.updated_at), 'MMM dd')}</span>
          </div>
          {project.progress_percentage > 0 && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{project.progress_percentage.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
