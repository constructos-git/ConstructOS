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
  FolderKanban,
  Archive,
  GripVertical,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Opportunity } from '@/types/opportunities';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useKanbanSettingsStore } from '@/stores/kanbanSettingsStore';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => void;
  onView?: (opportunity: Opportunity) => void;
  onCreateProject?: (opportunity: Opportunity) => void;
  onArchiveWon?: (opportunity: Opportunity) => void;
  dragHandleProps?: any; // Props from react-beautiful-dnd
}

export default function OpportunityCard({
  opportunity,
  onEdit,
  onDelete,
  onView,
  onCreateProject,
  onArchiveWon,
  dragHandleProps,
}: OpportunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { cardFieldVisibility, columnSettings } = useKanbanSettingsStore();

  const cardColor = columnSettings[opportunity.stage]?.cardColor || '#6b7280';
  const daysInStage = opportunity.lastActivity
    ? differenceInDays(new Date(), new Date(opportunity.lastActivity))
    : null;

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (probability >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (probability >= 25) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  // Convert hex color to RGB for background tint
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 107, g: 114, b: 128 }; // Default gray
  };

  const rgb = hexToRgb(cardColor);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const borderColor = cardColor;

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(opportunity);
    }
  };

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700',
        isHovered && 'shadow-lg border-primary-300 dark:border-primary-700',
        'border-l-4 relative'
      )}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        borderLeftColor: borderColor,
        backgroundColor: bgColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 space-y-3 relative">
        {/* Top Right Controls - Ellipsis and Drag Handle */}
        <div className="absolute top-2 right-2 flex items-center gap-1" style={{ zIndex: 20, pointerEvents: 'auto' }}>
          {/* Ellipsis Menu */}
          <div data-dropdown>
            <Dropdown
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
              align="right"
            >
              <div className="p-1">
                {onView && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(opportunity);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(opportunity);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this opportunity?')) {
                        onDelete(opportunity.id);
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </Dropdown>
          </div>
          
          {/* Drag Handle */}
          {dragHandleProps && (
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
          )}
        </div>

        {/* Main drag area - covers entire card but allows clicks through to text */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ 
              zIndex: 0,
              touchAction: 'none',
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => {
              const target = e.target as HTMLElement;
              
              // Check if clicking on text elements or interactive elements
              const isTextElement = 
                target.tagName === 'H3' ||
                target.tagName === 'P' ||
                target.tagName === 'SPAN' ||
                target.closest('h3') ||
                target.closest('p') ||
                target.closest('span') ||
                target.closest('.cursor-pointer');
              
              const isInteractive = 
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('[role="button"]') ||
                target.closest('[data-dropdown]');
              
              // If clicking on text or interactive elements, prevent drag
              if (isTextElement || isInteractive) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
              
              // Allow drag for blank space
            }}
          />
        )}
        {/* Header */}
        <div className="flex items-start justify-between gap-2" style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
          <div className="flex-1 min-w-0 pr-16" style={{ pointerEvents: 'auto' }}>
            <h3 
              className="font-semibold text-sm text-foreground truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 cursor-pointer hover:underline"
              onClick={handleTitleClick}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {opportunity.title}
            </h3>
            <p 
              className="text-xs text-muted-foreground mt-1 truncate cursor-pointer hover:underline"
              onClick={handleTitleClick}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {opportunity.company}
            </p>
          </div>
        </div>

        {/* Value */}
        {cardFieldVisibility.value && (
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 transition-colors"
            onClick={handleTitleClick}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
          >
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(opportunity.value, opportunity.currency)}
            </span>
            {cardFieldVisibility.probability && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs font-semibold',
                  getProbabilityColor(opportunity.probability)
                )}
              >
                {opportunity.probability}%
              </Badge>
            )}
          </div>
        )}

        {/* Details - Clickable to open modal */}
        <div 
          className="space-y-2 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 py-1 transition-colors"
          onClick={handleTitleClick}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
        >
          {cardFieldVisibility.contact && opportunity.contact && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span className="truncate">{opportunity.contact}</span>
            </div>
          )}
          {cardFieldVisibility.expectedCloseDate && opportunity.expectedCloseDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Close: {format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {cardFieldVisibility.assignedTo && opportunity.assignedTo && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{opportunity.assignedTo}</span>
            </div>
          )}
          {cardFieldVisibility.source && opportunity.source && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span className="truncate">{opportunity.source}</span>
            </div>
          )}
          {cardFieldVisibility.daysInStage && daysInStage !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {daysInStage} day{daysInStage !== 1 ? 's' : ''} in stage
              </span>
            </div>
          )}
          {cardFieldVisibility.lastActivity && opportunity.lastActivity && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Last: {format(new Date(opportunity.lastActivity), 'MMM d')}</span>
            </div>
          )}
          {cardFieldVisibility.createdAt && opportunity.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Created: {format(new Date(opportunity.createdAt), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {cardFieldVisibility.tags && opportunity.tags && opportunity.tags.length > 0 && (
          <div 
            className="flex flex-wrap gap-1 pt-2 border-t cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 transition-colors"
            onClick={handleTitleClick}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
          >
            {opportunity.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{opportunity.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons for Won Stage */}
        {opportunity.stage === 'won' && !opportunity.isArchived && (
          <div 
            className="flex gap-2 pt-3 border-t"
            style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
          >
            {onCreateProject && (
              <Button
                size="sm"
                className="flex-1 whitespace-nowrap text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onCreateProject(opportunity);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <FolderKanban className="h-3 w-3 mr-1.5 flex-shrink-0" />
                <span className="truncate">Create Project</span>
              </Button>
            )}
            {onArchiveWon && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 whitespace-nowrap text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onArchiveWon(opportunity);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Archive className="h-3 w-3 mr-1.5 flex-shrink-0" />
                <span className="truncate">Archive</span>
              </Button>
            )}
          </div>
        )}
      </div>

    </Card>
  );
}
