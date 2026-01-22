import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface ProfessionalServicesProperties {
  planningRequired?: string;
  planningApplicationFee?: number;
  planningConsultantFee?: number;
  buildingControlRequired?: string;
  buildingControlType?: string;
  buildingControlApplicationFee?: number;
  buildingControlInspectionFee?: number;
  structuralEngineerRequired?: string;
  structuralEngineerFee?: number;
  partyWallRequired?: string;
  partyWallSurveyorFee?: number;
  partyWallNeighborSurveyorFee?: number;
  architectRequired?: string;
  architectFee?: number;
  otherProfessionalServices?: string;
  otherProfessionalServicesFee?: number;
  notes?: string;
}

interface ProfessionalServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: ProfessionalServicesProperties | undefined;
  onSave: (properties: ProfessionalServicesProperties) => void;
}

export function ProfessionalServicesModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: ProfessionalServicesModalProps) {
  const [formData, setFormData] = useState<ProfessionalServicesProperties>({
    planningRequired: '',
    planningApplicationFee: undefined,
    planningConsultantFee: undefined,
    buildingControlRequired: '',
    buildingControlType: '',
    buildingControlApplicationFee: undefined,
    buildingControlInspectionFee: undefined,
    structuralEngineerRequired: '',
    structuralEngineerFee: undefined,
    partyWallRequired: '',
    partyWallSurveyorFee: undefined,
    partyWallNeighborSurveyorFee: undefined,
    architectRequired: '',
    architectFee: undefined,
    otherProfessionalServices: '',
    otherProfessionalServicesFee: undefined,
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
      title="Professional Services"
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
        {/* Planning Permission */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Planning Permission</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Planning Permission Required? *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'yes', label: 'Yes' },
                  { id: 'no', label: 'No' },
                  { id: 'obtained', label: 'Already Obtained' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.planningRequired === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, planningRequired: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-center">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {formData.planningRequired === 'yes' && (
              <div className="space-y-3 pl-4 border-l-2 border-primary-200">
                <Input
                  label="Planning Application Fee (£)"
                  type="number"
                  value={formData.planningApplicationFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, planningApplicationFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 206"
                />
                <Input
                  label="Planning Consultant Fee (£)"
                  type="number"
                  value={formData.planningConsultantFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, planningConsultantFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Building Control */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Building Control</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Building Control Required? *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'yes', label: 'Yes' },
                  { id: 'no', label: 'No' },
                  { id: 'obtained', label: 'Already Obtained' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.buildingControlRequired === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, buildingControlRequired: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-center">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {formData.buildingControlRequired === 'yes' && (
              <div className="space-y-3 pl-4 border-l-2 border-primary-200">
                <div>
                  <label className="text-sm font-medium mb-2 block">Building Control Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'local-authority', label: 'Local Authority' },
                      { id: 'private', label: 'Private Approved Inspector' },
                    ].map((option) => (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-all ${
                          formData.buildingControlType === option.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => setFormData({ ...formData, buildingControlType: option.id })}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium text-sm text-center">{option.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <Input
                  label="Building Control Application Fee (£)"
                  type="number"
                  value={formData.buildingControlApplicationFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, buildingControlApplicationFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 500"
                />
                <Input
                  label="Building Control Inspection Fee (£)"
                  type="number"
                  value={formData.buildingControlInspectionFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, buildingControlInspectionFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Structural Engineer */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Structural Engineer</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Structural Engineer Required? *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'yes', label: 'Yes' },
                  { id: 'no', label: 'No' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.structuralEngineerRequired === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, structuralEngineerRequired: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-center">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {formData.structuralEngineerRequired === 'yes' && (
              <div className="pl-4 border-l-2 border-primary-200">
                <Input
                  label="Structural Engineer Fee (£)"
                  type="number"
                  value={formData.structuralEngineerFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, structuralEngineerFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Party Wall */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Party Wall Agreement</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Party Wall Agreement Required? *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'yes', label: 'Yes' },
                  { id: 'no', label: 'No' },
                  { id: 'obtained', label: 'Already Obtained' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.partyWallRequired === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, partyWallRequired: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-center">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {formData.partyWallRequired === 'yes' && (
              <div className="space-y-3 pl-4 border-l-2 border-primary-200">
                <Input
                  label="Party Wall Surveyor Fee (£)"
                  type="number"
                  value={formData.partyWallSurveyorFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, partyWallSurveyorFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 600"
                />
                <Input
                  label="Neighbor's Surveyor Fee (£)"
                  type="number"
                  value={formData.partyWallNeighborSurveyorFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, partyWallNeighborSurveyorFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Architect/Designer */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold mb-4">Architect/Designer</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Architect/Designer Required? *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'yes', label: 'Yes' },
                  { id: 'no', label: 'No' },
                ].map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all ${
                      formData.architectRequired === option.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, architectRequired: option.id })}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-center">{option.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {formData.architectRequired === 'yes' && (
              <div className="pl-4 border-l-2 border-primary-200">
                <Input
                  label="Architect/Designer Fee (£)"
                  type="number"
                  value={formData.architectFee?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, architectFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 2000"
                />
              </div>
            )}
          </div>
        </div>

        {/* Other Professional Services */}
        <div className="pb-4">
          <h3 className="text-sm font-semibold mb-4">Other Professional Services</h3>
          <div className="space-y-3">
            <Input
              label="Other Services Description"
              value={formData.otherProfessionalServices || ''}
              onChange={(e) => setFormData({ ...formData, otherProfessionalServices: e.target.value })}
              placeholder="e.g., Quantity surveyor, energy assessor, arboriculturist"
            />
            {formData.otherProfessionalServices && (
              <Input
                label="Other Services Fee (£)"
                type="number"
                value={formData.otherProfessionalServicesFee?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, otherProfessionalServicesFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 500"
              />
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Additional Notes</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional notes about professional services..."
          />
        </div>
      </div>
    </Modal>
  );
}
