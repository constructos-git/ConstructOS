import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export interface ExternalWallFinishProperties {
  wallFinish?: string;
  notes?: string;
}

interface ExternalWallFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: ExternalWallFinishProperties | undefined;
  onSave: (properties: ExternalWallFinishProperties) => void;
}

export function ExternalWallFinishModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: ExternalWallFinishModalProps) {
  const [formData, setFormData] = useState<ExternalWallFinishProperties>({
    wallFinish: '',
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
      title="External Wall Finish"
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
        {/* Wall Finish Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">External Wall Finish *</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'facing-brick', label: 'Facing Brick', desc: 'Facing brick finish' },
              { id: 'render', label: 'Render', desc: 'Rendered finish' },
              { id: 'cladding', label: 'Cladding', desc: 'Cladding finish' },
              { id: 'other', label: 'Other', desc: 'Other finish type' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.wallFinish === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, wallFinish: option.id })}
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
            placeholder="Any additional notes about external wall finish..."
          />
        </div>
      </div>
    </Modal>
  );
}
