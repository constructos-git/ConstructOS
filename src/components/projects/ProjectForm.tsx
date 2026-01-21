import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ContactSelector from '@/components/contacts/ContactSelector';
import type { Project } from '@/types/projects';
import { useCompaniesStore } from '@/stores/companiesStore';

interface ProjectFormProps {
  project?: Project;
  onSave: (data: Partial<Project>) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { companies, fetchCompanies } = useCompaniesStore();
  const [formData, setFormData] = useState<Partial<Project>>({
    name: project?.name || '',
    reference: project?.reference || '',
    description: project?.description || '',
    type: project?.type || 'residential',
    category: project?.category || '',
    priority: project?.priority || 'medium',
    status: project?.status || 'planning',
    client_company_id: project?.client_company_id || '',
    client_contact_id: project?.client_contact_id || '',
    project_value: project?.project_value || undefined,
    budget: project?.budget || undefined,
    currency: project?.currency || 'GBP',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    expected_completion_date: project?.expected_completion_date || '',
    site_address_line1: project?.site_address_line1 || '',
    site_address_line2: project?.site_address_line2 || '',
    site_address_line3: project?.site_address_line3 || '',
    site_town_city: project?.site_town_city || '',
    site_county: project?.site_county || '',
    site_postcode: project?.site_postcode || '',
    site_country: project?.site_country || 'United Kingdom',
    tags: project?.tags || [],
    notes: project?.notes || '',
    internal_notes: project?.internal_notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name *</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reference</label>
          <Input
            value={formData.reference || ''}
            onChange={(e) => handleChange('reference', e.target.value)}
            placeholder="e.g., N25019"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select
            value={formData.type || 'residential'}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="renovation">Renovation</option>
            <option value="new_build">New Build</option>
            <option value="extension">Extension</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            value={formData.status || 'planning'}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select
            value={formData.priority || 'medium'}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Input
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="e.g., Kitchen, Bathroom"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          placeholder="Project description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <ContactSelector
            label="Client Company"
            type="company"
            value={formData.client_company_id ? `company:${formData.client_company_id}` : ''}
            onChange={(contactId, contactType) => {
              if (contactType === 'company') {
                handleChange('client_company_id', contactId);
              }
            }}
          />
        </div>

        <div>
          <ContactSelector
            label="Client Contact"
            type="contact"
            value={formData.client_contact_id ? `contact:${formData.client_contact_id}` : ''}
            onChange={(contactId, contactType) => {
              if (contactType === 'contact') {
                handleChange('client_contact_id', contactId);
              }
            }}
            companyId={formData.client_company_id}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Value</label>
          <Input
            type="number"
            value={formData.project_value || ''}
            onChange={(e) => handleChange('project_value', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Budget</label>
          <Input
            type="number"
            value={formData.budget || ''}
            onChange={(e) => handleChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <Select
            value={formData.currency || 'GBP'}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="GBP">GBP (£)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expected Completion</label>
          <Input
            type="date"
            value={formData.expected_completion_date || ''}
            onChange={(e) => handleChange('expected_completion_date', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Site Address</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              value={formData.site_address_line1 || ''}
              onChange={(e) => handleChange('site_address_line1', e.target.value)}
              placeholder="Address Line 1"
            />
          </div>
          <div>
            <Input
              value={formData.site_address_line2 || ''}
              onChange={(e) => handleChange('site_address_line2', e.target.value)}
              placeholder="Address Line 2"
            />
          </div>
          <div>
            <Input
              value={formData.site_town_city || ''}
              onChange={(e) => handleChange('site_town_city', e.target.value)}
              placeholder="Town/City"
            />
          </div>
          <div>
            <Input
              value={formData.site_county || ''}
              onChange={(e) => handleChange('site_county', e.target.value)}
              placeholder="County"
            />
          </div>
          <div>
            <Input
              value={formData.site_postcode || ''}
              onChange={(e) => handleChange('site_postcode', e.target.value)}
              placeholder="Postcode"
            />
          </div>
          <div>
            <Input
              value={formData.site_country || 'United Kingdom'}
              onChange={(e) => handleChange('site_country', e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          placeholder="Project notes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Internal Notes</label>
        <Textarea
          value={formData.internal_notes || ''}
          onChange={(e) => handleChange('internal_notes', e.target.value)}
          rows={3}
          placeholder="Internal notes (not visible to client)..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
