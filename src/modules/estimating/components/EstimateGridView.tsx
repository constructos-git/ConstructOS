import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import type { Estimate } from '../domain/estimating.types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  PoundSterling,
  Calendar,
  FileText,
  Percent,
  Building2,
  Target,
  FolderKanban,
  User,
  ChevronDown,
  Home,
  ChefHat,
  Building,
  Wrench,
  Hammer,
  Paintbrush,
  Bath,
  Bed,
  DoorOpen,
} from 'lucide-react';
import type { EstimateStatus } from '../domain/estimating.types';
import type { LucideIcon } from 'lucide-react';

const statusOptions: { value: EstimateStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'archived', label: 'Archived' },
];

// Function to get contextual icon based on estimate title
function getEstimateIcon(title: string): LucideIcon {
  const lowerTitle = title.toLowerCase();
  
  // Kitchen-related
  if (lowerTitle.includes('kitchen')) {
    return ChefHat;
  }
  
  // Extension-related
  if (lowerTitle.includes('extension') || lowerTitle.includes('extend')) {
    return Home;
  }
  
  // Loft/Conversion
  if (lowerTitle.includes('loft') || lowerTitle.includes('conversion')) {
    return Building;
  }
  
  // Bathroom
  if (lowerTitle.includes('bathroom') || lowerTitle.includes('bath')) {
    return Bath;
  }
  
  // Bedroom
  if (lowerTitle.includes('bedroom') || lowerTitle.includes('bed')) {
    return Bed;
  }
  
  // Doors/Windows
  if (lowerTitle.includes('door') || lowerTitle.includes('window')) {
    return DoorOpen;
  }
  
  // Painting/Decorating
  if (lowerTitle.includes('paint') || lowerTitle.includes('decorat')) {
    return Paintbrush;
  }
  
  // General refurbishment/renovation
  if (lowerTitle.includes('refurb') || lowerTitle.includes('renovat')) {
    return Wrench;
  }
  
  // General construction/building work
  if (lowerTitle.includes('build') || lowerTitle.includes('construct')) {
    return Hammer;
  }
  
  // Default icon
  return Building2;
}

export function EstimateGridView({
  estimates,
  onEstimateClick,
  onEdit,
  onDelete,
  onArchive,
  onAssignToProject,
  onAssignToOpportunity,
  onAssignToContact,
  onMarkWon,
  onMarkLost,
  onStatusChange,
}: {
  estimates: Estimate[];
  onEstimateClick: (estimate: Estimate) => void;
  onEdit: (estimate: Estimate) => void;
  onDelete: (estimate: Estimate) => void;
  onArchive: (estimate: Estimate) => void;
  onAssignToProject: (estimate: Estimate) => void;
  onAssignToOpportunity: (estimate: Estimate) => void;
  onAssignToContact: (estimate: Estimate) => void;
  onMarkWon: (estimate: Estimate) => void;
  onMarkLost: (estimate: Estimate) => void;
  onStatusChange?: (estimate: Estimate, newStatus: EstimateStatus) => void;
}) {
  const formatCurrency = (value: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: Estimate['status']) => {
    const colors: Record<Estimate['status'], string> = {
      draft: '#6b7280', // gray-500
      sent: '#3b82f6', // blue-500
      accepted: '#22c55e', // green-500
      rejected: '#ef4444', // red-500
      won: '#16a34a', // green-600
      lost: '#dc2626', // red-600
      archived: '#9ca3af', // gray-400
    };
    return colors[status] || '#6b7280';
  };

  const getStatusColorClass = (status: Estimate['status']) => {
    const colors: Record<Estimate['status'], string> = {
      draft: 'bg-gray-500',
      sent: 'bg-blue-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      won: 'bg-green-600',
      lost: 'bg-red-600',
      archived: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadgeVariant = (status: Estimate['status']) => {
    const variants: Record<Estimate['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      sent: 'default',
      accepted: 'default',
      rejected: 'destructive',
      won: 'default',
      lost: 'destructive',
      archived: 'secondary',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {estimates.map((estimate) => (
        <Card
          key={estimate.id}
          className="group transition-all hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer relative border-l-4"
          style={{
            borderLeftColor: getStatusColor(estimate.status),
          }}
          onClick={() => onEstimateClick(estimate)}
        >
          <div className="p-6 space-y-4">
            {/* Top Right Controls - Ellipsis Menu */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1"
              style={{ zIndex: 20, pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div data-dropdown>
                <Dropdown
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                  align="right"
                >
                  <div className="p-1">
                    {onEstimateClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEstimateClick(estimate);
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
                          if (confirm(`Are you sure you want to delete "${estimate.title}"?`)) {
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
            </div>

            {/* Header Section */}
            <div className="space-y-2 pr-10">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const IconComponent = getEstimateIcon(estimate.title);
                      return <IconComponent className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />;
                    })()}
                    <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {estimate.title}
                    </h3>
                  </div>
                  {estimate.reference && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Ref: {estimate.reference}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {onStatusChange ? (
                  <Dropdown
                    trigger={
                      <Badge 
                        variant={getStatusBadgeVariant(estimate.status)} 
                        className={cn(
                          'text-xs font-semibold px-2.5 py-1 text-white cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1',
                          getStatusColorClass(estimate.status)
                        )}
                        style={{
                          backgroundColor: getStatusColor(estimate.status),
                          borderColor: getStatusColor(estimate.status),
                        }}
                      >
                        {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                        <ChevronDown className="h-3 w-3" />
                      </Badge>
                    }
                    align="left"
                  >
                    {(close) => (
                      <div className="p-1 min-w-[120px]">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (estimate.status !== option.value && onStatusChange) {
                                onStatusChange(estimate, option.value);
                                close();
                              }
                            }}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
                              estimate.status === option.value && 'bg-accent font-semibold'
                            )}
                          >
                            <span>{option.label}</span>
                            {estimate.status === option.value && (
                              <span className="text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </Dropdown>
                ) : (
                  <Badge 
                    variant={getStatusBadgeVariant(estimate.status)} 
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 text-white',
                      getStatusColorClass(estimate.status)
                    )}
                    style={{
                      backgroundColor: getStatusColor(estimate.status),
                      borderColor: getStatusColor(estimate.status),
                    }}
                  >
                    {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                  </Badge>
                )}
                {estimate.converted_project_id && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    Converted
                  </Badge>
                )}
              </div>
            </div>

            {/* Financial Metrics Section */}
            <div className="space-y-3 bg-muted/30 rounded-lg p-4 border">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <PoundSterling className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-2xl font-bold text-foreground">{formatCurrency(estimate.total)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatCurrency(estimate.subtotal || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>VAT ({estimate.vat_rate || 20}%)</span>
                    </div>
                    <span className="font-medium text-foreground">{formatCurrency(estimate.vat_amount || 0)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Margin</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {estimate.subtotal > 0 
                        ? `${((estimate.total - estimate.subtotal) / estimate.subtotal * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>VAT Rate</span>
                    <span className="font-medium text-foreground">{estimate.vat_rate || 20}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Entities */}
            {(estimate.project_id || estimate.opportunity_id || estimate.customer_id) && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Linked To</div>
                <div className="flex flex-wrap gap-2">
                  {estimate.project_id && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      Project
                    </Badge>
                  )}
                  {estimate.opportunity_id && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Opportunity
                    </Badge>
                  )}
                  {estimate.customer_id && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Customer
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Date Information */}
            <div className="space-y-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {estimate.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">Created</div>
                      <div className="truncate">{format(new Date(estimate.created_at), 'MMM d, yyyy')}</div>
                      <div className="text-[10px] opacity-75">
                        {formatDistanceToNow(new Date(estimate.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )}
                {estimate.updated_at && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">Updated</div>
                      <div className="truncate">{format(new Date(estimate.updated_at), 'MMM d, yyyy')}</div>
                      <div className="text-[10px] opacity-75">
                        {formatDistanceToNow(new Date(estimate.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
