import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplateSelectionStep, type Template } from './TemplateSelectionStep';
import { PlanViewStep, type PlanViewConfig } from './PlanViewStep';
import { RoofStyleStep, type RoofConfig } from './RoofStyleStep';
import { FasciaSoffitStep, type FasciaSoffitConfig } from './FasciaSoffitStep';
import { estimatesRepo } from '../../data/estimates.repo';
import { estimateTemplatesRepo } from '../../data/templates.repo';
import { Card } from '@/components/ui/Card';

type WorkflowStep = 'template' | 'plan' | 'roof' | 'fascia';

export function TemplateBuilderWorkflow({
  companyId,
  templates,
  onCancel,
}: {
  companyId: string;
  templates: Template[];
  onCancel: () => void;
}) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [planConfig, setPlanConfig] = useState<PlanViewConfig>({
    extensionWidth: 0,
    extensionDepth: 0,
    extensionHeight: 2.4,
    existingPropertyWidth: 10, // Default 10 metres
    existingPropertyDepth: 8, // Default 8 metres
    existingPropertyX: 0,
    existingPropertyY: 0,
    attachmentSide: 'right', // Default to right side
    existingWindows: [],
    existingRoofStyle: null,
  });
  const [roofConfig, setRoofConfig] = useState<RoofConfig>({
    style: 'pitched',
    ridgeDirection: 'north-south',
    eavesLocation: 'all',
    abutsExisting: false,
  });
  const [fasciaConfig, setFasciaConfig] = useState<FasciaSoffitConfig>({
    fasciaHeight: 250,
    soffitDepth: 250,
    fasciaLocations: { front: true, back: true, left: true, right: true },
    soffitLocations: { front: true, back: true, left: true, right: true },
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCompleteDirectly = async (template: Template) => {
    try {
      setIsCreating(true);

      // Create new estimate
      const estimate = await estimatesRepo.create(template.name);

      // Apply template if it has sections/items
      try {
        await estimateTemplatesRepo.applyToEstimate(companyId, estimate.id, template.id);
      } catch (err) {
        // Template might not have items yet - that's okay
        console.warn('Template application failed (may not have items):', err);
      }

      navigate(`/estimating/${estimate.id}`);
    } catch (error) {
      console.error('Failed to create estimate from template:', error);
      alert('Failed to create estimate. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // Skip visual builder steps for kitchen and loft conversion templates
    if (template.template_type === 'refurbishment' || template.template_type === 'conversion') {
      // Go straight to creating the estimate
      handleCompleteDirectly(template);
    } else {
      // Extension templates go through visual builder
      setCurrentStep('plan');
    }
  };

  const handlePlanNext = () => {
    setCurrentStep('roof');
  };

  const handleRoofNext = () => {
    setCurrentStep('fascia');
  };

  const handleComplete = async () => {
    if (!selectedTemplate) return;

    try {
      setIsCreating(true);

      // Create new estimate
      const estimate = await estimatesRepo.create(
        `${selectedTemplate.name} - ${planConfig.extensionWidth}m × ${planConfig.extensionDepth}m`
      );

      // Apply template if it has sections/items
      try {
        await estimateTemplatesRepo.applyToEstimate(companyId, estimate.id, selectedTemplate.id);
      } catch (err) {
        // Template might not have items yet - that's okay
        console.warn('Template application failed (may not have items):', err);
      }

      // Store visual config in estimate metadata (could add a metadata field to estimates table)
      // For now, we'll navigate to the estimate builder where user can continue

      navigate(`/estimating/${estimate.id}`);
    } catch (error) {
      console.error('Failed to create estimate from template:', error);
      alert('Failed to create estimate. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getStepProgress = () => {
    // For non-extension templates, only show template selection step
    if (selectedTemplate && (selectedTemplate.template_type === 'refurbishment' || selectedTemplate.template_type === 'conversion')) {
      return {
        current: 1,
        total: 1,
        percentage: 100,
      };
    }
    const steps: WorkflowStep[] = ['template', 'plan', 'roof', 'fascia'];
    const currentIndex = steps.indexOf(currentStep);
    return {
      current: currentIndex + 1,
      total: steps.length,
      percentage: ((currentIndex + 1) / steps.length) * 100,
    };
  };

  const progress = getStepProgress();

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Step {progress.current} of {progress.total}</span>
            <span className="text-muted-foreground">{Math.round(progress.percentage)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Step Content */}
      {currentStep === 'template' && (
        <TemplateSelectionStep
          templates={templates}
          onSelect={handleTemplateSelect}
          onCancel={onCancel}
        />
      )}

      {currentStep === 'plan' && selectedTemplate && (
        <PlanViewStep
          config={planConfig}
          onNext={handlePlanNext}
          onBack={() => setCurrentStep('template')}
          onUpdate={setPlanConfig}
        />
      )}

      {currentStep === 'roof' && selectedTemplate && (
        <RoofStyleStep
          config={roofConfig}
          extensionWidth={planConfig.extensionWidth}
          extensionDepth={planConfig.extensionDepth}
          onNext={handleRoofNext}
          onBack={() => setCurrentStep('plan')}
          onUpdate={setRoofConfig}
        />
      )}

      {currentStep === 'fascia' && selectedTemplate && (
        <FasciaSoffitStep
          config={fasciaConfig}
          roofStyle={roofConfig.style}
          extensionWidth={planConfig.extensionWidth}
          extensionDepth={planConfig.extensionDepth}
          onComplete={handleComplete}
          onBack={() => setCurrentStep('roof')}
          onUpdate={setFasciaConfig}
        />
      )}

      {isCreating && (
        <Card className="p-4 bg-primary/10">
          <div className="text-center">
            <div className="text-sm font-medium">Creating estimate...</div>
            <div className="text-xs text-muted-foreground mt-1">Please wait</div>
          </div>
        </Card>
      )}
    </div>
  );
}

