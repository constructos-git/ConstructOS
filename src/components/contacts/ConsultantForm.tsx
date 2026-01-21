import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCompaniesStore } from '@/stores/companiesStore';
import { useContactsStore } from '@/stores/contactsStore';
import type { Consultant } from '@/types/contacts';

interface ConsultantFormProps {
  consultant?: Consultant;
  onSave: (data: Omit<Consultant, 'id' | 'created_at' | 'updated_at' | 'company' | 'contact'>) => void;
  onCancel: () => void;
}

export default function ConsultantForm({ consultant, onSave, onCancel }: ConsultantFormProps) {
  const { companies } = useCompaniesStore();
  const { contacts } = useContactsStore();
  const [formData, setFormData] = useState<Omit<Consultant, 'id' | 'created_at' | 'updated_at' | 'company' | 'contact'>>({
    company_id: consultant?.company_id || '',
    company_uuid: consultant?.company_uuid,
    contact_uuid: consultant?.contact_uuid,
    consultant_type: consultant?.consultant_type,
    specializations: consultant?.specializations || [],
    qualifications: consultant?.qualifications || [],
    professional_registrations: consultant?.professional_registrations || [],
    registration_numbers: consultant?.registration_numbers || [],
    hourly_rate: consultant?.hourly_rate,
    daily_rate: consultant?.daily_rate,
    project_rate_type: consultant?.project_rate_type,
    availability_status: consultant?.availability_status || 'available',
    typical_response_time: consultant?.typical_response_time,
    rating: consultant?.rating,
    total_projects_completed: consultant?.total_projects_completed || 0,
    relationship_start_date: consultant?.relationship_start_date,
    relationship_status: consultant?.relationship_status || 'active',
    tags: consultant?.tags || [],
    notes: consultant?.notes,
    internal_notes: consultant?.internal_notes,
  });

  const [specializationInput, setSpecializationInput] = useState('');

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

  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.specializations?.includes(specializationInput.trim())) {
      handleChange('specializations', [...(formData.specializations || []), specializationInput.trim()]);
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (spec: string) => {
    handleChange('specializations', formData.specializations?.filter((s) => s !== spec) || []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
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
          <label className="block text-sm font-medium mb-1">Contact</label>
          <Select
            value={formData.contact_uuid || ''}
            onChange={(e) => handleChange('contact_uuid', e.target.value)}
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
          <label className="block text-sm font-medium mb-1">Consultant Type</label>
          <Select
            value={formData.consultant_type || ''}
            onChange={(e) => handleChange('consultant_type', e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'architect', label: 'Architect' },
              { value: 'engineer', label: 'Engineer' },
              { value: 'surveyor', label: 'Surveyor' },
              { value: 'project_manager', label: 'Project Manager' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>

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
          <label className="block text-sm font-medium mb-1">Hourly Rate</label>
          <Input
            type="number"
            step="0.01"
            value={formData.hourly_rate || ''}
            onChange={(e) => handleChange('hourly_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Daily Rate</label>
          <Input
            type="number"
            step="0.01"
            value={formData.daily_rate || ''}
            onChange={(e) => handleChange('daily_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Specializations</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSpecialization();
              }
            }}
            placeholder="Add specialization"
          />
          <Button type="button" onClick={addSpecialization}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.specializations?.map((spec, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded text-sm flex items-center gap-2"
            >
              {spec}
              <button
                type="button"
                onClick={() => removeSpecialization(spec)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
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
        <Button type="submit">Save Consultant</Button>
      </div>
    </form>
  );
}
