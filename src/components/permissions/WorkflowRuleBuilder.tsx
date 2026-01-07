import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import { Save, Play, Layout, Trash2, Settings, HelpCircle, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import Badge from '@/components/ui/Badge';
import type {
  PermissionRule,
  WorkflowNode,
  RuleCondition,
  RuleAction,
} from '@/types/permissionRules';

interface WorkflowRuleBuilderProps {
  rule?: PermissionRule;
  onSave: (rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onTest?: (rule: PermissionRule) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Custom Node Components
const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`rounded-lg border-2 bg-green-50 p-4 shadow-lg transition-all ${
      selected ? 'border-green-600 ring-2 ring-green-300' : 'border-green-300'
    }`}
    style={{ minWidth: '200px' }}
  >
    <Handle type="source" position={Position.Bottom} className="!bg-green-600" />
    <div className="flex items-center gap-2">
      <div className="rounded bg-green-600 p-1.5">
        <Settings className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-green-900">{data.label || 'Trigger'}</span>
          <Tooltip content="Trigger nodes start your workflow. They represent the initial event that begins the permission check.">
            <HelpCircle className="h-3 w-3 text-green-700" />
          </Tooltip>
        </div>
        {data.description && (
          <div className="text-xs text-green-700">{data.description}</div>
        )}
        {data.aiSuggested && (
          <Badge variant="secondary" className="mt-1 text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Suggested
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`rounded-lg border-2 bg-blue-50 p-4 shadow-lg transition-all ${
      selected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-blue-300'
    }`}
    style={{ minWidth: '200px' }}
  >
    <Handle type="target" position={Position.Top} className="!bg-blue-600" />
    <Handle type="source" position={Position.Bottom} id="true" className="!bg-green-600" />
    <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-600" style={{ left: 'auto', right: 10 }} />
    <div className="flex items-center gap-2">
      <div className="rounded bg-blue-600 p-1.5">
        <Settings className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-blue-900">{data.label || 'Condition'}</span>
          <Tooltip content="Condition nodes check if a condition is true or false. Connect TRUE (green) or FALSE (red) paths based on the result.">
            <HelpCircle className="h-3 w-3 text-blue-700" />
          </Tooltip>
        </div>
        {data.condition && (
          <div className="mt-1 text-xs text-blue-700">
            {data.condition.field} {data.condition.operator} {String(data.condition.value)}
          </div>
        )}
        {data.aiSuggested && (
          <Badge variant="secondary" className="mt-1 text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Suggested
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const ConditionGroupNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`rounded-lg border-2 bg-purple-50 p-4 shadow-lg transition-all ${
      selected ? 'border-purple-600 ring-2 ring-purple-300' : 'border-purple-300'
    }`}
    style={{ minWidth: '200px' }}
  >
    <Handle type="target" position={Position.Top} className="!bg-purple-600" />
    <Handle type="source" position={Position.Bottom} id="true" className="!bg-green-600" />
    <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-600" style={{ left: 'auto', right: 10 }} />
    <div className="flex items-center gap-2">
      <div className="rounded bg-purple-600 p-1.5">
        <Settings className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-purple-900">{data.label || 'Condition Group'}</div>
        <div className="mt-1 text-xs text-purple-700">
          Logic: {data.groupLogic || 'AND'} • {data.conditionCount || 0} conditions
        </div>
      </div>
    </div>
  </div>
);

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`rounded-lg border-2 bg-orange-50 p-4 shadow-lg transition-all ${
      selected ? 'border-orange-600 ring-2 ring-orange-300' : 'border-orange-300'
    }`}
    style={{ minWidth: '200px' }}
  >
    <Handle type="target" position={Position.Top} className="!bg-orange-600" />
    <Handle type="source" position={Position.Bottom} className="!bg-orange-600" />
    <div className="flex items-center gap-2">
      <div className="rounded bg-orange-600 p-1.5">
        <Settings className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-orange-900">{data.label || 'Action'}</span>
          <Tooltip content="Action nodes execute permissions. They grant or deny access based on the workflow path taken.">
            <HelpCircle className="h-3 w-3 text-orange-700" />
          </Tooltip>
        </div>
        {data.action && (
          <div className="mt-1 text-xs text-orange-700">
            {data.action.type} → {data.action.target}
          </div>
        )}
        {data.aiSuggested && (
          <Badge variant="secondary" className="mt-1 text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Suggested
          </Badge>
        )}
      </div>
    </div>
  </div>
);

const BranchNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    className={`rounded-lg border-2 bg-yellow-50 p-4 shadow-lg transition-all ${
      selected ? 'border-yellow-600 ring-2 ring-yellow-300' : 'border-yellow-300'
    }`}
    style={{ minWidth: '200px' }}
  >
    <Handle type="target" position={Position.Top} className="!bg-yellow-600" />
    <Handle type="source" position={Position.Bottom} id="true" className="!bg-green-600" />
    <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-600" style={{ left: 'auto', right: 10 }} />
    <div className="flex items-center gap-2">
      <div className="rounded bg-yellow-600 p-1.5">
        <Settings className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-yellow-900">{data.label || 'Branch'}</div>
        {data.description && (
          <div className="mt-1 text-xs text-yellow-700">{data.description}</div>
        )}
      </div>
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  conditionGroup: ConditionGroupNode,
  action: ActionNode,
  branch: BranchNode,
};

export default function WorkflowRuleBuilder({
  rule,
  onSave,
  onCancel,
  onTest,
}: WorkflowRuleBuilderProps) {
  const [name, setName] = useState(rule?.name || '');

  // Convert workflow nodes to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    if (rule?.workflowNodes && rule.workflowNodes.length > 0) {
      return rule.workflowNodes.map((wn) => ({
        id: wn.id,
        type: wn.type,
        position: { x: wn.x, y: wn.y },
        data: {
          label: wn.label,
          ...wn.data,
        },
      }));
    }
    // Default: Start with a trigger node
    return [
      {
        id: generateId(),
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: { label: 'Start Workflow' },
      },
    ];
  }, [rule]);

  const initialEdges: Edge[] = useMemo(() => {
    if (rule?.workflowConnections) {
      return rule.workflowConnections.map((conn) => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: conn.type === 'true' ? '#22c55e' : conn.type === 'false' ? '#ef4444' : '#6b7280',
          strokeWidth: 2,
        },
        label: conn.type === 'true' ? 'TRUE' : conn.type === 'false' ? 'FALSE' : '',
      }));
    }
    return [];
  }, [rule]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const edgeType = params.sourceHandle === 'true' ? 'true' : params.sourceHandle === 'false' ? 'false' : 'default';
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: edgeType === 'true' ? '#22c55e' : edgeType === 'false' ? '#ef4444' : '#6b7280',
              strokeWidth: 2,
            },
            label: edgeType === 'true' ? 'TRUE' : edgeType === 'false' ? 'FALSE' : '',
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: generateId(),
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1'),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const updateNodeData = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node))
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...data } });
    }
  };

  const autoLayout = () => {
    // Simple auto-layout: arrange nodes in a hierarchical structure
    const layoutedNodes = nodes.map((node, index) => {
      if (node.type === 'trigger') {
        return { ...node, position: { x: 250, y: 50 } };
      }
      const level = Math.floor(index / 3);
      const positionInLevel = index % 3;
      return {
        ...node,
        position: {
          x: 100 + positionInLevel * 300,
          y: 200 + level * 150,
        },
      };
    });
    setNodes(layoutedNodes);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    // Convert React Flow nodes/edges to workflow format
    const workflowNodes: WorkflowNode[] = nodes.map((node) => ({
      id: node.id,
      type: node.type as any,
      label: node.data.label || '',
      x: node.position.x,
      y: node.position.y,
      data: node.data,
    }));

    const workflowConnections = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: (edge.style?.stroke === '#22c55e' ? 'true' : edge.style?.stroke === '#ef4444' ? 'false' : 'default') as 'true' | 'false' | 'default',
    }));

    // Extract conditions and actions from nodes
    const conditions: RuleCondition[] = [];
    const actions: RuleAction[] = [];

    nodes.forEach((node) => {
      if (node.type === 'condition' && node.data.condition) {
        conditions.push({
          id: generateId(),
          ...node.data.condition,
        });
      }
      if (node.type === 'action' && node.data.action) {
        actions.push({
          id: generateId(),
          ...node.data.action,
        });
      }
    });

    const ruleData: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description: rule?.description || '',
      status: rule?.status || 'draft',
      priority: rule?.priority || 100,
      ruleType: 'workflow',
      conditions: conditions.length > 0 ? conditions : [],
      actions: actions.length > 0 ? actions : [],
      assignedRoles: rule?.assignedRoles && rule.assignedRoles.length > 0 ? rule.assignedRoles : undefined,
      workflowNodes,
      workflowConnections,
      createdBy: rule?.createdBy || 'current-user',
      lastModifiedBy: 'current-user',
    };

    onSave(ruleData);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Input
              label="Rule Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., File Access Workflow"
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={autoLayout}>
              <Layout className="mr-2 h-4 w-4" />
              Auto Layout
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            {onTest && rule && (
              <Button variant="secondary" size="sm" onClick={() => onTest(rule)}>
                <Play className="mr-2 h-4 w-4" />
                Test
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node Library Sidebar */}
        <div className="w-64 border-r bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold">Node Library</h3>
          <div className="space-y-2">
            <button
              onClick={() => addNode('trigger')}
              className="w-full rounded-lg border-2 border-green-300 bg-green-50 p-3 text-left hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:hover:bg-green-900"
            >
              <div className="font-medium text-green-900 dark:text-green-100">Trigger</div>
              <div className="text-xs text-green-700 dark:text-green-300">Start of workflow</div>
            </button>
            <button
              onClick={() => addNode('condition')}
              className="w-full rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-left hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900"
            >
              <div className="font-medium text-blue-900 dark:text-blue-100">Condition</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Check a condition</div>
            </button>
            <button
              onClick={() => addNode('conditionGroup')}
              className="w-full rounded-lg border-2 border-purple-300 bg-purple-50 p-3 text-left hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-950 dark:hover:bg-purple-900"
            >
              <div className="font-medium text-purple-900 dark:text-purple-100">Condition Group</div>
              <div className="text-xs text-purple-700 dark:text-purple-300">Multiple conditions</div>
            </button>
            <button
              onClick={() => addNode('action')}
              className="w-full rounded-lg border-2 border-orange-300 bg-orange-50 p-3 text-left hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:hover:bg-orange-900"
            >
              <div className="font-medium text-orange-900 dark:text-orange-100">Action</div>
              <div className="text-xs text-orange-700 dark:text-orange-300">Execute an action</div>
            </button>
            <button
              onClick={() => addNode('branch')}
              className="w-full rounded-lg border-2 border-yellow-300 bg-yellow-50 p-3 text-left hover:bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-950 dark:hover:bg-yellow-900"
            >
              <div className="font-medium text-yellow-900 dark:text-yellow-100">Branch</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">Split workflow</div>
            </button>
          </div>

          {selectedNode && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">Selected Node</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNode(selectedNode.id)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                label="Label"
                value={selectedNode.data.label || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                className="mb-2"
              />
              {/* Add more node-specific configuration here */}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const colors: Record<string, string> = {
                  trigger: '#22c55e',
                  condition: '#3b82f6',
                  conditionGroup: '#a855f7',
                  action: '#f97316',
                  branch: '#eab308',
                };
                return colors[node.type || ''] || '#6b7280';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <div className="w-80 border-l bg-white p-4 dark:bg-gray-900">
            <h3 className="mb-4 font-semibold">Node Configuration</h3>
            <div className="space-y-4">
              <Input
                label="Node Label"
                value={selectedNode.data.label || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              />
              {/* Add node-type-specific configuration forms here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

