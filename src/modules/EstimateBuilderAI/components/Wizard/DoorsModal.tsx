import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface DoorsProperties {
  doorType?: string;
  notes?: string;
}

interface DoorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: DoorsProperties | undefined;
  onSave: (properties: DoorsProperties) => void;
}

export function DoorsModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: DoorsModalProps) {
  const [formData, setFormData] = useState<DoorsProperties>({
    doorType: '',
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
      title="Rear Opening/Doors"
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
        {/* Door Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Door Type *</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'bifold', label: 'Bifold', desc: 'Bifold doors' },
              { id: 'sliding', label: 'Sliding', desc: 'Sliding doors' },
              { id: 'french', label: 'French', desc: 'French doors' },
              { id: 'patio', label: 'Patio', desc: 'Patio doors' },
              { id: 'none', label: 'None', desc: 'No rear doors' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.doorType === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, doorType: option.id })}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
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
            placeholder="Any additional notes about doors..."
          />
        </div>
      </div>
    </Modal>
  );
}
