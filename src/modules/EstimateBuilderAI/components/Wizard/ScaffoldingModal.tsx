// Scaffolding Modal Component

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

export interface ScaffoldingProperties {
  scaffoldingType?: string; // e.g., 'standard', 'tower', 'mobile', 'none'
  height?: number; // Height in meters
  length?: number; // Length in meters
  width?: number; // Width in meters
  levels?: number; // Number of levels/floors
  accessRequirements?: string; // Access requirements
  specialRequirements?: string; // Special requirements (e.g., cantilever, bridge, etc.)
  duration?: number; // Duration in weeks
  notes?: string;
}

interface ScaffoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: ScaffoldingProperties;
  onSave: (properties: ScaffoldingProperties) => void;
}

const SCAFFOLDING_TYPES = [
  'Standard Independent',
  'Standard Tied',
  'Tower Scaffold',
  'Mobile Scaffold',
  'Cantilever',
  'Birdcage',
  'Staircase',
  'Bridge',
  'None Required',
];

const ACCESS_REQUIREMENTS_OPTIONS = [
  'Standard ladder access',
  'Staircase access',
  'Hoist access required',
  'Crane access required',
  'No special access',
];

const SPECIAL_REQUIREMENTS_OPTIONS = [
  'Cantilever section',
  'Bridge section',
  'Overhead protection',
  'Debris netting',
  'Weather protection',
  'Lighting included',
  'Signage included',
  'Edge protection only',
];

export function ScaffoldingModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: ScaffoldingModalProps) {
  const [localProperties, setLocalProperties] = useState<ScaffoldingProperties>(properties);

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
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl">Scaffolding Configuration</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scaffolding Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="scaffoldingType" className="text-sm font-medium">Scaffolding Type</label>
              <Tooltip content="Select the type of scaffolding required for the project">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <select
              id="scaffoldingType"
              value={localProperties.scaffoldingType || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, scaffoldingType: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select scaffolding type...</option>
              {SCAFFOLDING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="height" className="text-sm font-medium">Height (m)</label>
                <Tooltip content="Maximum height of scaffolding in meters">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={localProperties.height || ''}
                onChange={(e) => setLocalProperties({ 
                  ...localProperties, 
                  height: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="e.g., 3.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="length" className="text-sm font-medium">Length (m)</label>
                <Tooltip content="Length of scaffolding in meters">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="length"
                type="number"
                step="0.1"
                min="0"
                value={localProperties.length || ''}
                onChange={(e) => setLocalProperties({ 
                  ...localProperties, 
                  length: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="e.g., 8.0"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="width" className="text-sm font-medium">Width (m)</label>
                <Tooltip content="Width of scaffolding in meters">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0"
                value={localProperties.width || ''}
                onChange={(e) => setLocalProperties({ 
                  ...localProperties, 
                  width: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="e.g., 1.2"
              />
            </div>
          </div>

          {/* Levels */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="levels" className="text-sm font-medium">Number of Levels</label>
              <Tooltip content="Number of working levels/floors">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="levels"
              type="number"
              min="1"
              value={localProperties.levels || ''}
              onChange={(e) => setLocalProperties({ 
                ...localProperties, 
                levels: e.target.value ? parseInt(e.target.value, 10) : undefined 
              })}
              placeholder="e.g., 2"
            />
          </div>

          {/* Access Requirements */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="accessRequirements" className="text-sm font-medium">Access Requirements</label>
              <Tooltip content="Special access requirements for the scaffolding">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <select
              id="accessRequirements"
              value={localProperties.accessRequirements || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, accessRequirements: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select access requirement...</option>
              {ACCESS_REQUIREMENTS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="specialRequirements" className="text-sm font-medium">Special Requirements</label>
              <Tooltip content="Any special requirements or features for the scaffolding">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <select
              id="specialRequirements"
              value={localProperties.specialRequirements || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, specialRequirements: e.target.value })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select special requirement...</option>
              {SPECIAL_REQUIREMENTS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="duration" className="text-sm font-medium">Duration (weeks)</label>
              <Tooltip content="Expected duration scaffolding will be required in weeks">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="duration"
              type="number"
              step="0.5"
              min="0"
              value={localProperties.duration || ''}
              onChange={(e) => setLocalProperties({ 
                ...localProperties, 
                duration: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
              placeholder="e.g., 8"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Additional Notes</label>
              <Tooltip content="Any additional notes about the scaffolding requirements">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <textarea
              id="notes"
              value={localProperties.notes || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, notes: e.target.value })}
              placeholder="Any additional notes or information about scaffolding requirements"
              className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
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
