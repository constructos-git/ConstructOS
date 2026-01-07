import { useState } from 'react';
import { Plus, Settings, Clock, Sparkles, Code2, Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import RuleBuilder from '@/components/permissions/RuleBuilder';
import WorkflowRuleBuilder from '@/components/permissions/WorkflowRuleBuilder';
import WorkflowWizard from '@/components/permissions/WorkflowWizard';
import BuilderSelector from '@/components/permissions/BuilderSelector';
import TemplateLibrary from '@/components/permissions/TemplateLibrary';
import AuditLogViewer from '@/components/permissions/AuditLogViewer';
import {
  usePermissionRulesStore,
} from '@/stores/permissionRulesStore';
import type { PermissionRule, RuleType } from '@/types/permissionRules';
import Select from '@/components/ui/Select';

type Tab = 'rules' | 'templates' | 'audit';

export default function Permissions() {
  const [activeTab, setActiveTab] = useState<Tab>('rules');
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [isBuilderSelectorOpen, setIsBuilderSelectorOpen] = useState(false);
  const [selectedBuilderType, setSelectedBuilderType] = useState<RuleType | 'wizard' | null>(null);
  const [editingRule, setEditingRule] = useState<PermissionRule | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [builderTypeFilter, setBuilderTypeFilter] = useState<'all' | 'simple' | 'workflow'>('all');

  const {
    rules,
    templates,
    auditLogs,
    addRule,
    updateRule,
    deleteRule,
    activateRule,
    deactivateRule,
    duplicateRule,
    createRuleFromTemplate,
  } = usePermissionRulesStore();

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    const matchesBuilderType = builderTypeFilter === 'all' || rule.ruleType === builderTypeFilter;
    return matchesSearch && matchesStatus && matchesBuilderType;
  });

  const handleNewRule = () => {
    setEditingRule(undefined);
    setSelectedBuilderType(null);
    setIsBuilderSelectorOpen(true);
  };

  const handleBuilderSelected = (type: RuleType | 'wizard') => {
    setSelectedBuilderType(type);
    setIsBuilderSelectorOpen(false);
    setIsRuleBuilderOpen(true);
  };

  const handleEditRule = (rule: PermissionRule) => {
    setEditingRule(rule);
    setSelectedBuilderType(rule.ruleType || 'simple');
    setIsRuleBuilderOpen(true);
  };

  const handleSaveRule = (ruleData: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRule) {
      updateRule(editingRule.id, ruleData);
    } else {
      addRule(ruleData);
    }
    setIsRuleBuilderOpen(false);
    setEditingRule(undefined);
  };

  const handleUseTemplate = (templateId: string) => {
    const rule = createRuleFromTemplate(templateId);
    setEditingRule(rule);
    setIsRuleBuilderOpen(true);
  };

  const handleTestRule = (rule: PermissionRule) => {
    // TODO: Implement rule testing interface
    console.log('Testing rule:', rule);
    alert('Rule testing interface coming soon!');
  };

  const tabs = [
    { id: 'rules' as Tab, label: 'Rules', icon: Settings, count: rules.length },
    { id: 'templates' as Tab, label: 'Templates', icon: Sparkles, count: templates.length },
    { id: 'audit' as Tab, label: 'Audit Log', icon: Clock, count: auditLogs.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Build custom permission rules with IF/THEN logic and granular control.
          </p>
        </div>
        {activeTab === 'rules' && (
          <Button onClick={handleNewRule}>
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        )}
      </div>

      <div className="border-b">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as typeof statusFilter)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'draft', label: 'Draft' },
                  ]}
                />
              </div>
              <div className="w-40">
                <Select
                  value={builderTypeFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBuilderTypeFilter(e.target.value as typeof builderTypeFilter)}
                  options={[
                    { value: 'all', label: 'All Builders' },
                    { value: 'simple', label: 'Simple' },
                    { value: 'workflow', label: 'Workflow' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      {rule.ruleType === 'workflow' ? (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          <Workflow className="mr-1 h-3 w-3" />
                          Workflow
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          <Code2 className="mr-1 h-3 w-3" />
                          Simple
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={
                        rule.status === 'active'
                          ? 'success'
                          : rule.status === 'inactive'
                          ? 'warning'
                          : 'outline'
                      }
                    >
                      {rule.status}
                    </Badge>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="font-medium">{rule.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conditions:</span>
                      <span className="font-medium">{rule.conditions.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Actions:</span>
                      <span className="font-medium">{rule.actions.length}</span>
                    </div>
                    {rule.assignedRoles && rule.assignedRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rule.assignedRoles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditRule(rule)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateRule(rule.id)}
                      >
                        Duplicate
                      </Button>
                      {rule.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateRule(rule.id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => activateRule(rule.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this rule?')) {
                            deleteRule(rule.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRules.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No rules found matching your filters.'
                    : 'No rules created yet. Create your first rule to get started.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <TemplateLibrary
          templates={templates}
          onUseTemplate={handleUseTemplate}
        />
      )}

      {activeTab === 'audit' && (
        <AuditLogViewer logs={auditLogs} />
      )}

      <Modal
        isOpen={isBuilderSelectorOpen}
        onClose={() => {
          setIsBuilderSelectorOpen(false);
          setSelectedBuilderType(null);
        }}
        title="Choose Builder Type"
        size="xl"
        footer={null}
      >
        <BuilderSelector
          onSelect={handleBuilderSelected}
          onCancel={() => {
            setIsBuilderSelectorOpen(false);
            setSelectedBuilderType(null);
          }}
        />
      </Modal>

      {selectedBuilderType === 'simple' && (
        <Modal
          isOpen={isRuleBuilderOpen}
          onClose={() => {
            setIsRuleBuilderOpen(false);
            setEditingRule(undefined);
            setSelectedBuilderType(null);
          }}
          title={editingRule ? 'Edit Rule (Simple Builder)' : 'Create New Rule (Simple Builder)'}
          size="full"
          footer={null}
        >
          <RuleBuilder
            rule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => {
              setIsRuleBuilderOpen(false);
              setEditingRule(undefined);
              setSelectedBuilderType(null);
            }}
            onTest={editingRule ? handleTestRule : undefined}
          />
        </Modal>
      )}

      {selectedBuilderType === 'wizard' && (
        <Modal
          isOpen={isRuleBuilderOpen}
          onClose={() => {
            setIsRuleBuilderOpen(false);
            setEditingRule(undefined);
            setSelectedBuilderType(null);
          }}
          title={editingRule ? 'Edit Rule (Workflow Wizard)' : 'Create New Rule (Workflow Wizard)'}
          size="full"
          footer={null}
          showCloseButton={true}
        >
          <WorkflowWizard
            rule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => {
              setIsRuleBuilderOpen(false);
              setEditingRule(undefined);
              setSelectedBuilderType(null);
            }}
          />
        </Modal>
      )}

      {selectedBuilderType === 'workflow' && (
        <Modal
          isOpen={isRuleBuilderOpen}
          onClose={() => {
            setIsRuleBuilderOpen(false);
            setEditingRule(undefined);
            setSelectedBuilderType(null);
          }}
          title={editingRule ? 'Edit Rule (Workflow Builder)' : 'Create New Rule (Workflow Builder)'}
          size="full"
          footer={null}
          showCloseButton={true}
        >
          <WorkflowRuleBuilder
            rule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => {
              setIsRuleBuilderOpen(false);
              setEditingRule(undefined);
              setSelectedBuilderType(null);
            }}
            onTest={editingRule ? handleTestRule : undefined}
          />
        </Modal>
      )}
    </div>
  );
}

