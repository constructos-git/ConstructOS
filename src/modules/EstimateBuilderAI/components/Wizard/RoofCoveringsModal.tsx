import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface RoofCoveringsProperties {
  roofCovering?: string;
  notes?: string;
}

interface RoofCoveringsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: RoofCoveringsProperties | undefined;
  onSave: (properties: RoofCoveringsProperties) => void;
  roofType?: string;
}

export function RoofCoveringsModal({
  isOpen,
  onClose,
  properties,
  onSave,
  roofType,
}: RoofCoveringsModalProps) {
  const [formData, setFormData] = useState<RoofCoveringsProperties>({
    roofCovering: '',
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

  const isFlat = roofType === 'flat';
  const isPitched = roofType === 'pitched';

  const flatOptions = [
    { id: 'felt', label: 'Felt', desc: 'Felt roofing' },
    { id: 'grp', label: 'GRP', desc: 'Glass Reinforced Plastic' },
    { id: 'epdm', label: 'EPDM', desc: 'EPDM rubber roofing' },
  ];

  const pitchedOptions = [
    { id: 'slate', label: 'Slate', desc: 'Slate tiles' },
    { id: 'plain-tile', label: 'Plain Tile', desc: 'Plain clay/concrete tiles' },
    { id: 'interlocking-tile', label: 'Interlocking Tile', desc: 'Interlocking tiles' },
  ];

  const options = isFlat ? flatOptions : isPitched ? pitchedOptions : [...flatOptions, ...pitchedOptions];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Roof Coverings"
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
        {/* Roof Covering */}
        <div>
          <label className="text-sm font-medium mb-2 block">Roof Covering *</label>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.roofCovering === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, roofCovering: option.id })}
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
            placeholder="Any additional notes about roof coverings..."
          />
        </div>
      </div>
    </Modal>
  );
}
