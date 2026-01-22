import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface KnockThroughProperties {
  knockThrough?: boolean | string;
  existingOpeningAction?: string;
  knockThroughType?: string;
  knockThroughEnlargementAmount?: number;
  knockThroughWidth?: number;
  knockThroughHeight?: number;
  knockThroughWidthExisting?: number;
  knockThroughHeightExisting?: number;
  knockThroughSupport?: string;
  knockThroughSupportExisting?: string;
  notes?: string;
}

interface KnockThroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: KnockThroughProperties | undefined;
  onSave: (properties: KnockThroughProperties) => void;
}

export function KnockThroughModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: KnockThroughModalProps) {
  const [formData, setFormData] = useState<KnockThroughProperties>({
    knockThrough: undefined,
    existingOpeningAction: '',
    knockThroughType: '',
    knockThroughEnlargementAmount: undefined,
    knockThroughWidth: undefined,
    knockThroughHeight: undefined,
    knockThroughWidthExisting: undefined,
    knockThroughHeightExisting: undefined,
    knockThroughSupport: '',
    knockThroughSupportExisting: '',
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

  const isNewOpening = formData.knockThrough === true;
  const isExisting = formData.knockThrough === 'existing';
  const isNotRequired = formData.knockThrough === false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Knock-Through"
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
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Knock-Through Required */}
        <div>
          <label className="text-sm font-medium mb-2 block">Is a knock-through required? *</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'yes', label: 'Yes', value: true, desc: 'Required because there isn\'t one at the moment' },
              { id: 'existing', label: 'Yes - Existing Alteration', value: 'existing', desc: 'Existing opening requires work' },
              { id: 'no', label: 'No', value: false, desc: 'Existing opening requires no amendments' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.knockThrough === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ 
                  ...formData, 
                  knockThrough: option.value,
                  existingOpeningAction: '',
                  knockThroughType: '',
                  knockThroughSupport: '',
                  knockThroughSupportExisting: '',
                })}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* New Opening Section */}
        {isNewOpening && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold">New Opening Details</h3>
            <div>
              <label className="text-sm font-medium mb-2 block">Knock-Through Type *</label>
              <Card
                className={`cursor-pointer transition-all border-primary-500 bg-primary-50 dark:bg-primary-900/20`}
              >
                <CardContent className="p-4">
                  <div className="font-medium">New Opening</div>
                  <div className="text-xs text-muted-foreground mt-1">Create a new opening for the knock-through</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opening Width (m) *"
                type="number"
                value={formData.knockThroughWidth?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughWidth: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 2.4"
              />
              <Input
                label="Opening Height (m) *"
                type="number"
                value={formData.knockThroughHeight?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughHeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 2.1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Support Required? *</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'steel', label: 'Steel', desc: 'Steel beam required' },
                  { id: 'lintel', label: 'Lintel', desc: 'Lintel required' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.knockThroughSupport === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, knockThroughSupport: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing Opening Section */}
        {isExisting && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-semibold">Existing Opening Details</h3>
            <div>
              <label className="text-sm font-medium mb-2 block">What needs to be done? *</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'remove-and-make-good', label: 'Remove & Make Good', desc: 'Remove window/door and make good' },
                  { id: 'enlarge', label: 'Enlarge Opening', desc: 'The existing aperture needs enlarging' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.existingOpeningAction === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, existingOpeningAction: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {formData.existingOpeningAction === 'enlarge' && (
              <Input
                label="Enlargement Amount (m) *"
                type="number"
                value={formData.knockThroughEnlargementAmount?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughEnlargementAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Additional width required"
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opening Width (m) *"
                type="number"
                value={formData.knockThroughWidthExisting?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughWidthExisting: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 2.4"
              />
              <Input
                label="Opening Height (m) *"
                type="number"
                value={formData.knockThroughHeightExisting?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughHeightExisting: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 2.1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Support Required? *</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'steel', label: 'Steel', desc: 'Steel beam required' },
                  { id: 'lintel', label: 'Lintel', desc: 'Lintel required' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.knockThroughSupportExisting === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, knockThroughSupportExisting: option.id })}
                  >
                    <CardContent className="p-4">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Not Required */}
        {isNotRequired && (
          <div className="border-t pt-4">
            <Card className="border-primary-200 bg-primary-50 dark:bg-primary-900/20">
              <CardContent className="p-4">
                <div className="font-medium">Not Required</div>
                <div className="text-xs text-muted-foreground mt-1">Existing opening is in place and requires no amendments</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about knock-through..."
          />
        </div>
      </div>
    </Modal>
  );
}
