import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useContactsStore } from '@/stores/contactsStore';
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
  const { companies, fetchCompanies } = useCompaniesStore();
  const { contacts, fetchContacts } = useContactsStore();
  
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      fetchContacts();
    }
  }, [isOpen, fetchCompanies, fetchContacts]);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    companyId: '',
    contact: '',
    contactId: '',
    value: '',
    currency: 'GBP',
    stage: (initialStage || 'lead') as OpportunityStage,
    probability: 50,
    expectedCloseDate: '',
    source: '',
    description: '',
    assignedTo: '',
    tags: [] as string[],
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    townCity: '',
    county: '',
    postcode: '',
  });

  useEffect(() => {
    if (opportunity) {
      const company = companies.find(c => c.name === opportunity.company);
      const contact = contacts.find(c => `${c.first_name} ${c.last_name}` === opportunity.contact);
      setFormData({
        title: opportunity.title,
        company: opportunity.company,
        companyId: company?.id || '',
        contact: opportunity.contact || '',
        contactId: contact?.id || '',
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
        addressLine1: opportunity.addressLine1 || '',
        addressLine2: opportunity.addressLine2 || '',
        addressLine3: opportunity.addressLine3 || '',
        townCity: opportunity.townCity || '',
        county: opportunity.county || '',
        postcode: opportunity.postcode || '',
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
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        townCity: '',
        county: '',
        postcode: '',
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
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      addressLine3: formData.addressLine3 || undefined,
      townCity: formData.townCity || undefined,
      county: formData.county || undefined,
      postcode: formData.postcode || undefined,
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
          <Select
            label="Company *"
            value={formData.companyId}
            onChange={(e) => {
              const company = companies.find(c => c.id === e.target.value);
              setFormData({ 
                ...formData, 
                companyId: e.target.value,
                company: company?.name || '',
              });
            }}
            options={[
              { value: '', label: 'Select company...' },
              ...companies.map(c => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Contact"
            value={formData.contactId}
            onChange={(e) => {
              const contact = contacts.find(c => c.id === e.target.value);
              setFormData({ 
                ...formData, 
                contactId: e.target.value,
                contact: contact ? `${contact.first_name} ${contact.last_name}` : '',
              });
            }}
            options={[
              { value: '', label: 'Select contact...' },
              ...contacts
                .filter(c => !formData.companyId || c.company_uuid === formData.companyId)
                .map(c => ({ 
                  value: c.id, 
                  label: `${c.first_name} ${c.last_name}${c.company ? ` (${c.company.name})` : ''}` 
                })),
            ]}
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

        {/* Address Section */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-4">Customer Address</h3>
          <div className="space-y-4">
            <Input
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="Street address"
            />
            <Input
              label="Address Line 2"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              placeholder="Apartment, suite, etc."
            />
            <Input
              label="Address Line 3"
              value={formData.addressLine3}
              onChange={(e) => setFormData({ ...formData, addressLine3: e.target.value })}
              placeholder="Additional address info"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Town/City"
                value={formData.townCity}
                onChange={(e) => setFormData({ ...formData, townCity: e.target.value })}
                placeholder="Town or city"
              />
              <Input
                label="County"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                placeholder="County"
              />
            </div>
            <Input
              label="Postcode"
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              placeholder="Postcode"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
