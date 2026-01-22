import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface FasciaSoffitRainwaterProperties {
  soffitOverhang?: number;
  rakeOverhang?: number;
  fasciaType?: string;
  fasciaDepth?: number;
  soffitType?: string;
  bargeboardType?: string;
  gutterType?: string;
  gutterSize?: string;
  downpipeType?: string;
  downpipeSize?: string;
  rainwaterGoodsOther?: string;
  notes?: string;
}

interface FasciaSoffitRainwaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: FasciaSoffitRainwaterProperties | undefined;
  onSave: (properties: FasciaSoffitRainwaterProperties) => void;
  roofType?: string;
}

export function FasciaSoffitRainwaterModal({
  isOpen,
  onClose,
  properties,
  onSave,
  roofType,
}: FasciaSoffitRainwaterModalProps) {
  const [formData, setFormData] = useState<FasciaSoffitRainwaterProperties>({
    soffitOverhang: undefined,
    rakeOverhang: undefined,
    fasciaType: '',
    fasciaDepth: undefined,
    soffitType: '',
    bargeboardType: '',
    gutterType: '',
    gutterSize: '',
    downpipeType: '',
    downpipeSize: '',
    rainwaterGoodsOther: '',
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

  const isPitched = roofType === 'pitched';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fascia, Soffit & Rainwater Goods"
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
        {/* Overhangs */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Roof Overhangs</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Soffit Overhang (mm)"
              type="number"
              value={formData.soffitOverhang?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, soffitOverhang: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 200"
            />
            {isPitched && (
              <Input
                label="Rake Overhang (mm)"
                type="number"
                value={formData.rakeOverhang?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, rakeOverhang: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 200"
              />
            )}
          </div>
        </div>

        {/* Fascia */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Fascia</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Fascia Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'softwood-fascia', label: 'Softwood Fascia' },
                  { id: 'hardwood-fascia', label: 'Hardwood Fascia' },
                  { id: 'upvc-fascia', label: 'UPVC Fascia' },
                  { id: 'composite-fascia', label: 'Composite Fascia' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.fasciaType === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, fasciaType: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <Input
              label="Fascia Depth (mm)"
              type="number"
              value={formData.fasciaDepth?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, fasciaDepth: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 150, 200, 225"
            />
          </div>
        </div>

        {/* Soffit */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Soffit</h3>
          <div>
            <label className="text-sm font-medium mb-2 block">Soffit Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'softwood-soffit', label: 'Softwood Soffit' },
                { id: 'hardwood-soffit', label: 'Hardwood Soffit' },
                { id: 'upvc-soffit', label: 'UPVC Soffit' },
                { id: 'composite-soffit', label: 'Composite Soffit' },
                { id: 'vented-soffit', label: 'Vented Soffit' },
              ].map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    formData.soffitType === option.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setFormData({ ...formData, soffitType: option.id })}
                >
                  <CardContent className="p-3">
                    <div className="font-medium text-sm">{option.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bargeboard (Pitched only) */}
        {isPitched && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold mb-4">Bargeboard</h3>
            <div>
              <label className="text-sm font-medium mb-2 block">Bargeboard Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'softwood-bargeboard', label: 'Softwood Bargeboard' },
                  { id: 'hardwood-bargeboard', label: 'Hardwood Bargeboard' },
                  { id: 'upvc-bargeboard', label: 'UPVC Bargeboard' },
                  { id: 'composite-bargeboard', label: 'Composite Bargeboard' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.bargeboardType === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, bargeboardType: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Guttering */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Guttering</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Gutter Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'half-round-pvc', label: 'Half Round PVC' },
                  { id: 'squareline-pvc', label: 'Squareline PVC' },
                  { id: 'deepflow-pvc', label: 'Deepflow PVC' },
                  { id: 'cast-iron', label: 'Cast Iron' },
                  { id: 'aluminum', label: 'Aluminum' },
                  { id: 'copper', label: 'Copper' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.gutterType === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, gutterType: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Gutter Size</label>
              <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                value={formData.gutterSize || ''}
                onChange={(e) => setFormData({ ...formData, gutterSize: e.target.value })}
              >
                <option value="">Select size...</option>
                <option value="112mm">112mm (Standard)</option>
                <option value="125mm">125mm</option>
                <option value="150mm">150mm (Deepflow)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Downpipes */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Downpipes</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Downpipe Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'round-pvc', label: 'Round PVC' },
                  { id: 'square-pvc', label: 'Square PVC' },
                  { id: 'cast-iron', label: 'Cast Iron' },
                  { id: 'aluminum', label: 'Aluminum' },
                  { id: 'copper', label: 'Copper' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.downpipeType === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, downpipeType: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Downpipe Size</label>
              <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                value={formData.downpipeSize || ''}
                onChange={(e) => setFormData({ ...formData, downpipeSize: e.target.value })}
              >
                <option value="">Select size...</option>
                <option value="68mm">68mm (Standard)</option>
                <option value="82mm">82mm</option>
                <option value="110mm">110mm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Other Rainwater Goods */}
        <div className="pb-4">
          <Input
            label="Other Rainwater Goods"
            value={formData.rainwaterGoodsOther || ''}
            onChange={(e) => setFormData({ ...formData, rainwaterGoodsOther: e.target.value })}
            placeholder="e.g., hoppers, brackets, stop ends, angles"
          />
        </div>

        {/* Notes */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about fascia, soffit, and rainwater goods..."
          />
        </div>
      </div>
    </Modal>
  );
}
