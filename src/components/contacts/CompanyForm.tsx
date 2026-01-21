import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Company } from '@/types/contacts';

interface CompanyFormProps {
  company?: Company;
  onSave: (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export default function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState<Omit<Company, 'id' | 'created_at' | 'updated_at'>>({
    company_id: company?.company_id || '', // Will be set from auth
    name: company?.name || '',
    type: company?.type || 'client',
    status: company?.status || 'active',
    country: company?.country || 'United Kingdom',
    currency: company?.currency || 'GBP',
    legal_name: company?.legal_name,
    company_number: company?.company_number,
    vat_number: company?.vat_number,
    email: company?.email,
    phone: company?.phone,
    website: company?.website,
    fax: company?.fax,
    address_line1: company?.address_line1,
    address_line2: company?.address_line2,
    address_line3: company?.address_line3,
    town_city: company?.town_city,
    county: company?.county,
    postcode: company?.postcode,
    industry: company?.industry,
    sector: company?.sector,
    employee_count: company?.employee_count,
    annual_revenue: company?.annual_revenue,
    established_year: company?.established_year,
    tags: company?.tags,
    notes: company?.notes,
    linkedin_url: company?.linkedin_url,
    twitter_handle: company?.twitter_handle,
    facebook_url: company?.facebook_url,
    payment_terms: company?.payment_terms,
    credit_limit: company?.credit_limit,
    parent_company_id: company?.parent_company_id,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
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
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Legal Name</label>
          <Input
            value={formData.legal_name || ''}
            onChange={(e) => handleChange('legal_name', e.target.value)}
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
          <label className="block text-sm font-medium mb-1">Website</label>
          <Input
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <Input
            value={formData.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company Number</label>
          <Input
            value={formData.company_number || ''}
            onChange={(e) => handleChange('company_number', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">VAT Number</label>
          <Input
            value={formData.vat_number || ''}
            onChange={(e) => handleChange('vat_number', e.target.value)}
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

      <div>
        <label className="block text-sm font-medium mb-1">Address Line 2</label>
        <Input
          value={formData.address_line2 || ''}
          onChange={(e) => handleChange('address_line2', e.target.value)}
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
        <Button type="submit">Save Company</Button>
      </div>
    </form>
  );
}
