// Dimensions Block Component - Simple early input for length and width

import { useState, useEffect, useRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

interface DimensionsBlockProps {
  length?: number;
  width?: number;
  ceilingHeight?: number;
  soffit?: number;
  gable?: number;
  foundationLength?: number;
  foundationWidth?: number;
  foundationDepth?: number;
  onUpdate: (dimensions: {
    length: number;
    width: number;
    ceilingHeight?: number;
    soffit?: number;
    gable?: number;
    foundationLength?: number;
    foundationWidth?: number;
    foundationDepth?: number;
  }) => void;
}

const QUICK_LENGTHS = [2, 3, 4, 5];
const QUICK_WIDTHS = [2, 3, 4, 5];

export function DimensionsBlock({
  length,
  width,
  onUpdate,
}: DimensionsBlockProps) {
  const [localLength, setLocalLength] = useState(length || 0);
  const [localWidth, setLocalWidth] = useState(width || 0);

  // Sync when props change
  useEffect(() => {
    if (length !== undefined) setLocalLength(length);
    if (width !== undefined) setLocalWidth(width);
  }, [length, width]);

  // Update parent when values change (use ref to avoid infinite loop)
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onUpdateRef.current({
      length: localLength,
      width: localWidth,
    });
  }, [localLength, localWidth]);

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-semibold mb-1">Extension Dimensions</h3>
        <p className="text-sm text-muted-foreground">Enter the basic footprint dimensions of your extension</p>
      </div>

      {/* Depth (Length) */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="text-sm font-medium">
            Depth (m) - projection from the existing property to the external face of the extension rear elevation
          </label>
          <Tooltip content="The depth of the extension measured from the existing property wall to the external face of the rear elevation. This is the projection distance from the existing building.">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <div className="flex gap-2 mb-2">
          {QUICK_LENGTHS.map((val) => (
            <Button
              key={val}
              variant={localLength === val ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLocalLength(val)}
              className="min-w-[3rem]"
            >
              {val}m
            </Button>
          ))}
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

      {/* Width */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <label className="text-sm font-medium">Width (m) - dimension across the extension from side to side.</label>
          <Tooltip content="The measurement from left to right, side to side externally - usually running parallel with the abutting existing property wall.">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <div className="flex gap-2 mb-2">
          {QUICK_WIDTHS.map((val) => (
            <Button
              key={val}
              variant={localWidth === val ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setLocalWidth(val)}
              className="min-w-[3rem]"
            >
              {val}m
            </Button>
          ))}
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


      {localLength > 0 && localWidth > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">External Footprint: </span>
            <span className="font-medium">{(localLength * localWidth).toFixed(2)} m²</span>
            <Tooltip content="The external footprint is the total area covered by the extension measured from outside wall to outside wall.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1 inline" />
            </Tooltip>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Estimated Internal Floor Area: </span>
            <span className="font-medium">
              {Math.max(0, (localLength - 0.3) * (localWidth - 0.3)).toFixed(2)} m²
            </span>
            <Tooltip content="The internal floor area is calculated by subtracting the wall depth (typically 300mm overall: 100mm outer skin, 100mm cavity, 100mm inner skin) from the external dimensions.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help ml-1 inline" />
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}

