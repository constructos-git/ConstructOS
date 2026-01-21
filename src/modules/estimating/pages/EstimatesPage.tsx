import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { estimatesRepo } from '../data/estimates.repo';
import { estimateTemplatesRepo } from '../data/templates.repo';
import { seedTemplatesForCompany } from '../data/seedTemplates';
import { Card, CardContent } from '@/components/ui/Card';
import { EstimateBuilderChoiceScreen } from '../components/EstimateBuilderChoiceScreen';
import { TemplateBuilderWorkflow } from '../components/template-builder/TemplateBuilderWorkflow';

export function EstimatesPage() {
  const navigate = useNavigate();
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  // Single tenant mode - use shared company ID
  const companyId = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        console.log('📥 Loading templates for company:', companyId);
        let data = await estimateTemplatesRepo.list(companyId);
        console.log(`📊 Found ${data.length} existing templates`);
        
        // If no templates exist, or if we have fewer than expected, seed them
        const expectedTemplateCount = 8; // Single Storey, Double Storey, Single Storey Flat Roof, Loft Conversion, Kitchen, Irregular, Wraparound, Dual Combo
        if (data.length === 0 || data.length < expectedTemplateCount) {
          console.log(`🌱 Found ${data.length} templates (expected ${expectedTemplateCount}). Seeding templates...`);
          const seededCount = await seedTemplatesForCompany(companyId);
          console.log(`✅ Seeded ${seededCount} templates, reloading...`);
          data = await estimateTemplatesRepo.list(companyId);
          console.log(`📊 Now have ${data.length} templates after seeding`);
        }
        
        console.log('✅ Setting templates state:', data);
        setTemplates(data);
      } catch (error) {
        console.error('❌ Failed to load templates:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    if (showTemplateBuilder) {
      loadTemplates();
    }
  }, [showTemplateBuilder, companyId]);

  const handleCreateBlankEstimate = async () => {
    try {
      const estimate = await estimatesRepo.create('New Estimate');
      navigate(`/estimating/${estimate.id}`);
    } catch (error) {
      console.error('Failed to create estimate:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      alert(`Failed to create estimate: ${errorMessage}`);
    }
  };

  return (
    <div>
      {showTemplateBuilder ? (
        isLoadingTemplates ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading templates...</p>
            </CardContent>
          </Card>
        ) : (
          <TemplateBuilderWorkflow
            companyId={companyId}
            templates={templates}
            onCancel={() => setShowTemplateBuilder(false)}
          />
        )
      ) : (
        <EstimateBuilderChoiceScreen
          onChooseTemplate={() => setShowTemplateBuilder(true)}
          onChooseBlank={handleCreateBlankEstimate}
        />
      )}
    </div>
  );
}
