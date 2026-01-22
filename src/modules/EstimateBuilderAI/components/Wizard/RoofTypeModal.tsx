import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface RoofTypeProperties {
  roofType?: string;
  roofSubType?: string;
  roofPitchedDetails?: string;
  notes?: string;
}

interface RoofTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: RoofTypeProperties | undefined;
  onSave: (properties: RoofTypeProperties) => void;
}

export function RoofTypeModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: RoofTypeModalProps) {
  const [formData, setFormData] = useState<RoofTypeProperties>({
    roofType: '',
    roofSubType: '',
    roofPitchedDetails: '',
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

  const isFlat = formData.roofType === 'flat';
  const isPitched = formData.roofType === 'pitched';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Roof Type"
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
        {/* Roof Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Roof Type *</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'flat', label: 'Flat', desc: 'Flat roof' },
              { id: 'pitched', label: 'Pitched', desc: 'Pitched roof' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.roofType === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, roofType: option.id, roofSubType: '', roofPitchedDetails: '' })}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Flat Roof Sub-Type */}
        {isFlat && (
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">Flat Roof Sub-Type</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'warm-deck', label: 'Warm Deck' },
                { id: 'cold-deck', label: 'Cold Deck' },
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    formData.roofSubType === option.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, roofSubType: option.id })}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{option.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pitched Roof Details */}
        {isPitched && (
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">Pitched Roof Details</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'gable', label: 'Gable' },
                { id: 'hipped', label: 'Hipped' },
                { id: 'mansard', label: 'Mansard' },
                { id: 'vaulted', label: 'Vaulted Ceiling' },
                { id: 'standard', label: 'Standard Ceiling' },
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    formData.roofPitchedDetails === option.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, roofPitchedDetails: option.id })}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{option.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about roof type..."
          />
        </div>
      </div>
    </Modal>
  );
}
