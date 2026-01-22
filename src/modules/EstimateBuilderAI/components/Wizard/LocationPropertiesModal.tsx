// Location Properties Modal Component - Extension Location relative to property

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

export interface LocationProperties {
  extensionLocation?: string; // Where extension is being built (rear, side, front, etc.)
  extensionPosition?: string; // More specific position details
  distanceFromBoundary?: string;
  adjacentProperties?: string;
  notes?: string;
}

interface LocationPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: LocationProperties;
  onSave: (properties: LocationProperties) => void;
}

export function LocationPropertiesModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: LocationPropertiesModalProps) {
  const [localProperties, setLocalProperties] = useState<LocationProperties>(properties);

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
          <CardTitle className="text-2xl">Extension Location</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Extension Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="extensionLocation" className="text-sm font-medium">Extension Location</label>
              <Tooltip content="Where the extension will be built in relation to the property">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="extensionLocation"
              value={localProperties.extensionLocation || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, extensionLocation: e.target.value })}
              placeholder="e.g., Rear, Side, Front, Wrap-around"
            />
          </div>

          {/* Extension Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="extensionPosition" className="text-sm font-medium">Extension Position</label>
              <Tooltip content="More specific details about the extension position">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="extensionPosition"
              value={localProperties.extensionPosition || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, extensionPosition: e.target.value })}
              placeholder="e.g., Left side, Right side, Full width rear"
            />
          </div>

          {/* Distance from Boundary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="distanceFromBoundary" className="text-sm font-medium">Distance from Boundary</label>
              <Tooltip content="Distance of extension from property boundary">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Input
              id="distanceFromBoundary"
              value={localProperties.distanceFromBoundary || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, distanceFromBoundary: e.target.value })}
              placeholder="e.g., 1m, 2.5m, On boundary"
            />
          </div>

          {/* Adjacent Properties */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="adjacentProperties" className="text-sm font-medium">Adjacent Properties</label>
              <Tooltip content="Information about adjacent properties that may affect the extension">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <textarea
              id="adjacentProperties"
              value={localProperties.adjacentProperties || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, adjacentProperties: e.target.value })}
              placeholder="Describe any relevant information about adjacent properties"
              className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Additional Notes</label>
              <Tooltip content="Any additional notes about the extension location">
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
