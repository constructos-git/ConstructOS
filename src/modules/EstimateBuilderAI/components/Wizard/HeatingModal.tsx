import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface HeatingProperties {
  heatingType?: string;
  notes?: string;
}

interface HeatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: HeatingProperties | undefined;
  onSave: (properties: HeatingProperties) => void;
}

export function HeatingModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: HeatingModalProps) {
  const [formData, setFormData] = useState<HeatingProperties>({
    heatingType: '',
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
      title="Heating Approach"
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
        {/* Heating Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Heating Approach *</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'extend-radiators', label: 'Extend Radiators', desc: 'Extend existing radiator system' },
              { id: 'wet-ufh', label: 'Wet UFH', desc: 'Wet underfloor heating' },
              { id: 'electric-ufh', label: 'Electric UFH', desc: 'Electric underfloor heating' },
              { id: 'none-existing', label: 'None/Existing', desc: 'No new heating or use existing' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.heatingType === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, heatingType: option.id })}
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
            placeholder="Any additional notes about heating..."
          />
        </div>
      </div>
    </Modal>
  );
}
