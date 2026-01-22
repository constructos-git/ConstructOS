import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface FoundationsProperties {
  foundationsType?: string;
  foundationLength?: number;
  foundationWidth?: number;
  foundationDepth?: number;
  notes?: string;
}

interface FoundationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: FoundationsProperties | undefined;
  onSave: (properties: FoundationsProperties) => void;
}

export function FoundationsModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: FoundationsModalProps) {
  const [formData, setFormData] = useState<FoundationsProperties>({
    foundationsType: '',
    foundationLength: undefined,
    foundationWidth: undefined,
    foundationDepth: undefined,
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
      title="Foundations"
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
        {/* Foundation Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Foundation Type *</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'standard-strip', label: 'Standard Strip', desc: 'Most common for extensions' },
              { id: 'trench-fill', label: 'Trench Fill', desc: 'Filled to ground level' },
              { id: 'piled', label: 'Piled (Provisional)', desc: 'Requires ground investigation' },
              { id: 'raft', label: 'Raft Foundation', desc: 'For poor ground conditions' },
              { id: 'unknown', label: 'Unknown (Provisional)', desc: 'Requires site investigation' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.foundationsType === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, foundationsType: option.id })}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Foundation Dimensions */}
        {formData.foundationsType && formData.foundationsType !== 'unknown' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Foundation Dimensions</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Foundation Length (m)"
                type="number"
                value={formData.foundationLength?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, foundationLength: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 20"
              />
              <Input
                label="Foundation Width (mm)"
                type="number"
                value={formData.foundationWidth?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, foundationWidth: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 600"
              />
              <Input
                label="Foundation Depth (mm)"
                type="number"
                value={formData.foundationDepth?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, foundationDepth: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 1000"
              />
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
            placeholder="Any additional notes about foundations..."
          />
        </div>
      </div>
    </Modal>
  );
}
