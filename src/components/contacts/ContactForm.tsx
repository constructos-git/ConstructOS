import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useCompaniesStore } from '@/stores/companiesStore';
import type { Contact } from '@/types/contacts';

interface ContactFormProps {
  contact?: Contact;
  onSave: (data: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'full_name' | 'company'>) => void;
  onCancel: () => void;
}

export default function ContactForm({ contact, onSave, onCancel }: ContactFormProps) {
  const { companies } = useCompaniesStore();
  const [formData, setFormData] = useState<Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'full_name' | 'company'>>({
    company_id: contact?.company_id || '',
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    title: contact?.title,
    job_title: contact?.job_title,
    department: contact?.department,
    email: contact?.email,
    phone: contact?.phone,
    mobile: contact?.mobile,
    fax: contact?.fax,
    address_line1: contact?.address_line1,
    address_line2: contact?.address_line2,
    address_line3: contact?.address_line3,
    town_city: contact?.town_city,
    county: contact?.county,
    postcode: contact?.postcode,
    country: contact?.country || 'United Kingdom',
    company_uuid: contact?.company_uuid,
    type: contact?.type || 'client',
    is_primary_contact: contact?.is_primary_contact || false,
    is_decision_maker: contact?.is_decision_maker || false,
    preferred_contact_method: contact?.preferred_contact_method,
    email_opt_in: contact?.email_opt_in ?? true,
    sms_opt_in: contact?.sms_opt_in ?? false,
    linkedin_url: contact?.linkedin_url,
    twitter_handle: contact?.twitter_handle,
    status: contact?.status || 'active',
    tags: contact?.tags || [],
    notes: contact?.notes,
    birthday: contact?.birthday,
    anniversary: contact?.anniversary,
    personal_notes: contact?.personal_notes,
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
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <Input
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            error={errors.first_name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <Input
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            error={errors.last_name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Select
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'Mr', label: 'Mr' },
              { value: 'Mrs', label: 'Mrs' },
              { value: 'Ms', label: 'Ms' },
              { value: 'Miss', label: 'Miss' },
              { value: 'Dr', label: 'Dr' },
              { value: 'Prof', label: 'Prof' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <Input
            value={formData.job_title || ''}
            onChange={(e) => handleChange('job_title', e.target.value)}
          />
        </div>

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
          <label className="block text-sm font-medium mb-1">Type *</label>
          <Select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={[
              { value: 'client', label: 'Client' },
              { value: 'contractor', label: 'Contractor' },
              { value: 'consultant', label: 'Consultant' },
              { value: 'supplier', label: 'Supplier' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <Input
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mobile</label>
          <Input
            value={formData.mobile || ''}
            onChange={(e) => handleChange('mobile', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status *</label>
          <Select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address Line 1</label>
        <Input
          value={formData.address_line1 || ''}
          onChange={(e) => handleChange('address_line1', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Town/City</label>
          <Input
            value={formData.town_city || ''}
            onChange={(e) => handleChange('town_city', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">County</label>
          <Input
            value={formData.county || ''}
            onChange={(e) => handleChange('county', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Postcode</label>
          <Input
            value={formData.postcode || ''}
            onChange={(e) => handleChange('postcode', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.is_primary_contact}
            onCheckedChange={(checked) => handleChange('is_primary_contact', checked)}
          />
          <span className="text-sm">Primary Contact</span>
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.is_decision_maker}
            onCheckedChange={(checked) => handleChange('is_decision_maker', checked)}
          />
          <span className="text-sm">Decision Maker</span>
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.email_opt_in}
            onCheckedChange={(checked) => handleChange('email_opt_in', checked)}
          />
          <span className="text-sm">Email Opt-in</span>
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

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Contact</Button>
      </div>
    </form>
  );
}
