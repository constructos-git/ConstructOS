import { useState, useRef, useEffect } from 'react';
import { CheckSquare, Square, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import type { PermissionResource, PermissionAction, Role, CustomPermission } from '@/types/permissions';
import { usePermissionsStore } from '@/stores/permissionsStore';

interface PermissionMatrixProps {
  role: Role;
  onPermissionChange: (resource: PermissionResource, action: PermissionAction, enabled: boolean) => void;
  onCustomPermissionChange?: (customPermissionId: string, enabled: boolean) => void;
}

// Permission categories with resources
const permissionCategories = {
  'Core System': [
    'dashboard', 'settings', 'users', 'roles', 'permissions', 'activities', 
    'audit_log', 'notifications', 'system_config', 'backup_restore'
  ] as PermissionResource[],
  'CRM & Contacts': [
    'companies', 'contacts', 'clients', 'contractors', 'consultants', 'vendors', 
    'suppliers', 'contact_groups', 'contact_tags', 'contact_notes', 'contact_history'
  ] as PermissionResource[],
  'Opportunities & Sales': [
    'opportunities', 'leads', 'quotes', 'proposals', 'sales_pipeline', 'conversions'
  ] as PermissionResource[],
  'Projects': [
    'projects', 'project_templates', 'project_tasks', 'project_milestones', 
    'project_phases', 'project_budget', 'project_timeline', 'project_resources', 
    'project_team', 'project_documents', 'project_chat', 'project_notes', 'project_reports'
  ] as PermissionResource[],
  'Financial': [
    'invoices', 'estimates', 'payments', 'expenses', 'purchase_orders', 'bills', 
    'credit_notes', 'refunds', 'financial_reports', 'accounting', 'tax', 'budget', 
    'forecasting', 'financial_dashboard'
  ] as PermissionResource[],
  'Communication': [
    'messages', 'emails', 'email_templates', 'email_campaigns', 'chat', 
    'chat_channels', 'chat_groups', 'announcements', 'notifications'
  ] as PermissionResource[],
  'Documents & Files': [
    'files', 'documents', 'document_templates', 'file_folders', 'file_sharing', 
    'file_versions', 'document_approval', 'digital_signatures'
  ] as PermissionResource[],
  'Knowledge & Resources': [
    'knowledgebase', 'articles', 'faqs', 'guides', 'templates', 'resources', 'training_materials'
  ] as PermissionResource[],
  'Client Portal': [
    'clientportal', 'client_dashboard', 'client_projects', 'client_invoices', 
    'client_documents', 'client_messages', 'client_settings'
  ] as PermissionResource[],
  'Reports & Analytics': [
    'reports', 'analytics', 'dashboards', 'custom_reports', 'scheduled_reports', 
    'data_export', 'business_intelligence'
  ] as PermissionResource[],
  'Integrations': [
    'integrations', 'api_keys', 'webhooks', 'third_party_apps', 'xero', 
    'quickbooks', 'freeagent', 'accounting_sync'
  ] as PermissionResource[],
  'Calendar & Scheduling': [
    'calendar', 'events', 'meetings', 'appointments', 'scheduling', 'time_tracking', 'timesheets'
  ] as PermissionResource[],
  'Time & Attendance': [
    'time_entries', 'attendance', 'leave_management', 'holidays', 'overtime'
  ] as PermissionResource[],
  'Inventory & Assets': [
    'inventory', 'assets', 'equipment', 'materials', 'stock_management', 'asset_tracking'
  ] as PermissionResource[],
  'Quality & Compliance': [
    'quality_control', 'inspections', 'compliance', 'certifications', 'safety', 'risk_management'
  ] as PermissionResource[],
  'Notes & Tasks': [
    'notes', 'tasks', 'todo_lists', 'reminders', 'checklists'
  ] as PermissionResource[],
};

// Action groups
const actionGroups = {
  'Basic': ['create', 'read', 'update', 'delete', 'view', 'edit'] as PermissionAction[],
  'Management': ['manage', 'assign', 'approve', 'reject', 'configure', 'delegate', 'revoke'] as PermissionAction[],
  'File Operations': ['export', 'import', 'download', 'upload', 'copy', 'move', 'rename', 'duplicate', 'share'] as PermissionAction[],
  'Workflow': ['archive', 'restore', 'publish', 'unpublish', 'complete', 'reopen', 'lock', 'unlock', 'verify'] as PermissionAction[],
  'Communication': ['send', 'receive', 'forward', 'reply'] as PermissionAction[],
  'Advanced': ['merge', 'split', 'schedule', 'cancel', 'audit', 'backup', 'restore_data'] as PermissionAction[],
};

const allResources = Object.values(permissionCategories).flat();
const allActions = Object.values(actionGroups).flat();

export default function PermissionMatrix({ 
  role, 
  onPermissionChange,
  onCustomPermissionChange 
}: PermissionMatrixProps) {
  const { customPermissions } = usePermissionsStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(permissionCategories)));
  const [expandedActionGroups, setExpandedActionGroups] = useState<Set<string>>(new Set(Object.keys(actionGroups)));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedActionGroup, setSelectedActionGroup] = useState<string | 'all'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState<'left' | 'right' | null>(null);

  const hasPermission = (resource: PermissionResource, action: PermissionAction) => {
    return role.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  const hasCustomPermission = (customPerm: CustomPermission) => {
    return role.customPermissions?.includes(customPerm.id) || false;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleActionGroup = (group: string) => {
    setExpandedActionGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(permissionCategories)));
    setExpandedActionGroups(new Set(Object.keys(actionGroups)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedActionGroups(new Set());
  };

  const getResourceState = (resources: PermissionResource[], actions: PermissionAction[]): 'all' | 'some' | 'none' => {
    const total = resources.length * actions.length;
    let count = 0;
    resources.forEach((resource) => {
      actions.forEach((action) => {
        if (hasPermission(resource, action)) count++;
      });
    });
    if (count === total) return 'all';
    if (count > 0) return 'some';
    return 'none';
  };

  const getCategoryState = (category: string): 'all' | 'some' | 'none' => {
    const categoryResources = permissionCategories[category as keyof typeof permissionCategories];
    return getResourceState(categoryResources, allActions);
  };

  const getActionGroupState = (group: string): 'all' | 'some' | 'none' => {
    const groupActions = actionGroups[group as keyof typeof actionGroups];
    return getResourceState(allResources, groupActions);
  };

  const handleCategoryToggle = (category: string) => {
    const categoryResources = permissionCategories[category as keyof typeof permissionCategories];
    const state = getCategoryState(category);
    const enable = state !== 'all';
    
    categoryResources.forEach((resource) => {
      allActions.forEach((action) => {
        onPermissionChange(resource, action, enable);
      });
    });
  };

  const handleActionGroupToggle = (group: string) => {
    const groupActions = actionGroups[group as keyof typeof actionGroups];
    const state = getActionGroupState(group);
    const enable = state !== 'all';
    
    allResources.forEach((resource) => {
      groupActions.forEach((action) => {
        onPermissionChange(resource, action, enable);
      });
    });
  };

  const handleSelectAll = () => {
    const allSelected = allResources.every((resource) => {
      const resourceState = getResourceState([resource], allActions);
      return resourceState === 'all';
    });
    const enable = !allSelected;
    
    allResources.forEach((resource) => {
      allActions.forEach((action) => {
        onPermissionChange(resource, action, enable);
      });
    });
  };

  const filteredCategories = Object.entries(permissionCategories).filter(([category, resources]) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.toLowerCase().includes(query) ||
      resources.some((r) => r.toLowerCase().includes(query))
    );
  });

  const filteredActionGroups = Object.entries(actionGroups).filter(([group, actions]) => {
    if (selectedActionGroup !== 'all' && group !== selectedActionGroup) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.toLowerCase().includes(query) ||
      actions.some((a) => a.toLowerCase().includes(query))
    );
  });

  const allSelected = allResources.every((resource) => {
    const resourceState = getResourceState([resource], allActions);
    return resourceState === 'all';
  });

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || !isAutoScrolling) return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 5;
    const scrollInterval = setInterval(() => {
      if (isAutoScrolling === 'left') {
        container.scrollLeft = Math.max(0, container.scrollLeft - scrollSpeed);
      } else if (isAutoScrolling === 'right') {
        container.scrollLeft = Math.min(
          container.scrollWidth - container.clientWidth,
          container.scrollLeft + scrollSpeed
        );
      }
    }, 16); // ~60fps

    return () => clearInterval(scrollInterval);
  }, [isAutoScrolling]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scrollThreshold = 100; // Pixels from edge to trigger scroll
    const containerWidth = rect.width;

    if (mouseX < scrollThreshold && container.scrollLeft > 0) {
      setIsAutoScrolling('left');
    } else if (mouseX > containerWidth - scrollThreshold && 
               container.scrollLeft < container.scrollWidth - containerWidth) {
      setIsAutoScrolling('right');
    } else {
      setIsAutoScrolling(null);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permission Matrix - {role.name}</CardTitle>
              <CardDescription>
                Configure granular permissions for {role.name} role
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {allSelected ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {Object.keys(permissionCategories).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <select
                value={selectedActionGroup}
                onChange={(e) => setSelectedActionGroup(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Action Groups</option>
                {Object.keys(actionGroups).map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Permissions Table */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-visible relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
              maxHeight: 'calc(100vh - 400px)',
              scrollbarWidth: 'thin',
            }}
          >
            {/* Auto-scroll indicators */}
            {isAutoScrolling === 'left' && (
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-primary-500/20 to-transparent pointer-events-none z-20 flex items-center justify-start pl-4">
                <ChevronRight className="h-8 w-8 text-primary-600 animate-pulse" />
              </div>
            )}
            {isAutoScrolling === 'right' && (
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-primary-500/20 to-transparent pointer-events-none z-20 flex items-center justify-end pr-4">
                <ChevronRight className="h-8 w-8 text-primary-600 animate-pulse rotate-180" />
              </div>
            )}
            
            <table className="w-full border-collapse text-sm" style={{ minWidth: 'max-content' }}>
              <thead>
                <tr>
                  <th className="border p-3 text-left sticky left-0 bg-background z-10 min-w-[280px] shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">Resource Category</span>
                    </div>
                  </th>
                  {filteredActionGroups.map(([group, actions]) => (
                    <th 
                      key={group} 
                      colSpan={expandedActionGroups.has(group) ? actions.length : 1} 
                      className="border p-3 text-center bg-muted/30 min-w-[120px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActionGroup(group)}
                            className="hover:bg-accent rounded p-1.5 transition-colors"
                          >
                            {expandedActionGroups.has(group) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleActionGroupToggle(group)}
                            className="flex items-center gap-1 hover:bg-accent rounded px-2 py-1 transition-colors"
                            title={`Toggle all ${group} permissions`}
                          >
                            {(() => {
                              const state = getActionGroupState(group);
                              return state === 'all' ? (
                                <CheckSquare className="h-4 w-4 text-primary-600" />
                              ) : state === 'some' ? (
                                <Minus className="h-4 w-4 text-primary-600" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              );
                            })()}
                          </button>
                          <span className="font-semibold text-sm">{group}</span>
                        </div>
                        {expandedActionGroups.has(group) && (
                          <div className="flex gap-2 flex-wrap justify-center">
                            {actions.map((action) => {
                              const actionState = getResourceState(allResources, [action]);
                              return (
                                <div key={action} className="flex flex-col items-center gap-1 min-w-[60px]">
                                  <button
                                    onClick={() => {
                                      const enable = actionState !== 'all';
                                      allResources.forEach((resource) => {
                                        onPermissionChange(resource, action, enable);
                                      });
                                    }}
                                    className="hover:bg-accent rounded px-1.5 py-1 transition-colors"
                                    title={`Toggle all ${action} permissions`}
                                  >
                                    {actionState === 'all' ? (
                                      <CheckSquare className="h-4 w-4 text-primary-600" />
                                    ) : actionState === 'some' ? (
                                      <Minus className="h-4 w-4 text-primary-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                  <span className="text-xs capitalize text-center leading-tight">{action}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(([category, categoryResources]) => {
                  const categoryState = getCategoryState(category);
                  const isExpanded = expandedCategories.has(category);
                  
                  return (
                    <>
                      {/* Category Header Row */}
                      <tr key={category} className="group">
                        <td className="border p-3 font-semibold bg-muted/30 sticky left-0 z-10 shadow-lg">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleCategory(category)}
                              className="hover:bg-accent rounded p-1.5 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCategoryToggle(category)}
                              className="flex items-center gap-1.5 hover:bg-accent rounded px-2 py-1 transition-colors"
                              title={`Toggle all ${category} permissions`}
                            >
                              {categoryState === 'all' ? (
                                <CheckSquare className="h-4 w-4 text-primary-600" />
                              ) : categoryState === 'some' ? (
                                <Minus className="h-4 w-4 text-primary-600" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <span className="text-sm font-semibold">{category}</span>
                            <Badge variant="secondary" className="text-xs">
                              {categoryResources.length}
                            </Badge>
                          </div>
                        </td>
                        {filteredActionGroups.map(([group, actions]) => {
                          const groupState = getResourceState(categoryResources, actions);
                          return (
                            <td
                              key={group}
                              colSpan={expandedActionGroups.has(group) ? actions.length : 1}
                              className="border p-3 text-center bg-muted/20"
                            >
                              {expandedActionGroups.has(group) ? (
                                <div className="flex gap-2 justify-center">
                                  {actions.map((action) => {
                                    const resourceState = getResourceState(categoryResources, [action]);
                                    return (
                                      <div key={action} className="flex items-center justify-center min-w-[50px]">
                                        <Checkbox
                                          checked={resourceState === 'all'}
                                          onCheckedChange={(checked) => {
                                            categoryResources.forEach((resource) => {
                                              onPermissionChange(resource, action, checked as boolean);
                                            });
                                          }}
                                          className="h-5 w-5"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => handleActionGroupToggle(group)}
                                    className="hover:bg-accent rounded px-2 py-1 transition-colors"
                                  >
                                    {groupState === 'all' ? (
                                      <CheckSquare className="h-4 w-4 text-primary-600" />
                                    ) : groupState === 'some' ? (
                                      <Minus className="h-4 w-4 text-primary-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Individual Resource Rows (when expanded) */}
                      {isExpanded && categoryResources.map((resource) => {
                        const resourceState = getResourceState([resource], allActions);
                        return (
                          <tr key={`${category}-${resource}`} className="hover:bg-accent/30 transition-colors">
                            <td className="border p-3 pl-12 sticky left-0 z-10 bg-background shadow-lg">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    const enable = resourceState !== 'all';
                                    allActions.forEach((action) => {
                                      onPermissionChange(resource, action, enable);
                                    });
                                  }}
                                  className="flex items-center gap-1.5 hover:bg-accent rounded px-2 py-1 transition-colors"
                                  title={`Toggle all ${resource} permissions`}
                                >
                                  {resourceState === 'all' ? (
                                    <CheckSquare className="h-4 w-4 text-primary-600" />
                                  ) : resourceState === 'some' ? (
                                    <Minus className="h-4 w-4 text-primary-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                                <span className="text-sm capitalize">{resource.replace(/_/g, ' ')}</span>
                              </div>
                            </td>
                            {filteredActionGroups.map(([group, actions]) => {
                              return (
                                <td
                                  key={group}
                                  colSpan={expandedActionGroups.has(group) ? actions.length : 1}
                                  className="border p-3 text-center"
                                >
                                  {expandedActionGroups.has(group) ? (
                                    <div className="flex gap-2 justify-center">
                                      {actions.map((action) => (
                                        <div key={action} className="flex items-center justify-center min-w-[50px]">
                                          <Checkbox
                                            checked={hasPermission(resource, action)}
                                            onCheckedChange={(checked) =>
                                              onPermissionChange(resource, action, checked as boolean)
                                            }
                                            className="h-5 w-5"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <button
                                        onClick={() => {
                                          const enable = getResourceState([resource], actions) !== 'all';
                                          actions.forEach((action) => {
                                            onPermissionChange(resource, action, enable);
                                          });
                                        }}
                                        className="hover:bg-accent rounded px-2 py-1 transition-colors"
                                      >
                                        {(() => {
                                          const state = getResourceState([resource], actions);
                                          return state === 'all' ? (
                                            <CheckSquare className="h-4 w-4 text-primary-600" />
                                          ) : state === 'some' ? (
                                            <Minus className="h-4 w-4 text-primary-600" />
                                          ) : (
                                            <Square className="h-4 w-4 text-muted-foreground" />
                                          );
                                        })()}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Custom Permissions Section */}
          {customPermissions.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Custom Permissions</h3>
              <div className="space-y-3">
                {customPermissions.map((customPerm) => (
                  <div
                    key={customPerm.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{customPerm.name}</div>
                      <div className="text-sm text-muted-foreground">{customPerm.description}</div>
                    </div>
                    <Checkbox
                      checked={hasCustomPermission(customPerm)}
                      onCheckedChange={(checked) => {
                        if (onCustomPermissionChange) {
                          onCustomPermissionChange(customPerm.id, checked as boolean);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
