import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface RooflightsProperties {
  rooflightsCount?: number;
  notes?: string;
}

interface RooflightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: RooflightsProperties | undefined;
  onSave: (properties: RooflightsProperties) => void;
}

export function RooflightsModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: RooflightsModalProps) {
  const [formData, setFormData] = useState<RooflightsProperties>({
    rooflightsCount: 0,
    notes: '',
  });

  useEffect(() => {
    if (properties) {
      setFormData(properties);
    }
  }, [properties]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rooflights"
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Rooflights Count */}
        <div>
          <label className="text-sm font-medium mb-2 block">Number of Rooflights *</label>
          <div className="grid grid-cols-5 gap-3">
            {[
              { id: '0', label: '0', value: 0, desc: 'No rooflights' },
              { id: '1', label: '1', value: 1, desc: 'One rooflight' },
              { id: '2', label: '2', value: 2, desc: 'Two rooflights' },
              { id: '3', label: '3', value: 3, desc: 'Three rooflights' },
              { id: '4-plus', label: '4+', value: 4, desc: 'Four or more rooflights' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.rooflightsCount === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, rooflightsCount: option.value })}
              >
                <CardContent className="p-4">
                  <div className="font-medium text-center">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 text-center">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about rooflights..."
          />
        </div>
      </div>
    </Modal>
  );
}
