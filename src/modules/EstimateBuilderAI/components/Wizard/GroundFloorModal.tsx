import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface GroundFloorProperties {
  groundFloorType?: string;
  notes?: string;
}

interface GroundFloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: GroundFloorProperties | undefined;
  onSave: (properties: GroundFloorProperties) => void;
}

export function GroundFloorModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: GroundFloorModalProps) {
  const [formData, setFormData] = useState<GroundFloorProperties>({
    groundFloorType: '',
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
      title="Ground Floor Construction"
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
        {/* Ground Floor Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Ground Floor Type *</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'solid-floor', label: 'Solid Floor', desc: 'Solid concrete floor with insulation - most common' },
              { id: 'suspended-timber', label: 'Suspended Timber', desc: 'Requires ventilation and support' },
              { id: 'suspended-concrete', label: 'Suspended Concrete', desc: 'Precast or in-situ' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.groundFloorType === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, groundFloorType: option.id })}
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
            placeholder="Any additional notes about ground floor construction..."
          />
        </div>
      </div>
    </Modal>
  );
}
