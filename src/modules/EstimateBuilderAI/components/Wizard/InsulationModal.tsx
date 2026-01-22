import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface InsulationProperties {
  floorInsulation?: boolean;
  roofInsulation?: boolean;
  notes?: string;
}

interface InsulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: InsulationProperties | undefined;
  onSave: (properties: InsulationProperties) => void;
}

export function InsulationModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: InsulationModalProps) {
  const [formData, setFormData] = useState<InsulationProperties>({
    floorInsulation: undefined,
    roofInsulation: undefined,
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
      title="Insulation"
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
        {/* Floor Insulation */}
        <div>
          <label className="text-sm font-medium mb-2 block">Floor Insulation</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'yes', label: 'Yes', value: true, desc: 'Floor insulation required' },
              { id: 'no', label: 'No', value: false, desc: 'No floor insulation' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.floorInsulation === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, floorInsulation: option.value })}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Roof/Ceiling Insulation */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Roof/Ceiling Insulation</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'yes', label: 'Yes', value: true, desc: 'Roof/ceiling insulation required' },
              { id: 'no', label: 'No', value: false, desc: 'No roof/ceiling insulation' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.roofInsulation === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, roofInsulation: option.value })}
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
            placeholder="Any additional notes about insulation..."
          />
        </div>
      </div>
    </Modal>
  );
}
