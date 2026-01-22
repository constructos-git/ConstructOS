// Assignment Bar Component

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { User, FolderKanban, Target, Download, FileText, Copy, Save, ExternalLink } from 'lucide-react';
import { useClients, useCreateClient } from '../../hooks/useClients';
import { useOpportunitiesStore } from '@/stores/opportunitiesStore';
import { generatePdfBlob } from '../Export/EstimatePdfRenderer';
import { downloadDocx } from '../Export/EstimateDocxBuilder';
import type { CustomerEstimate, VisibilitySettings, EstimateBuilderAIEstimate } from '../../domain/types';
import { Link } from 'react-router-dom';

interface AssignmentBarProps {
  estimate: EstimateBuilderAIEstimate;
  estimateTitle: string;
  clientId?: string;
  projectId?: string;
  opportunityId?: string;
  customerEstimate?: CustomerEstimate;
  visibilitySettings?: VisibilitySettings;
  onClientChange: (clientId: string | undefined) => void;
  onProjectChange: (projectId: string | undefined) => void;
  onOpportunityChange: (opportunityId: string | undefined) => void;
  onDuplicate: () => void;
  onSave: () => void;
  isSaving?: boolean;
  companyId?: string;
}

export function AssignmentBar({
  estimate,
  estimateTitle,
  clientId,
  projectId,
  opportunityId,
  customerEstimate,
  visibilitySettings,
  onClientChange,
  onProjectChange,
  onOpportunityChange,
  onDuplicate,
  onSave,
  isSaving,
  companyId,
}: AssignmentBarProps) {
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const { data: clients } = useClients(companyId);
  const createClient = useCreateClient(companyId);
  const { opportunities } = useOpportunitiesStore();

  const handleExportPdf = async () => {
    if (!customerEstimate || !visibilitySettings) return;
    
    const selectedClient = clients?.find((c) => c.id === clientId);
    const blob = await generatePdfBlob(
      customerEstimate,
      visibilitySettings,
      selectedClient?.name,
      estimateTitle
    );
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${estimateTitle || 'estimate'}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = async () => {
    if (!customerEstimate || !visibilitySettings) return;
    
    const selectedClient = clients?.find((c) => c.id === clientId);
    await downloadDocx(
      estimate,
      customerEstimate,
      visibilitySettings,
      selectedClient?.name
    );
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;
    try {
      const client = await createClient.mutateAsync({ name: newClientName });
      onClientChange(client.id);
      setShowClientModal(false);
      setNewClientName('');
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Client Assignment */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <select
                value={clientId || ''}
                onChange={(e) => onClientChange(e.target.value || undefined)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Select Client</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    {client.name}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClientModal(true)}
              >
                + New
              </Button>
            </div>

            {/* Project Assignment */}
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <select
                value={projectId || ''}
                onChange={(e) => onProjectChange(e.target.value || undefined)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Select Project</option>
                {/* Projects loaded from store if available */}
              </select>
              {projectId && (
                <Link
                  to="/projects"
                  className="text-primary hover:underline"
                  title="Open Project"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Opportunity Assignment */}
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <select
                value={opportunityId || ''}
                onChange={(e) => onOpportunityChange(e.target.value || undefined)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Select Opportunity</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    {opp.title || `Opportunity ${opp.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
              {opportunityId && (
                <Link
                  to="/opportunities"
                  className="text-primary hover:underline"
                  title="Open Opportunity"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onDuplicate}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPdf}
              disabled={!customerEstimate || !visibilitySettings}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportDocx}
              disabled={!customerEstimate || !visibilitySettings}
            >
              <FileText className="mr-2 h-4 w-4" />
              Word
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Create Client Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => {
          setShowClientModal(false);
          setNewClientName('');
        }}
        title="Create New Client"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Client Name</label>
            <Input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Enter client name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateClient();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowClientModal(false);
                setNewClientName('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateClient}
              disabled={!newClientName.trim() || createClient.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

