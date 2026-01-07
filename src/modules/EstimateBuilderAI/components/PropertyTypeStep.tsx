// Property Type Step Component - Universal first question

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AnswerCardGrid } from './Wizard/AnswerCardGrid';
import { ArrowLeft } from 'lucide-react';

interface PropertyTypeStepProps {
  onSelect: (propertyType: string) => void;
  onBack: () => void;
}

const propertyTypeOptions = [
  {
    id: 'detached',
    label: 'Detached',
    icon: 'Home',
    value: 'detached',
    description: 'Standalone property',
  },
  {
    id: 'semi-detached',
    label: 'Semi Detached',
    icon: 'Building2',
    value: 'semi-detached',
    description: 'Two properties joined together',
  },
  {
    id: 'end-of-terrace',
    label: 'End of Terrace',
    icon: 'Home',
    value: 'end-of-terrace',
    description: 'End property in a row',
  },
  {
    id: 'terrace',
    label: 'Terrace',
    icon: 'Building2',
    value: 'terrace',
    description: 'Middle property in a row',
  },
  {
    id: 'flat',
    label: 'Flat',
    icon: 'Home',
    value: 'flat',
    description: 'Apartment or flat',
  },
  {
    id: 'bungalow',
    label: 'Bungalow',
    icon: 'Home',
    value: 'bungalow',
    description: 'Single storey property',
  },
];

export function PropertyTypeStep({ onSelect, onBack }: PropertyTypeStepProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Estimate Builder AI</h1>
          <p className="text-muted-foreground">Please answer a few quick questions about your project to retrieve your quote.</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-600 text-white py-2.5 px-4">
          <CardTitle className="text-base text-white font-semibold">
            What best describes the existing property? *
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Select the type of existing property
          </p>
          <AnswerCardGrid
            options={propertyTypeOptions}
            selectedValue={undefined}
            onSelect={(value) => onSelect(value as string)}
            multiSelect={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

