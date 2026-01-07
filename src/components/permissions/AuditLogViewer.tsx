import { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import type { PermissionAuditLog } from '@/types/permissionRules';

interface AuditLogViewerProps {
  logs: PermissionAuditLog[];
  onFilter?: (filters: AuditLogFilters) => void;
}

interface AuditLogFilters {
  userId?: string;
  ruleId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function AuditLogViewer({ logs, onFilter }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const actionColors = {
    create: 'success',
    update: 'primary',
    delete: 'destructive',
    activate: 'success',
    deactivate: 'warning',
    apply: 'primary',
  } as const;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ruleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters =
      (!filters.userId || log.userId === filters.userId) &&
      (!filters.ruleId || log.ruleId === filters.ruleId) &&
      (!filters.action || log.action === filters.action);

    return matchesSearch && matchesFilters;
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Select
                label="Action"
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                options={[
                  { value: '', label: 'All Actions' },
                  { value: 'create', label: 'Create' },
                  { value: 'update', label: 'Update' },
                  { value: 'delete', label: 'Delete' },
                  { value: 'activate', label: 'Activate' },
                  { value: 'deactivate', label: 'Deactivate' },
                  { value: 'apply', label: 'Apply' },
                ]}
              />
              <Input
                label="User ID"
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Filter by user ID"
              />
              <Input
                label="Rule ID"
                value={filters.ruleId || ''}
                onChange={(e) => handleFilterChange('ruleId', e.target.value)}
                placeholder="Filter by rule ID"
              />
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    if (onFilter) {
                      onFilter({});
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            Complete history of all permission changes ({filteredLogs.length} entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No audit logs found.</div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={actionColors[log.action] as any}>
                        {log.action.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{log.userName}</span>
                      {log.ruleName && (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm text-muted-foreground">{log.ruleName}</span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="capitalize">{log.targetType}</span>
                      {log.targetId && ` • ID: ${log.targetId}`}
                    </div>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                        <div className="font-semibold">Changes:</div>
                        {Object.entries(log.changes).map(([key, change]) => (
                          <div key={key} className="mt-1">
                            <span className="font-medium">{key}:</span>{' '}
                            <span className="text-red-600 line-through">{String(change.from)}</span>{' '}
                            → <span className="text-green-600">{String(change.to)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
