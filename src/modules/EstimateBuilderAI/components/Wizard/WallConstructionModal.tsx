import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { QuestionBlock } from './QuestionBlock';

export interface WallConstructionProperties {
  wallConstructionType?: string;
  cavitySize?: number;
  cavityType?: string;
  wallInsulationThickness?: number;
  residualCavity?: number;
  wallInsulationType?: string;
  timberFrameInsulationType?: string;
  timberFrameInsulationThickness?: number;
  notes?: string;
}

interface WallConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: WallConstructionProperties | undefined;
  onSave: (properties: WallConstructionProperties) => void;
  answers: Record<string, any>;
}

export function WallConstructionModal({
  isOpen,
  onClose,
  properties,
  onSave,
  answers,
}: WallConstructionModalProps) {
  const [formData, setFormData] = useState<WallConstructionProperties>({
    wallConstructionType: '',
    cavitySize: undefined,
    cavityType: '',
    wallInsulationThickness: undefined,
    residualCavity: undefined,
    wallInsulationType: '',
    timberFrameInsulationType: '',
    timberFrameInsulationThickness: undefined,
    notes: '',
  });

  useEffect(() => {
    if (properties) {
      setFormData(properties);
    } else {
      // Initialize from answers if available
      setFormData({
        wallConstructionType: answers.wallConstructionType || '',
        cavitySize: answers.cavitySize,
        cavityType: answers.cavityType || '',
        wallInsulationThickness: answers.wallInsulationThickness,
        residualCavity: answers.residualCavity,
        wallInsulationType: answers.wallInsulationType || '',
        timberFrameInsulationType: answers.timberFrameInsulationType || '',
        timberFrameInsulationThickness: answers.timberFrameInsulationThickness,
        notes: answers.wallConstructionNotes || '',
      });
    }
  }, [properties, answers]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isCavityWall = formData.wallConstructionType === 'brick-and-block' || formData.wallConstructionType === 'block-and-block';
  const isTimberFrame = formData.wallConstructionType === 'timber-frame-facing-brick' || formData.wallConstructionType === 'timber-frame-block';
  const showInsulationFields = formData.cavityType === 'full-fill' || formData.cavityType === 'partial-fill';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wall Construction"
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
        {/* Wall Construction Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Wall Construction Type *</label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'brick-and-block', label: 'Brick and Block', desc: 'Facing brick external, block internal with cavity' },
              { id: 'block-and-block', label: 'Block and Block', desc: 'Block external, block internal with cavity' },
              { id: 'timber-frame-facing-brick', label: 'Timber Frame - Facing Brick', desc: 'Timber frame with facing brick external' },
              { id: 'timber-frame-block', label: 'Timber Frame - Block', desc: 'Timber frame with block external' },
            ].map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  formData.wallConstructionType === option.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setFormData({ ...formData, wallConstructionType: option.id })}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cavity Details - Only for Brick/Block */}
        {isCavityWall && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Cavity Details</h3>
            
            <Input
              label="Cavity Size (mm)"
              type="number"
              value={formData.cavitySize?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, cavitySize: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 100, 120, 150"
            />

            {formData.cavitySize && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cavity Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'full-fill', label: 'Full Fill', desc: 'Cavity fully filled (5-10mm residual)' },
                      { id: 'partial-fill', label: 'Partial Fill', desc: 'Partial fill with residual cavity' },
                      { id: 'empty', label: 'Empty', desc: 'No insulation' },
                    ].map((option) => (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-all ${
                          formData.cavityType === option.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, cavityType: option.id })}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {showInsulationFields && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold">Insulation Details</h4>
                    
                    <Input
                      label="Insulation Thickness (mm)"
                      type="number"
                      value={formData.wallInsulationThickness?.toString() || ''}
                      onChange={(e) => setFormData({ ...formData, wallInsulationThickness: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder={`e.g., ${formData.cavitySize ? formData.cavitySize - 10 : 90}mm`}
                    />

                    {formData.cavityType === 'partial-fill' && (
                      <Input
                        label="Residual Cavity (mm)"
                        type="number"
                        value={formData.residualCavity?.toString() || ''}
                        onChange={(e) => setFormData({ ...formData, residualCavity: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="e.g., 10, 15, 20"
                      />
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">Insulation Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'mineral-wool', label: 'Mineral Wool' },
                          { id: 'rigid-board', label: 'Rigid Board (PIR/PUR)' },
                          { id: 'blown-beads', label: 'Blown Beads (EPS)' },
                          { id: 'phenolic-foam', label: 'Phenolic Foam' },
                        ].map((option) => (
                          <Card
                            key={option.id}
                            className={`cursor-pointer transition-all ${
                              formData.wallInsulationType === option.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'hover:border-gray-400'
                            }`}
                            onClick={() => setFormData({ ...formData, wallInsulationType: option.id })}
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
              </>
            )}
          </div>
        )}

        {/* Timber Frame Insulation */}
        {isTimberFrame && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Timber Frame Insulation</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Insulation Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'between-stud', label: 'Between Studs' },
                  { id: 'external-board', label: 'External Board' },
                  { id: 'internal-board', label: 'Internal Board' },
                  { id: 'hybrid', label: 'Hybrid' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.timberFrameInsulationType === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, timberFrameInsulationType: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Input
              label="Insulation Thickness (mm)"
              type="number"
              value={formData.timberFrameInsulationThickness?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, timberFrameInsulationThickness: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="e.g., 100, 150, 200"
            />
          </div>
        )}

        {/* Notes */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about wall construction..."
          />
        </div>
      </div>
    </Modal>
  );
}
