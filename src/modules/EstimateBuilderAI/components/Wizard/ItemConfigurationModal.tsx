// Item Configuration Modal Component

import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { QuestionOption } from '../../domain/types';

interface ItemConfigurationModalProps {
  option: QuestionOption;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemConfigurationModal({
  option,
  isOpen,
  onClose,
}: ItemConfigurationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Configure {option.label}</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Configuration options for {option.label} will be available here.
            </p>
            {option.description && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {option.description}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
