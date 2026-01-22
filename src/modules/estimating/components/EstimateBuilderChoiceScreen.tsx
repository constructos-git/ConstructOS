// Estimate Builder Choice Screen - Choose how to create a new estimate

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Plus, Wand2 } from 'lucide-react';

interface EstimateBuilderChoiceScreenProps {
  onChooseTemplate: () => void;
  onChooseBlank: () => void;
}

export function EstimateBuilderChoiceScreen({ onChooseTemplate, onChooseBlank }: EstimateBuilderChoiceScreenProps) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Estimate Builder</h1>
        <p className="text-muted-foreground">Choose how you'd like to create your estimate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create from Template Option */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Create from Template</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start with a pre-built template for common project types. Templates include pre-configured sections and items to speed up your estimate creation.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Pre-configured sections and items</li>
              <li>Common project types included</li>
              <li>Quick start for standard projects</li>
              <li>Customizable after creation</li>
            </ul>
            <Button 
              onClick={onChooseTemplate} 
              className="w-full mt-4"
              size="lg"
            >
              Choose Template
            </Button>
          </CardContent>
        </Card>

        {/* Create Blank Estimate Option */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Create Blank Estimate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start with a completely blank estimate and build it from scratch. 
              Full control over all sections, items, and pricing.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Complete control from the start</li>
              <li>Add custom sections and items</li>
              <li>Set your own pricing</li>
              <li>Perfect for unique projects</li>
            </ul>
            <Button 
              onClick={onChooseBlank} 
              variant="secondary"
              className="w-full mt-4"
              size="lg"
            >
              Create Blank Estimate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
