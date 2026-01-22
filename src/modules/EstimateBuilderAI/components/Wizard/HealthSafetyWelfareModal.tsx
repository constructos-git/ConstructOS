// Health & Safety & Welfare Modal Component - UK HSE Compliant

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

export interface HealthSafetyWelfareProperties {
  // Site Setup
  siteSetupCost?: number;
  siteSetupNotes?: string;
  
  // First Aid
  firstAidKitRequired?: boolean;
  firstAidKitCost?: number;
  firstAidKitType?: string; // e.g., 'basic', 'standard', 'comprehensive'
  firstAidTrainingRequired?: boolean;
  firstAidTrainingCost?: number;
  firstAidPersonnel?: number; // Number of trained first aiders
  
  // Welfare Facilities
  welfareUnitRequired?: boolean;
  welfareUnitCost?: number;
  welfareUnitType?: string; // e.g., 'basic', 'standard', 'luxury'
  toiletFacilities?: string; // e.g., 'portable', 'fixed', 'existing'
  toiletFacilitiesCost?: number;
  handWashingFacilities?: boolean;
  handWashingCost?: number;
  drinkingWater?: boolean;
  drinkingWaterCost?: number;
  restArea?: boolean;
  restAreaCost?: number;
  dryingRoom?: boolean;
  dryingRoomCost?: number;
  
  // Safety Equipment
  safetySignage?: boolean;
  safetySignageCost?: number;
  personalProtectiveEquipment?: boolean;
  ppeCost?: number;
  fireSafetyEquipment?: boolean;
  fireSafetyCost?: number;
  emergencyProcedures?: boolean;
  emergencyProceduresCost?: number;
  
  // Site Security
  siteSecurity?: boolean;
  siteSecurityCost?: number;
  siteSecurityType?: string; // e.g., 'fencing', 'hoarding', 'cctv', 'security guard'
  
  // Risk Assessment & Method Statements
  riskAssessmentRequired?: boolean;
  riskAssessmentCost?: number;
  methodStatementsRequired?: boolean;
  methodStatementsCost?: number;
  
  // Additional Costs
  additionalCosts?: number;
  additionalCostsNotes?: string;
  
  // Notes
  notes?: string;
}

interface HealthSafetyWelfareModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: HealthSafetyWelfareProperties;
  onSave: (properties: HealthSafetyWelfareProperties) => void;
}

const FIRST_AID_KIT_TYPES = [
  'Basic (10 person)',
  'Standard (20 person)',
  'Comprehensive (50+ person)',
  'Vehicle First Aid Kit',
];

const WELFARE_UNIT_TYPES = [
  'Basic (toilet only)',
  'Standard (toilet + hand wash)',
  'Comprehensive (toilet + hand wash + rest area)',
  'Luxury (full facilities)',
];

const TOILET_FACILITIES_OPTIONS = [
  'Portable toilet',
  'Fixed toilet',
  'Existing facilities',
  'Multiple portable units',
];

const SITE_SECURITY_TYPES = [
  'Site fencing',
  'Hoarding',
  'CCTV system',
  'Security guard',
  'Combination',
];

export function HealthSafetyWelfareModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: HealthSafetyWelfareModalProps) {
  const [localProperties, setLocalProperties] = useState<HealthSafetyWelfareProperties>(properties);

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localProperties);
    onClose();
  };

  const handleCancel = () => {
    setLocalProperties(properties);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pt-16 pb-4 px-4">
      <Card className="w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl">Health & Safety & Welfare</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Setup Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Site Setup</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="siteSetupCost" className="text-sm font-medium">Site Setup Cost (£)</label>
                  <Tooltip content="Initial site setup costs including site establishment, temporary services, etc.">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="siteSetupCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={localProperties.siteSetupCost || ''}
                  onChange={(e) => setLocalProperties({ 
                    ...localProperties, 
                    siteSetupCost: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="siteSetupNotes" className="text-sm font-medium">Site Setup Notes</label>
                <textarea
                  id="siteSetupNotes"
                  value={localProperties.siteSetupNotes || ''}
                  onChange={(e) => setLocalProperties({ ...localProperties, siteSetupNotes: e.target.value })}
                  placeholder="Details about site setup requirements"
                  className="w-full min-h-[60px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* First Aid Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">First Aid (HSE Compliant)</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="firstAidKitRequired"
                  checked={localProperties.firstAidKitRequired || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, firstAidKitRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="firstAidKitRequired" className="text-sm font-medium">First Aid Kit Required</label>
                <Tooltip content="HSE requires first aid kits on all construction sites">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.firstAidKitRequired && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="firstAidKitType" className="text-sm font-medium">First Aid Kit Type</label>
                    <select
                      id="firstAidKitType"
                      value={localProperties.firstAidKitType || ''}
                      onChange={(e) => setLocalProperties({ ...localProperties, firstAidKitType: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select type...</option>
                      {FIRST_AID_KIT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="firstAidKitCost" className="text-sm font-medium">First Aid Kit Cost (£)</label>
                    <Input
                      id="firstAidKitCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localProperties.firstAidKitCost || ''}
                      onChange={(e) => setLocalProperties({ 
                        ...localProperties, 
                        firstAidKitCost: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="firstAidTrainingRequired"
                  checked={localProperties.firstAidTrainingRequired || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, firstAidTrainingRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="firstAidTrainingRequired" className="text-sm font-medium">First Aid Training Required</label>
                <Tooltip content="HSE requires trained first aiders on site (1 per 50 workers or part thereof)">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.firstAidTrainingRequired && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="firstAidPersonnel" className="text-sm font-medium">Number of Trained First Aiders</label>
                    <Input
                      id="firstAidPersonnel"
                      type="number"
                      min="1"
                      value={localProperties.firstAidPersonnel || ''}
                      onChange={(e) => setLocalProperties({ 
                        ...localProperties, 
                        firstAidPersonnel: e.target.value ? parseInt(e.target.value, 10) : undefined 
                      })}
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="firstAidTrainingCost" className="text-sm font-medium">First Aid Training Cost (£)</label>
                    <Input
                      id="firstAidTrainingCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localProperties.firstAidTrainingCost || ''}
                      onChange={(e) => setLocalProperties({ 
                        ...localProperties, 
                        firstAidTrainingCost: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Welfare Facilities Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Welfare Facilities (HSE Compliant)</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="welfareUnitRequired"
                  checked={localProperties.welfareUnitRequired || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, welfareUnitRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="welfareUnitRequired" className="text-sm font-medium">Welfare Unit Required</label>
                <Tooltip content="HSE requires adequate welfare facilities on construction sites">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.welfareUnitRequired && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="welfareUnitType" className="text-sm font-medium">Welfare Unit Type</label>
                    <select
                      id="welfareUnitType"
                      value={localProperties.welfareUnitType || ''}
                      onChange={(e) => setLocalProperties({ ...localProperties, welfareUnitType: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select type...</option>
                      {WELFARE_UNIT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="welfareUnitCost" className="text-sm font-medium">Welfare Unit Cost (£)</label>
                    <Input
                      id="welfareUnitCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localProperties.welfareUnitCost || ''}
                      onChange={(e) => setLocalProperties({ 
                        ...localProperties, 
                        welfareUnitCost: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label htmlFor="toiletFacilities" className="text-sm font-medium">Toilet Facilities</label>
                <select
                  id="toiletFacilities"
                  value={localProperties.toiletFacilities || ''}
                  onChange={(e) => setLocalProperties({ ...localProperties, toiletFacilities: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select option...</option>
                  {TOILET_FACILITIES_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {localProperties.toiletFacilities && (
                <div className="space-y-2">
                  <label htmlFor="toiletFacilitiesCost" className="text-sm font-medium">Toilet Facilities Cost (£)</label>
                  <Input
                    id="toiletFacilitiesCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.toiletFacilitiesCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      toiletFacilitiesCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="handWashingFacilities"
                  checked={localProperties.handWashingFacilities || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, handWashingFacilities: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="handWashingFacilities" className="text-sm font-medium">Hand Washing Facilities</label>
                <Tooltip content="HSE requires adequate hand washing facilities">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.handWashingFacilities && (
                <div className="space-y-2">
                  <label htmlFor="handWashingCost" className="text-sm font-medium">Hand Washing Facilities Cost (£)</label>
                  <Input
                    id="handWashingCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.handWashingCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      handWashingCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="drinkingWater"
                  checked={localProperties.drinkingWater || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, drinkingWater: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="drinkingWater" className="text-sm font-medium">Drinking Water</label>
                <Tooltip content="HSE requires adequate supply of drinking water">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.drinkingWater && (
                <div className="space-y-2">
                  <label htmlFor="drinkingWaterCost" className="text-sm font-medium">Drinking Water Cost (£)</label>
                  <Input
                    id="drinkingWaterCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.drinkingWaterCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      drinkingWaterCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="restArea"
                  checked={localProperties.restArea || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, restArea: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="restArea" className="text-sm font-medium">Rest Area</label>
                <Tooltip content="HSE requires adequate rest facilities">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.restArea && (
                <div className="space-y-2">
                  <label htmlFor="restAreaCost" className="text-sm font-medium">Rest Area Cost (£)</label>
                  <Input
                    id="restAreaCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.restAreaCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      restAreaCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dryingRoom"
                  checked={localProperties.dryingRoom || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, dryingRoom: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="dryingRoom" className="text-sm font-medium">Drying Room</label>
                <Tooltip content="Required for wet work or outdoor work in adverse weather">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.dryingRoom && (
                <div className="space-y-2">
                  <label htmlFor="dryingRoomCost" className="text-sm font-medium">Drying Room Cost (£)</label>
                  <Input
                    id="dryingRoomCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.dryingRoomCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      dryingRoomCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Safety Equipment Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Safety Equipment</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="safetySignage"
                  checked={localProperties.safetySignage || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, safetySignage: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="safetySignage" className="text-sm font-medium">Safety Signage</label>
                <Tooltip content="Required safety signage for construction sites">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.safetySignage && (
                <div className="space-y-2">
                  <label htmlFor="safetySignageCost" className="text-sm font-medium">Safety Signage Cost (£)</label>
                  <Input
                    id="safetySignageCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.safetySignageCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      safetySignageCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="personalProtectiveEquipment"
                  checked={localProperties.personalProtectiveEquipment || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, personalProtectiveEquipment: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="personalProtectiveEquipment" className="text-sm font-medium">Personal Protective Equipment (PPE)</label>
                <Tooltip content="PPE required for site workers">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.personalProtectiveEquipment && (
                <div className="space-y-2">
                  <label htmlFor="ppeCost" className="text-sm font-medium">PPE Cost (£)</label>
                  <Input
                    id="ppeCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.ppeCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      ppeCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fireSafetyEquipment"
                  checked={localProperties.fireSafetyEquipment || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, fireSafetyEquipment: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="fireSafetyEquipment" className="text-sm font-medium">Fire Safety Equipment</label>
                <Tooltip content="Fire extinguishers, alarms, and other fire safety equipment">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.fireSafetyEquipment && (
                <div className="space-y-2">
                  <label htmlFor="fireSafetyCost" className="text-sm font-medium">Fire Safety Equipment Cost (£)</label>
                  <Input
                    id="fireSafetyCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.fireSafetyCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      fireSafetyCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emergencyProcedures"
                  checked={localProperties.emergencyProcedures || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, emergencyProcedures: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="emergencyProcedures" className="text-sm font-medium">Emergency Procedures</label>
                <Tooltip content="Emergency procedures, evacuation plans, and related costs">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.emergencyProcedures && (
                <div className="space-y-2">
                  <label htmlFor="emergencyProceduresCost" className="text-sm font-medium">Emergency Procedures Cost (£)</label>
                  <Input
                    id="emergencyProceduresCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.emergencyProceduresCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      emergencyProceduresCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Site Security Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Site Security</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="siteSecurity"
                  checked={localProperties.siteSecurity || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, siteSecurity: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="siteSecurity" className="text-sm font-medium">Site Security Required</label>
                <Tooltip content="Site security measures to protect the site and equipment">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.siteSecurity && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="siteSecurityType" className="text-sm font-medium">Security Type</label>
                    <select
                      id="siteSecurityType"
                      value={localProperties.siteSecurityType || ''}
                      onChange={(e) => setLocalProperties({ ...localProperties, siteSecurityType: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select type...</option>
                      {SITE_SECURITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="siteSecurityCost" className="text-sm font-medium">Site Security Cost (£)</label>
                    <Input
                      id="siteSecurityCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={localProperties.siteSecurityCost || ''}
                      onChange={(e) => setLocalProperties({ 
                        ...localProperties, 
                        siteSecurityCost: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Risk Assessment & Method Statements Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Risk Assessment & Method Statements</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="riskAssessmentRequired"
                  checked={localProperties.riskAssessmentRequired || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, riskAssessmentRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="riskAssessmentRequired" className="text-sm font-medium">Risk Assessment Required</label>
                <Tooltip content="HSE requires risk assessments for all construction activities">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.riskAssessmentRequired && (
                <div className="space-y-2">
                  <label htmlFor="riskAssessmentCost" className="text-sm font-medium">Risk Assessment Cost (£)</label>
                  <Input
                    id="riskAssessmentCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.riskAssessmentCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      riskAssessmentCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="methodStatementsRequired"
                  checked={localProperties.methodStatementsRequired || false}
                  onChange={(e) => setLocalProperties({ ...localProperties, methodStatementsRequired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="methodStatementsRequired" className="text-sm font-medium">Method Statements Required</label>
                <Tooltip content="Method statements detailing how work will be carried out safely">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              {localProperties.methodStatementsRequired && (
                <div className="space-y-2">
                  <label htmlFor="methodStatementsCost" className="text-sm font-medium">Method Statements Cost (£)</label>
                  <Input
                    id="methodStatementsCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={localProperties.methodStatementsCost || ''}
                    onChange={(e) => setLocalProperties({ 
                      ...localProperties, 
                      methodStatementsCost: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Costs Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Additional Costs</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="additionalCosts" className="text-sm font-medium">Additional Costs (£)</label>
                <Input
                  id="additionalCosts"
                  type="number"
                  step="0.01"
                  min="0"
                  value={localProperties.additionalCosts || ''}
                  onChange={(e) => setLocalProperties({ 
                    ...localProperties, 
                    additionalCosts: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="additionalCostsNotes" className="text-sm font-medium">Additional Costs Notes</label>
                <textarea
                  id="additionalCostsNotes"
                  value={localProperties.additionalCostsNotes || ''}
                  onChange={(e) => setLocalProperties({ ...localProperties, additionalCostsNotes: e.target.value })}
                  placeholder="Details about additional costs"
                  className="w-full min-h-[60px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-2 border-t">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="notes" className="text-sm font-medium">Additional Notes</label>
                <Tooltip content="Any additional notes about health, safety, and welfare requirements">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <textarea
                id="notes"
                value={localProperties.notes || ''}
                onChange={(e) => setLocalProperties({ ...localProperties, notes: e.target.value })}
                placeholder="Any additional notes or information"
                className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
