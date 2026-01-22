import { useState, useRef } from 'react';
import {
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  GripVertical,
  PoundSterling,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Estimate } from '../domain/estimating.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGenericKanbanSettingsStore } from '@/stores/genericKanbanSettingsStore';

interface EstimateCardProps {
  estimate: Estimate;
  onEdit?: (estimate: Estimate) => void;
  onDelete?: (estimate: Estimate) => void;
  onView?: (estimate: Estimate) => void;
  dragHandleProps?: any; // Props from @hello-pangea/dnd
  columnId: string; // Column ID for getting card color
}

export default function EstimateCard({
  estimate,
  onEdit,
  onDelete,
  onView,
  dragHandleProps,
  columnId,
}: EstimateCardProps) {
  const wasDraggedRef = useRef(false);
  const { columnSettings } = useGenericKanbanSettingsStore();

  const cardColor = columnSettings[columnId]?.cardColor || '#6b7280';

  const formatCurrency = (value: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
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
    // Don't open if we just finished dragging
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    if (onView) {
      onView(estimate);
    }
  };

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700',
        'border-l-4 relative'
      )}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        borderLeftColor: borderColor,
        backgroundColor: bgColor,
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
                      onView(estimate);
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
                      onEdit(estimate);
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
                      if (confirm('Are you sure you want to delete this estimate?')) {
                        onDelete(estimate);
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
          
          {/* Drag Handle - Visual indicator only */}
          {dragHandleProps && (
            <div
              className="w-6 h-6 cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-muted/50 transition-colors rounded opacity-40 group-hover:opacity-100"
              style={{ 
                touchAction: 'none',
                pointerEvents: 'none', // Don't intercept events, let the main drag area handle it
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
            onDragStart={() => {
              wasDraggedRef.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                wasDraggedRef.current = false;
              }, 200);
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
              {estimate.title}
            </h3>
            {estimate.reference && (
              <p 
                className="text-xs text-muted-foreground mt-1 truncate cursor-pointer hover:underline"
                onClick={handleTitleClick}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                Ref: {estimate.reference}
              </p>
            )}
          </div>
        </div>

        {/* Value */}
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 transition-colors"
          onClick={handleTitleClick}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
        >
          <div className="flex items-center gap-2">
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-lg">{formatCurrency(estimate.total)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {estimate.status}
          </Badge>
        </div>

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
          {estimate.created_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Created: {format(new Date(estimate.created_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          {estimate.updated_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Updated: {format(new Date(estimate.updated_at), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
