import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface StructuralSteelsProperties {
  // Knock-through steel (new opening)
  knockThroughSteelType?: string;
  knockThroughSteelLength?: number;
  knockThroughSteelPosts?: number;
  knockThroughSteelConnections?: number;
  knockThroughSteelOther?: string;
  // Knock-through lintel (new opening)
  knockThroughLintelType?: string;
  knockThroughLintelLength?: number;
  knockThroughLintelPadstones?: number;
  knockThroughLintelOther?: string;
  // Knock-through steel (existing opening)
  knockThroughSteelTypeExisting?: string;
  knockThroughSteelLengthExisting?: number;
  // Knock-through lintel (existing opening)
  knockThroughLintelTypeExisting?: string;
  knockThroughLintelLengthExisting?: number;
  // Other steels and lintels
  otherSteelsLintels?: string[];
  notes?: string;
}

interface StructuralSteelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: StructuralSteelsProperties | undefined;
  onSave: (properties: StructuralSteelsProperties) => void;
  knockThroughSupport?: string;
  knockThroughSupportExisting?: string;
  knockThroughWidth?: number;
  knockThroughWidthExisting?: number;
}

export function StructuralSteelsModal({
  isOpen,
  onClose,
  properties,
  onSave,
  knockThroughSupport,
  knockThroughSupportExisting,
  knockThroughWidth,
  knockThroughWidthExisting,
}: StructuralSteelsModalProps) {
  const [formData, setFormData] = useState<StructuralSteelsProperties>({
    knockThroughSteelType: '',
    knockThroughSteelLength: undefined,
    knockThroughSteelPosts: undefined,
    knockThroughSteelConnections: undefined,
    knockThroughSteelOther: '',
    knockThroughLintelType: '',
    knockThroughLintelLength: undefined,
    knockThroughLintelPadstones: undefined,
    knockThroughLintelOther: '',
    knockThroughSteelTypeExisting: '',
    knockThroughSteelLengthExisting: undefined,
    knockThroughLintelTypeExisting: '',
    knockThroughLintelLengthExisting: undefined,
    otherSteelsLintels: [],
    notes: '',
  });

  useEffect(() => {
    if (properties) {
      setFormData(properties);
    }
    // Auto-calculate lengths if width is provided
    if (knockThroughWidth && knockThroughSupport === 'steel' && !formData.knockThroughSteelLength) {
      setFormData(prev => ({ ...prev, knockThroughSteelLength: knockThroughWidth + 0.3 }));
    }
    if (knockThroughWidth && knockThroughSupport === 'lintel' && !formData.knockThroughLintelLength) {
      setFormData(prev => ({ ...prev, knockThroughLintelLength: knockThroughWidth + 0.3 }));
    }
    if (knockThroughWidthExisting && knockThroughSupportExisting === 'steel' && !formData.knockThroughSteelLengthExisting) {
      setFormData(prev => ({ ...prev, knockThroughSteelLengthExisting: knockThroughWidthExisting + 0.3 }));
    }
    if (knockThroughWidthExisting && knockThroughSupportExisting === 'lintel' && !formData.knockThroughLintelLengthExisting) {
      setFormData(prev => ({ ...prev, knockThroughLintelLengthExisting: knockThroughWidthExisting + 0.3 }));
    }
  }, [properties, knockThroughSupport, knockThroughSupportExisting, knockThroughWidth, knockThroughWidthExisting]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const toggleOtherSteel = (value: string) => {
    const current = formData.otherSteelsLintels || [];
    if (current.includes(value)) {
      setFormData({ ...formData, otherSteelsLintels: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, otherSteelsLintels: [...current, value] });
    }
  };

  const steelTypes = [
    { id: 'ub-152x89', label: 'UB 152×89×16' },
    { id: 'ub-178x102', label: 'UB 178×102×19' },
    { id: 'ub-203x133', label: 'UB 203×133×25' },
    { id: 'ub-254x146', label: 'UB 254×146×31' },
    { id: 'ub-305x165', label: 'UB 305×165×40' },
    { id: 'ub-356x171', label: 'UB 356×171×45' },
    { id: 'ub-406x178', label: 'UB 406×178×54' },
    { id: 'rsj-custom', label: 'RSJ (Custom Size)' },
  ];

  const lintelTypes = [
    { id: 'concrete-lintel-100', label: 'Concrete Lintel 100mm' },
    { id: 'concrete-lintel-140', label: 'Concrete Lintel 140mm' },
    { id: 'concrete-lintel-150', label: 'Concrete Lintel 150mm' },
    { id: 'steel-lintel-catnic', label: 'Steel Lintel (Catnic)' },
    { id: 'steel-lintel-ig', label: 'Steel Lintel (IG)' },
    { id: 'steel-lintel-other', label: 'Steel Lintel (Other)' },
    { id: 'stone-lintel', label: 'Stone Lintel' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Structural - Steels and Lintels"
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
        {/* Knock-Through Steel (New Opening) */}
        {knockThroughSupport === 'steel' && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-4">Knock-Through Steel (New Opening)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Steel Type *</label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                  value={formData.knockThroughSteelType || ''}
                  onChange={(e) => setFormData({ ...formData, knockThroughSteelType: e.target.value })}
                >
                  <option value="">Select steel type...</option>
                  {steelTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Steel Length (m) *"
                type="number"
                value={formData.knockThroughSteelLength?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughSteelLength: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Auto-calculated: width + 0.3m"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Steel Posts"
                  type="number"
                  value={formData.knockThroughSteelPosts?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, knockThroughSteelPosts: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Number of posts"
                />
                <Input
                  label="Steel Connections"
                  type="number"
                  value={formData.knockThroughSteelConnections?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, knockThroughSteelConnections: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Number of connections"
                />
              </div>
              <Input
                label="Other Steel Consumables"
                value={formData.knockThroughSteelOther || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughSteelOther: e.target.value })}
                placeholder="e.g., bolts, plates, brackets"
              />
            </div>
          </div>
        )}

        {/* Knock-Through Lintel (New Opening) */}
        {knockThroughSupport === 'lintel' && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-4">Knock-Through Lintel (New Opening)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Lintel Type *</label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                  value={formData.knockThroughLintelType || ''}
                  onChange={(e) => setFormData({ ...formData, knockThroughLintelType: e.target.value })}
                >
                  <option value="">Select lintel type...</option>
                  {lintelTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Lintel Length (m) *"
                type="number"
                value={formData.knockThroughLintelLength?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughLintelLength: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Auto-calculated: width + 0.3m"
              />
              <Input
                label="Padstones Required"
                type="number"
                value={formData.knockThroughLintelPadstones?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughLintelPadstones: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Number of padstones"
              />
              <Input
                label="Other Lintel Consumables"
                value={formData.knockThroughLintelOther || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughLintelOther: e.target.value })}
                placeholder="e.g., mortar, pointing"
              />
            </div>
          </div>
        )}

        {/* Knock-Through Steel (Existing Opening) */}
        {knockThroughSupportExisting === 'steel' && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-4">Knock-Through Steel (Existing Opening)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Steel Type *</label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                  value={formData.knockThroughSteelTypeExisting || ''}
                  onChange={(e) => setFormData({ ...formData, knockThroughSteelTypeExisting: e.target.value })}
                >
                  <option value="">Select steel type...</option>
                  {steelTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Steel Length (m) *"
                type="number"
                value={formData.knockThroughSteelLengthExisting?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughSteelLengthExisting: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Auto-calculated: width + 0.3m"
              />
            </div>
          </div>
        )}

        {/* Knock-Through Lintel (Existing Opening) */}
        {knockThroughSupportExisting === 'lintel' && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-4">Knock-Through Lintel (Existing Opening)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Lintel Type *</label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                  value={formData.knockThroughLintelTypeExisting || ''}
                  onChange={(e) => setFormData({ ...formData, knockThroughLintelTypeExisting: e.target.value })}
                >
                  <option value="">Select lintel type...</option>
                  {lintelTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Lintel Length (m) *"
                type="number"
                value={formData.knockThroughLintelLengthExisting?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, knockThroughLintelLengthExisting: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Auto-calculated: width + 0.3m"
              />
            </div>
          </div>
        )}

        {/* Other Steels and Lintels */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Other Steels and Lintels</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'steel-beam-other', label: 'Steel Beam - Other' },
              { id: 'lintel-other', label: 'Lintel - Other' },
              { id: 'rsj', label: 'RSJ (Rolled Steel Joist)' },
              { id: 'structural-steelwork', label: 'Structural Steelwork' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.otherSteelsLintels?.includes(option.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => toggleOtherSteel(option.id)}
              >
                <CardContent className="p-3">
                  <div className="font-medium text-sm">{option.label}</div>
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
            placeholder="Any additional notes about steels and lintels..."
          />
        </div>
      </div>
    </Modal>
  );
}
