import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import type { Opportunity, OpportunityStage } from '@/types/opportunities';

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  opportunity?: Opportunity;
  initialStage?: OpportunityStage;
}

const stageOptions: { value: OpportunityStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const sourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Email', label: 'Email' },
  { value: 'Trade Show', label: 'Trade Show' },
  { value: 'Tender', label: 'Tender' },
  { value: 'Other', label: 'Other' },
];

export default function OpportunityForm({
  isOpen,
  onClose,
  onSave,
  opportunity,
  initialStage,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    contact: '',
    value: '',
    currency: 'GBP',
    stage: (initialStage || 'lead') as OpportunityStage,
    probability: 50,
    expectedCloseDate: '',
    source: '',
    description: '',
    assignedTo: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title,
        company: opportunity.company,
        contact: opportunity.contact || '',
        value: opportunity.value.toString(),
        currency: opportunity.currency,
        stage: opportunity.stage,
        probability: opportunity.probability,
        expectedCloseDate: opportunity.expectedCloseDate
          ? new Date(opportunity.expectedCloseDate).toISOString().split('T')[0]
          : '',
        source: opportunity.source || '',
        description: opportunity.description || '',
        assignedTo: opportunity.assignedTo || '',
        tags: opportunity.tags || [],
      });
    } else {
      setFormData({
        title: '',
        company: '',
        contact: '',
        value: '',
        currency: 'GBP',
        stage: (initialStage || 'lead') as OpportunityStage,
        probability: 50,
        expectedCloseDate: '',
        source: '',
        description: '',
        assignedTo: '',
        tags: [],
      });
    }
  }, [opportunity, initialStage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.value) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      title: formData.title,
      company: formData.company,
      contact: formData.contact || undefined,
      value: Number.parseFloat(formData.value),
      currency: formData.currency,
      stage: formData.stage,
      probability: formData.probability,
      expectedCloseDate: formData.expectedCloseDate
        ? new Date(formData.expectedCloseDate)
        : undefined,
      source: formData.source || undefined,
      description: formData.description || undefined,
      assignedTo: formData.assignedTo || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });
    onClose();
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity ? 'Edit Opportunity' : 'New Opportunity'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {opportunity ? 'Update' : 'Create'} Opportunity
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Office Renovation Project"
            required
          />
          <Input
            label="Company *"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Company name"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            placeholder="Contact person"
          />
          <Input
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="Team member name"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Value *"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="0"
            required
          />
          <Select
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
            ]}
          />
          <Input
            label="Probability (%)"
            type="number"
            min="0"
            max="100"
            value={formData.probability.toString()}
            onChange={(e) =>
              setFormData({ ...formData, probability: Number.parseInt(e.target.value, 10) || 0 })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Stage"
            value={formData.stage}
            onChange={(e) =>
              setFormData({ ...formData, stage: e.target.value as OpportunityStage })
            }
            options={stageOptions}
          />
          <Select
            label="Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            options={sourceOptions}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
          />
          <Input
            label="Tags (comma-separated)"
            value={formData.tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Commercial, Renovation"
          />
        </div>

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details about this opportunity..."
          rows={4}
        />
      </form>
    </Modal>
  );
}
