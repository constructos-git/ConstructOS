import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useCompaniesStore } from '@/stores/companiesStore';
import type { Client } from '@/types/contacts';

interface ClientFormProps {
  client?: Client;
  onSave: (data: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company' | 'contacts'>) => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const { companies } = useCompaniesStore();
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company' | 'contacts'>>({
    company_id: client?.company_id || '',
    company_uuid: client?.company_uuid,
    client_type: client?.client_type,
    project_types: client?.project_types || [],
    average_project_value: client?.average_project_value,
    preferred_communication_method: client?.preferred_communication_method,
    relationship_start_date: client?.relationship_start_date,
    relationship_status: client?.relationship_status || 'active',
    account_manager_id: client?.account_manager_id,
    payment_terms: client?.payment_terms,
    credit_limit: client?.credit_limit,
    outstanding_balance: client?.outstanding_balance || 0,
    preferred_quote_format: client?.preferred_quote_format,
    auto_send_quotes: client?.auto_send_quotes || false,
    tags: client?.tags || [],
    notes: client?.notes,
    internal_notes: client?.internal_notes,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (companies.length === 0) {
      useCompaniesStore.getState().fetchCompanies();
    }
  }, []);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client Type</label>
          <Select
            value={formData.client_type || ''}
            onChange={(e) => handleChange('client_type', e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'residential', label: 'Residential' },
              { value: 'commercial', label: 'Commercial' },
              { value: 'industrial', label: 'Industrial' },
              { value: 'public_sector', label: 'Public Sector' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Relationship Status *</label>
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
          <label className="block text-sm font-medium mb-1">Average Project Value</label>
          <Input
            type="number"
            step="0.01"
            value={formData.average_project_value || ''}
            onChange={(e) => handleChange('average_project_value', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Credit Limit</label>
          <Input
            type="number"
            step="0.01"
            value={formData.credit_limit || ''}
            onChange={(e) => handleChange('credit_limit', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Terms</label>
          <Input
            value={formData.payment_terms || ''}
            onChange={(e) => handleChange('payment_terms', e.target.value)}
            placeholder="e.g., Net 30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preferred Quote Format</label>
          <Select
            value={formData.preferred_quote_format || ''}
            onChange={(e) => handleChange('preferred_quote_format', e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'pdf', label: 'PDF' },
              { value: 'email', label: 'Email' },
              { value: 'portal', label: 'Portal' },
            ]}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.auto_send_quotes}
            onCheckedChange={(checked) => handleChange('auto_send_quotes', checked)}
          />
          <span className="text-sm">Auto-send quotes</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Internal Notes</label>
        <Textarea
          value={formData.internal_notes || ''}
          onChange={(e) => handleChange('internal_notes', e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Client</Button>
      </div>
    </form>
  );
}
