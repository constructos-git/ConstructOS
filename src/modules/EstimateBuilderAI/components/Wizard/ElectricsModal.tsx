import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface ElectricsProperties {
  electricsLevel?: string;
  notes?: string;
}

interface ElectricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: ElectricsProperties | undefined;
  onSave: (properties: ElectricsProperties) => void;
}

export function ElectricsModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: ElectricsModalProps) {
  const [formData, setFormData] = useState<ElectricsProperties>({
    electricsLevel: '',
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
      title="Electrics Specification"
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
        {/* Electrics Level */}
        <div>
          <label className="text-sm font-medium mb-2 block">Electrical Specification Level *</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'basic', label: 'Basic', desc: 'Basic electrical installation' },
              { id: 'standard', label: 'Standard', desc: 'Standard electrical installation' },
              { id: 'high-spec', label: 'High Spec', desc: 'High specification electrical installation' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.electricsLevel === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, electricsLevel: option.id })}
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
            placeholder="Any additional notes about electrical specification..."
          />
        </div>
      </div>
    </Modal>
  );
}
