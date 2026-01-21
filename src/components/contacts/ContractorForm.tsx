import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useContactsStore } from '@/stores/contactsStore';
import type { Contractor } from '@/types/contacts';

interface ContractorFormProps {
  contractor?: Contractor;
  onSave: (data: Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'company' | 'preferred_contact' | 'contacts'>) => void;
  onCancel: () => void;
}

export default function ContractorForm({ contractor, onSave, onCancel }: ContractorFormProps) {
  const { companies } = useCompaniesStore();
  const { contacts } = useContactsStore();
  const [formData, setFormData] = useState<Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'company' | 'preferred_contact' | 'contacts'>>({
    company_id: contractor?.company_id || '',
    company_uuid: contractor?.company_uuid,
    trade_types: contractor?.trade_types || [],
    certifications: contractor?.certifications || [],
    insurance_expiry: contractor?.insurance_expiry,
    public_liability_amount: contractor?.public_liability_amount,
    employer_liability_amount: contractor?.employer_liability_amount,
    max_project_value: contractor?.max_project_value,
    geographic_coverage: contractor?.geographic_coverage || [],
    availability_status: contractor?.availability_status || 'available',
    rating: contractor?.rating,
    total_projects_completed: contractor?.total_projects_completed || 0,
    on_time_completion_rate: contractor?.on_time_completion_rate,
    quality_rating: contractor?.quality_rating,
    payment_terms: contractor?.payment_terms,
    preferred_payment_method: contractor?.preferred_payment_method,
    relationship_start_date: contractor?.relationship_start_date,
    relationship_status: contractor?.relationship_status || 'active',
    preferred_contact_id: contractor?.preferred_contact_id,
    tags: contractor?.tags || [],
    notes: contractor?.notes,
    internal_notes: contractor?.internal_notes,
  });

  const [tradeInput, setTradeInput] = useState('');

  useEffect(() => {
    if (companies.length === 0) {
      useCompaniesStore.getState().fetchCompanies();
    }
    if (contacts.length === 0) {
      useContactsStore.getState().fetchContacts();
    }
  }, []);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTrade = () => {
    if (tradeInput.trim() && !formData.trade_types?.includes(tradeInput.trim())) {
      handleChange('trade_types', [...(formData.trade_types || []), tradeInput.trim()]);
      setTradeInput('');
    }
  };

  const removeTrade = (trade: string) => {
    handleChange('trade_types', formData.trade_types?.filter((t) => t !== trade) || []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Company *</label>
        <Select
          value={formData.company_uuid || ''}
          onChange={(e) => handleChange('company_uuid', e.target.value)}
          options={[
            { value: '', label: 'Select company...' },
            ...companies.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Trade Types</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tradeInput}
            onChange={(e) => setTradeInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTrade();
              }
            }}
            placeholder="Add trade type (e.g., Carpentry)"
          />
          <Button type="button" onClick={addTrade}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.trade_types?.map((trade, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded text-sm flex items-center gap-2"
            >
              {trade}
              <button
                type="button"
                onClick={() => removeTrade(trade)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Availability Status</label>
          <Select
            value={formData.availability_status}
            onChange={(e) => handleChange('availability_status', e.target.value)}
            options={[
              { value: 'available', label: 'Available' },
              { value: 'busy', label: 'Busy' },
              { value: 'unavailable', label: 'Unavailable' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Relationship Status</label>
          <Select
            value={formData.relationship_status}
            onChange={(e) => handleChange('relationship_status', e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'prospect', label: 'Prospect' },
              { value: 'former', label: 'Former' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Public Liability Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.public_liability_amount || ''}
            onChange={(e) => handleChange('public_liability_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Terms</label>
          <Input
            value={formData.payment_terms || ''}
            onChange={(e) => handleChange('payment_terms', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Preferred Contact</label>
        <Select
          value={formData.preferred_contact_id || ''}
          onChange={(e) => handleChange('preferred_contact_id', e.target.value)}
          options={[
            { value: '', label: 'Select contact...' },
            ...contacts.map((c) => ({
              value: c.id,
              label: `${c.first_name} ${c.last_name}${c.company ? ` (${c.company.name})` : ''}`,
            })),
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Contractor</Button>
      </div>
    </form>
  );
}
