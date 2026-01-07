// Measurements Block Component

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import { computeMeasurements, formatLength, formatArea } from '../../utils/measurements';
import type { EstimateMeasurements } from '../../domain/types';

interface MeasurementsBlockProps {
  measurements: Partial<EstimateMeasurements>;
  roofType?: 'flat' | 'pitched';
  onUpdate: (measurements: Partial<EstimateMeasurements>) => void;
}

export function MeasurementsBlock({ measurements, roofType, onUpdate }: MeasurementsBlockProps) {
  const [localMeasurements, setLocalMeasurements] = useState({
    externalLengthM: measurements.externalLengthM || 0,
    externalWidthM: measurements.externalWidthM || 0,
    eavesHeightM: measurements.eavesHeightM || 2.4,
    flatRoofFactor: measurements.roofFactor || 1.05,
    pitchedRoofFactor: measurements.roofFactor || 1.15,
  });

  // Sync local state when measurements prop changes (e.g., when roofType changes)
  // But don't sync roofFactor - that's user-controlled via the dropdown
  useEffect(() => {
    if (measurements.externalLengthM !== undefined) {
      setLocalMeasurements((prev) => ({
        ...prev,
        externalLengthM: measurements.externalLengthM || prev.externalLengthM,
        externalWidthM: measurements.externalWidthM || prev.externalWidthM,
        eavesHeightM: measurements.eavesHeightM || prev.eavesHeightM,
        // Don't sync roofFactor from props - it's controlled by user selection
        // Only initialize if not already set
        flatRoofFactor: prev.flatRoofFactor || (measurements.roofFactor && roofType === 'flat' ? measurements.roofFactor : 1.05),
        pitchedRoofFactor: prev.pitchedRoofFactor || (measurements.roofFactor && roofType === 'pitched' ? measurements.roofFactor : 1.15),
      }));
    }
  }, [measurements.externalLengthM, measurements.externalWidthM, measurements.eavesHeightM, roofType]);

  // Recalculate measurements when local state or roofType changes
  useEffect(() => {
    if (localMeasurements.externalLengthM > 0 && localMeasurements.externalWidthM > 0) {
      const computed = computeMeasurements({
        externalLengthM: localMeasurements.externalLengthM,
        externalWidthM: localMeasurements.externalWidthM,
        eavesHeightM: localMeasurements.eavesHeightM,
        roofType: roofType || 'flat',
        flatRoofFactor: localMeasurements.flatRoofFactor,
        pitchedRoofFactor: localMeasurements.pitchedRoofFactor,
      });
      onUpdate(computed);
    }
  }, [localMeasurements.externalLengthM, localMeasurements.externalWidthM, localMeasurements.eavesHeightM, localMeasurements.flatRoofFactor, localMeasurements.pitchedRoofFactor, roofType, onUpdate]);

  const computed = measurements.floorAreaM2
    ? computeMeasurements({
        externalLengthM: measurements.externalLengthM || localMeasurements.externalLengthM,
        externalWidthM: measurements.externalWidthM || localMeasurements.externalWidthM,
        eavesHeightM: measurements.eavesHeightM || localMeasurements.eavesHeightM,
        roofType: roofType || 'flat',
        flatRoofFactor: localMeasurements.flatRoofFactor,
        pitchedRoofFactor: localMeasurements.pitchedRoofFactor,
      })
    : null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-semibold mb-1">Measurements</h3>
        <p className="text-sm text-muted-foreground">Enter the extension dimensions</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">External Length (m)</label>
            <Tooltip content="The external length of the extension measured from outside wall to outside wall. This is the longer dimension of the extension footprint.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={localMeasurements.externalLengthM || ''}
            onChange={(e) =>
              setLocalMeasurements({
                ...localMeasurements,
                externalLengthM: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.0"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">External Width (m)</label>
            <Tooltip content="The external width of the extension measured from outside wall to outside wall. This is the shorter dimension of the extension footprint.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={localMeasurements.externalWidthM || ''}
            onChange={(e) =>
              setLocalMeasurements({
                ...localMeasurements,
                externalWidthM: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.0"
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">Eaves Height (m)</label>
            <Tooltip content="The height from ground level to the bottom of the roof (eaves level). Standard UK eaves height is typically 2.4m, but can vary based on planning requirements and design.">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={localMeasurements.eavesHeightM || ''}
            onChange={(e) =>
              setLocalMeasurements({
                ...localMeasurements,
                eavesHeightM: parseFloat(e.target.value) || 2.4,
              })
            }
            placeholder="2.4"
          />
        </div>

        {roofType === 'pitched' && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-sm font-medium">Pitched Roof Factor</label>
              <Tooltip content="A multiplier applied to the floor area to calculate the roof area. Accounts for roof pitch, overhangs, and soffits. Standard (1.15) is for typical pitched roofs, Complex (1.25) is for roofs with multiple pitches, dormers, or complex geometry.">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <select
              value={localMeasurements.pitchedRoofFactor.toFixed(2)}
              onChange={(e) => {
                const newFactor = parseFloat(e.target.value);
                setLocalMeasurements((prev) => ({
                  ...prev,
                  pitchedRoofFactor: newFactor,
                }));
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="1.15">Standard (1.15)</option>
              <option value="1.25">Complex (1.25)</option>
            </select>
          </div>
        )}

        {roofType === 'flat' && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-sm font-medium">Flat Roof Factor</label>
              <Tooltip content="A multiplier applied to the floor area to calculate the roof area. Accounts for roof overhangs and soffits that extend beyond the external wall area. Standard (1.05) is for typical flat roofs with minimal overhang, Complex (1.10) is for roofs with larger overhangs or complex perimeter details.">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <select
              value={localMeasurements.flatRoofFactor.toFixed(2)}
              onChange={(e) => {
                const newFactor = parseFloat(e.target.value);
                setLocalMeasurements((prev) => ({
                  ...prev,
                  flatRoofFactor: newFactor,
                }));
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="1.05">Standard (1.05)</option>
              <option value="1.10">Complex (1.10)</option>
            </select>
          </div>
        )}
      </div>

      {computed && computed.floorAreaM2 > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Calculated Values</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Floor Area:</span>
              <span className="ml-2 font-medium">{formatArea(computed.floorAreaM2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Perimeter:</span>
              <span className="ml-2 font-medium">{formatLength(computed.perimeterM)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Wall Area:</span>
              <span className="ml-2 font-medium">{formatArea(computed.externalWallAreaM2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Roof Area:</span>
              <span className="ml-2 font-medium">{formatArea(computed.roofAreaM2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

