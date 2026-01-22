// Plans Choice Screen - Choose between plans upload or starting from scratch

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Wand2 } from 'lucide-react';

interface PlansChoiceScreenProps {
  onChoosePlans: () => void;
  onChooseScratch: () => void;
}

export function PlansChoiceScreen({ onChoosePlans, onChooseScratch }: PlansChoiceScreenProps) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Estimate Builder</h1>
        <p className="text-muted-foreground">Choose how you'd like to create your estimate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Plans Option */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Create from Plans/Drawings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload architectural drawings and let AI extract all the details automatically. 
              The system will analyze your plans and extract comprehensive information including:
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Dimensions and measurements</li>
              <li>Footing types, depths, and widths</li>
              <li>Wall construction and finishes</li>
              <li>Roof types and construction details</li>
              <li>Insulation specifications</li>
              <li>And much more...</li>
            </ul>
            <Button 
              onClick={onChoosePlans} 
              className="w-full mt-4"
              size="lg"
            >
              Upload Plans & Analyze
            </Button>
          </CardContent>
        </Card>

        {/* Start from Scratch Option */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Start from Scratch</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Build your estimate step-by-step using our interactive wizard. 
              Answer questions about your project and let AI generate a comprehensive estimate.
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
              <li>Step-by-step wizard interface</li>
              <li>Template-based questions</li>
              <li>AI-powered estimate generation</li>
              <li>Full control over all details</li>
            </ul>
            <Button 
              onClick={onChooseScratch} 
              variant="secondary"
              className="w-full mt-4"
              size="lg"
            >
              Start Wizard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
