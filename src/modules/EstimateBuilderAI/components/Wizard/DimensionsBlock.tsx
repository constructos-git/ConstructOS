// Dimensions Block Component - Simple early input for length and width

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

interface DimensionsBlockProps {
  length?: number;
  width?: number;
  onUpdate: (dimensions: { length: number; width: number }) => void;
}

export function DimensionsBlock({ length, width, onUpdate }: DimensionsBlockProps) {
  const [localLength, setLocalLength] = useState(length || 0);
  const [localWidth, setLocalWidth] = useState(width || 0);

  // Sync when props change
  useEffect(() => {
    if (length !== undefined) setLocalLength(length);
    if (width !== undefined) setLocalWidth(width);
  }, [length, width]);

  // Update parent when values change
  useEffect(() => {
    onUpdate({
      length: localLength,
      width: localWidth,
    });
  }, [localLength, localWidth, onUpdate]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-semibold mb-1">Extension Dimensions</h3>
        <p className="text-sm text-muted-foreground">Enter the basic dimensions of your extension</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">Length (m)</label>
            <Tooltip content="The external length of the extension measured from outside wall to outside wall. This is typically the longer dimension of the extension footprint.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={localLength || ''}
            onChange={(e) => setLocalLength(parseFloat(e.target.value) || 0)}
            placeholder="0.0"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">Width (m)</label>
            <Tooltip content="The external width of the extension measured from outside wall to outside wall. This is typically the shorter dimension of the extension footprint.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={localWidth || ''}
            onChange={(e) => setLocalWidth(parseFloat(e.target.value) || 0)}
            placeholder="0.0"
          />
        </div>
      </div>

      {localLength > 0 && localWidth > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm">
            <span className="text-muted-foreground">Estimated Floor Area: </span>
            <span className="font-medium">{(localLength * localWidth).toFixed(2)} m²</span>
          </div>
        </div>
      )}
    </div>
  );
}

