import { useState } from 'react';
import {
  Calendar,
  User,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  Flag,
  Folder,
  GripVertical,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { RoadmapItem } from '@/types/roadmap';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface RoadmapCardProps {
  item: RoadmapItem;
  onEdit?: (item: RoadmapItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: RoadmapItem) => void;
  cardColor?: string;
  dragHandleProps?: any; // Props from @hello-pangea/dnd
}

export default function RoadmapCard({
  item,
  onEdit,
  onDelete,
  onView,
  cardColor = '#6b7280',
  dragHandleProps,
}: RoadmapCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const daysInStage = item.lastActivity
    ? differenceInDays(new Date(), new Date(item.lastActivity))
    : null;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
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
      : { r: 107, g: 114, b: 128 };
  };

  const rgb = hexToRgb(cardColor);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  const borderColor = cardColor;

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700',
        isHovered && 'shadow-lg border-primary-300 dark:border-primary-700',
        'border-l-4'
      )}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        borderLeftColor: borderColor,
        backgroundColor: bgColor,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'BUTTON' ||
          target.closest('button') !== null ||
          target.closest('[role="button"]') !== null ||
          target.closest('.relative') !== null
        ) {
          return;
        }
        if (onView) {
          onView(item);
        }
      }}
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
                    onView(item);
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
                    onEdit(item);
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
                    if (confirm('Are you sure you want to delete this roadmap item?')) {
                      onDelete(item.id);
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
            }}
          />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 pr-16" style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-sm text-foreground truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(item);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {item.title}
            </h3>
            {item.category && (
              <p 
                className="text-xs text-muted-foreground mt-1 truncate cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onView) onView(item);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {item.category}
              </p>
            )}
          </div>
        </div>

        {/* Priority */}
        {item.priority && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn('text-xs font-semibold', getPriorityColor(item.priority))}
            >
              <Flag className="h-3 w-3 mr-1" />
              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
            </Badge>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {item.assignedTo && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span className="truncate">{item.assignedTo}</span>
            </div>
          )}
          {item.targetDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Target: {format(new Date(item.targetDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {item.releaseDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Released: {format(new Date(item.releaseDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {daysInStage !== null && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {daysInStage} day{daysInStage !== 1 ? 's' : ''} in stage
              </span>
            </div>
          )}
          {item.lastActivity && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Last: {format(new Date(item.lastActivity), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
