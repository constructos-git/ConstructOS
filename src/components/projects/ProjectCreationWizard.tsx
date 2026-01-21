import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import type { Opportunity } from '@/types/opportunities';
import type { Project, ProjectType } from '@/types/projects';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useProjectsStore } from '@/stores/projectsStore';
import { useNavigate } from 'react-router-dom';

interface ProjectCreationWizardProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onComplete: (projectId: string) => void;
}

type WizardStep = 'type' | 'details' | 'location' | 'dates' | 'review';

interface WizardData {
  type?: ProjectType;
  category?: string;
  name: string;
  reference?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  site_address_line1?: string;
  site_address_line2?: string;
  site_town_city?: string;
  site_county?: string;
  site_postcode?: string;
  site_country: string;
  start_date?: string;
  end_date?: string;
  expected_completion_date?: string;
  project_value?: number;
  budget?: number;
}

export default function ProjectCreationWizard({
  isOpen,
  opportunity,
  onClose,
  onComplete,
}: ProjectCreationWizardProps) {
  const navigate = useNavigate();
  const { addProject } = useProjectsStore();
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<WizardData>({
    name: opportunity?.title || '',
    priority: 'medium',
    site_country: 'United Kingdom',
    project_value: opportunity?.value,
  });

  const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'type', title: 'Project Type', description: 'Select the type of project' },
    { id: 'details', title: 'Project Details', description: 'Enter project information' },
    { id: 'location', title: 'Location', description: 'Enter project location' },
    { id: 'dates', title: 'Timeline', description: 'Set project dates' },
    { id: 'review', title: 'Review', description: 'Review and create project' },
  ];

  const projectTypeQuestions: Record<ProjectType, { question: string; options: string[] }> = {
    residential: {
      question: 'What type of residential project?',
      options: ['New Build', 'Extension', 'Renovation', 'Refurbishment', 'Conversion', 'Other'],
    },
    commercial: {
      question: 'What type of commercial project?',
      options: ['Office Fit-Out', 'Retail', 'Warehouse', 'Industrial', 'Hospitality', 'Other'],
    },
    industrial: {
      question: 'What type of industrial project?',
      options: ['Factory', 'Warehouse', 'Distribution Center', 'Manufacturing', 'Other'],
    },
    renovation: {
      question: 'What type of renovation?',
      options: ['Full Renovation', 'Kitchen', 'Bathroom', 'Interior', 'Exterior', 'Other'],
    },
    new_build: {
      question: 'What type of new build?',
      options: ['Residential', 'Commercial', 'Mixed Use', 'Other'],
    },
    extension: {
      question: 'What type of extension?',
      options: ['Single Story', 'Two Story', 'Rear', 'Side', 'Loft Conversion', 'Other'],
    },
    other: {
      question: 'Project category?',
      options: ['General Construction', 'Maintenance', 'Repair', 'Other'],
    },
  };

  const handleNext = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const handleBack = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const handleSave = async () => {
    if (!opportunity) return;

    setIsSaving(true);
    try {
      const project = await addProject({
        name: formData.name || opportunity.title,
        reference: formData.reference,
        description: formData.description || opportunity.description,
        type: formData.type || 'residential',
        category: formData.category,
        priority: formData.priority,
        status: 'planning',
        project_value: formData.project_value || opportunity.value,
        budget: formData.budget,
        currency: opportunity.currency || 'GBP',
        start_date: formData.start_date,
        end_date: formData.end_date,
        expected_completion_date: formData.expected_completion_date,
        site_address_line1: formData.site_address_line1 || opportunity.addressLine1,
        site_address_line2: formData.site_address_line2 || opportunity.addressLine2,
        site_town_city: formData.site_town_city || opportunity.townCity,
        site_county: formData.site_county || opportunity.county,
        site_postcode: formData.site_postcode || opportunity.postcode,
        site_country: formData.site_country,
        client_company_id: '', // Will be linked via company name lookup
        client_contact_id: '', // Will be linked via contact name lookup
      });

      onComplete(project.id);
      onClose();
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Project from Opportunity"
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStepIndex
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-xs text-center max-w-[100px]">
                  <div className="font-medium">{step.title}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < currentStepIndex ? 'bg-primary-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Type *</label>
                <Select
                  value={formData.type || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value as ProjectType, category: undefined });
                  }}
                  options={[
                    { value: '', label: 'Select project type...' },
                    { value: 'residential', label: 'Residential' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'industrial', label: 'Industrial' },
                    { value: 'renovation', label: 'Renovation' },
                    { value: 'new_build', label: 'New Build' },
                    { value: 'extension', label: 'Extension' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>

              {formData.type && projectTypeQuestions[formData.type] && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {projectTypeQuestions[formData.type].question}
                  </label>
                  <Select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: '', label: 'Select category...' },
                      ...projectTypeQuestions[formData.type].options.map((opt) => ({
                        value: opt.toLowerCase().replace(/\s+/g, '_'),
                        label: opt,
                      })),
                    ]}
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reference</label>
                <Input
                  value={formData.reference || ''}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="e.g., N25019"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Project description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Project Value</label>
                  <Input
                    type="number"
                    value={formData.project_value || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, project_value: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <Input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {currentStep === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address Line 1</label>
                <Input
                  value={formData.site_address_line1 || ''}
                  onChange={(e) => setFormData({ ...formData, site_address_line1: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <Input
                  value={formData.site_address_line2 || ''}
                  onChange={(e) => setFormData({ ...formData, site_address_line2: e.target.value })}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Town/City</label>
                  <Input
                    value={formData.site_town_city || ''}
                    onChange={(e) => setFormData({ ...formData, site_town_city: e.target.value })}
                    placeholder="Town or city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">County</label>
                  <Input
                    value={formData.site_county || ''}
                    onChange={(e) => setFormData({ ...formData, site_county: e.target.value })}
                    placeholder="County"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Postcode</label>
                  <Input
                    value={formData.site_postcode || ''}
                    onChange={(e) => setFormData({ ...formData, site_postcode: e.target.value })}
                    placeholder="Postcode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <Input
                    value={formData.site_country}
                    onChange={(e) => setFormData({ ...formData, site_country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'dates' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Completion Date</label>
                <Input
                  type="date"
                  value={formData.expected_completion_date || ''}
                  onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-3">Project Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  {formData.reference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-medium">{formData.reference}</span>
                    </div>
                  )}
                  {formData.type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{formData.type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {formData.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium capitalize">{formData.category.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="font-medium capitalize">{formData.priority}</span>
                  </div>
                  {formData.project_value && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium">£{formData.project_value.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.site_town_city && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{formData.site_town_city}</span>
                    </div>
                  )}
                </div>
              </div>

              {opportunity && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This project will be created from opportunity: <strong>{opportunity.title}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={currentStep === 'type' ? onClose : handleBack} disabled={isSaving}>
            {currentStep === 'type' ? 'Cancel' : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </>
            )}
          </Button>
          {currentStep === 'review' ? (
            <Button onClick={handleSave} disabled={isSaving || !formData.name}>
              {isSaving ? 'Creating...' : 'Create Project'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!formData.type && currentStep === 'type'}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
