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
}

export default function OpportunityCard({
  opportunity,
  onEdit,
  onDelete,
  onView,
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
        // Don't trigger view if clicking on buttons or dropdowns
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'BUTTON' ||
          target.closest('button') !== null ||
          target.closest('[role="button"]') !== null ||
          target.closest('.relative') !== null
        ) {
          return;
        }
        // Handle card click to open modal - pangea/dnd handles drag separately
        if (onView) {
          onView(opportunity);
        } else {
          console.warn('[GUARDRAIL] onView handler not provided to OpportunityCard');
        }
      }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
              {opportunity.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">{opportunity.company}</p>
          </div>
          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
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

        {/* Value */}
        {cardFieldVisibility.value && (
          <div className="flex items-center justify-between">
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

        {/* Details */}
        <div className="space-y-2 text-xs text-muted-foreground">
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
          <div className="flex flex-wrap gap-1 pt-2 border-t">
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
      </div>
    </Card>
  );
}
