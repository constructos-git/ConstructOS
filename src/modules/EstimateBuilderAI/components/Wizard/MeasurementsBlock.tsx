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
  dimensions?: {
    length?: number;
    width?: number;
    ceilingHeight?: number;
    soffit?: number;
    gable?: number;
    foundationLength?: number;
    foundationWidth?: number;
    foundationDepth?: number;
  };
  knockThroughWidth?: number;
  knockThroughHeight?: number;
  openingsAreaM2?: number;
  onUpdate: (measurements: Partial<EstimateMeasurements>) => void;
}

export function MeasurementsBlock({
  measurements,
  roofType,
  dimensions,
  knockThroughWidth,
  knockThroughHeight,
  openingsAreaM2 = 0,
  onUpdate,
}: MeasurementsBlockProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurements.externalLengthM, measurements.externalWidthM, measurements.eavesHeightM, roofType]);

  // Sync from dimensions if available
  useEffect(() => {
    if (dimensions?.length && dimensions.length > 0) {
      setLocalMeasurements((prev) => ({
        ...prev,
        externalLengthM: dimensions.length || prev.externalLengthM,
        externalWidthM: dimensions.width || prev.externalWidthM,
      }));
    }
  }, [dimensions]);

  // Recalculate measurements when local state or roofType changes
  useEffect(() => {
    if (localMeasurements.externalLengthM > 0 && localMeasurements.externalWidthM > 0) {
      const computed = computeMeasurements({
        externalLengthM: localMeasurements.externalLengthM,
        externalWidthM: localMeasurements.externalWidthM,
        eavesHeightM: localMeasurements.eavesHeightM,
        ceilingHeightM: dimensions?.ceilingHeight,
        roofType: roofType || 'flat',
        flatRoofFactor: localMeasurements.flatRoofFactor,
        pitchedRoofFactor: localMeasurements.pitchedRoofFactor,
        soffitMM: dimensions?.soffit,
        gableMM: dimensions?.gable,
        foundationWidthMM: dimensions?.foundationWidth,
        foundationDepthMM: dimensions?.foundationDepth,
        excavationDepthMM: dimensions?.foundationDepth, // Use foundation depth as excavation depth
        concreteDepthMM: dimensions?.foundationDepth ? dimensions.foundationDepth * 0.75 : 750, // 75% of foundation depth
        openingsAreaM2: openingsAreaM2,
      });
      
      // Add knock-through dimensions
      const updated = {
        ...computed,
        knockThroughWidthM: knockThroughWidth,
        knockThroughHeightM: knockThroughHeight,
      };
      
      onUpdate(updated);
    }
  }, [
    localMeasurements.externalLengthM,
    localMeasurements.externalWidthM,
    localMeasurements.eavesHeightM,
    localMeasurements.flatRoofFactor,
    localMeasurements.pitchedRoofFactor,
    roofType,
    dimensions,
    knockThroughWidth,
    knockThroughHeight,
    openingsAreaM2,
    onUpdate,
  ]);

  const computed = measurements.floorAreaM2
    ? computeMeasurements({
        externalLengthM: measurements.externalLengthM || localMeasurements.externalLengthM,
        externalWidthM: measurements.externalWidthM || localMeasurements.externalWidthM,
        eavesHeightM: measurements.eavesHeightM || localMeasurements.eavesHeightM,
        ceilingHeightM: dimensions?.ceilingHeight || measurements.ceilingHeightM,
        roofType: roofType || 'flat',
        flatRoofFactor: localMeasurements.flatRoofFactor,
        pitchedRoofFactor: localMeasurements.pitchedRoofFactor,
        soffitMM: dimensions?.soffit,
        gableMM: dimensions?.gable,
        foundationWidthMM: dimensions?.foundationWidth || measurements.foundationWidthMM,
        foundationDepthMM: dimensions?.foundationDepth || measurements.foundationDepthMM,
        excavationDepthMM: measurements.excavationDepthMM,
        concreteDepthMM: measurements.concreteDepthMM,
        openingsAreaM2: openingsAreaM2 || measurements.openingsAreaM2 || 0,
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
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="1.15" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Standard (1.15)</option>
              <option value="1.25" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Complex (1.25)</option>
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
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="1.05" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Standard (1.05)</option>
              <option value="1.10" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Complex (1.10)</option>
            </select>
          </div>
        )}
      </div>

      {computed && computed.floorAreaM2 > 0 && (
        <div className="mt-4 space-y-4">
          {/* Basic Measurements */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-3">Basic Measurements</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">External Footprint:</span>
                <span className="ml-2 font-medium">{formatArea(computed.floorAreaM2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Internal Floor Area:</span>
                <span className="ml-2 font-medium">{formatArea(computed.internalFloorAreaM2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Perimeter:</span>
                <span className="ml-2 font-medium">{formatLength(computed.perimeterM)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ceiling Height:</span>
                <span className="ml-2 font-medium">{formatLength(computed.ceilingHeightM || computed.eavesHeightM)}</span>
              </div>
            </div>
          </div>

          {/* Foundation */}
          {computed.foundationLengthM && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-3">Foundation</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {computed.excavationDepthMM && (
                  <div>
                    <span className="text-muted-foreground">Excavation Depth:</span>
                    <span className="ml-2 font-medium">{computed.excavationDepthMM} mm</span>
                  </div>
                )}
                {computed.foundationWidthMM && (
                  <div>
                    <span className="text-muted-foreground">Foundation Width:</span>
                    <span className="ml-2 font-medium">{computed.foundationWidthMM} mm</span>
                  </div>
                )}
                {computed.concreteDepthMM && (
                  <div>
                    <span className="text-muted-foreground">Concrete Depth:</span>
                    <span className="ml-2 font-medium">{computed.concreteDepthMM} mm</span>
                  </div>
                )}
                {computed.foundationLengthM && (
                  <div>
                    <span className="text-muted-foreground">Foundation Run:</span>
                    <span className="ml-2 font-medium">{formatLength(computed.foundationLengthM)}</span>
                  </div>
                )}
                {computed.concreteVolumeM3 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Concrete Volume:</span>
                    <span className="ml-2 font-medium">{computed.concreteVolumeM3.toFixed(2)} m³</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Walls Below DPC */}
          {computed.outerSkinLengthM && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-3">Walls Below DPC</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {computed.outerSkinLengthM && (
                  <div>
                    <span className="text-muted-foreground">Outer Skin - 100mm Brick & Block:</span>
                    <span className="ml-2 font-medium">{formatLength(computed.outerSkinLengthM)}</span>
                  </div>
                )}
                {computed.brickHeightMM && (
                  <div>
                    <span className="text-muted-foreground">Brick Height:</span>
                    <span className="ml-2 font-medium">{computed.brickHeightMM} mm</span>
                  </div>
                )}
                {computed.blockHeightMM && (
                  <div>
                    <span className="text-muted-foreground">Block Height:</span>
                    <span className="ml-2 font-medium">{computed.blockHeightMM} mm</span>
                  </div>
                )}
                {computed.innerSkinLengthM && (
                  <div>
                    <span className="text-muted-foreground">Inner Skin - 100mm Block:</span>
                    <span className="ml-2 font-medium">{formatLength(computed.innerSkinLengthM)}</span>
                  </div>
                )}
                {computed.cavityWidthMM && (
                  <div>
                    <span className="text-muted-foreground">Cavity:</span>
                    <span className="ml-2 font-medium">{computed.cavityWidthMM} mm</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Walls */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-3">External Walls</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Exterior Area:</span>
                <span className="ml-2 font-medium">{formatArea(computed.externalWallAreaM2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Interior Area:</span>
                <span className="ml-2 font-medium">{formatArea(computed.internalWallAreaM2)}</span>
              </div>
              {computed.outerSkinAreaM2 && (
                <div>
                  <span className="text-muted-foreground">Outer Skin Area:</span>
                  <span className="ml-2 font-medium">{formatArea(computed.outerSkinAreaM2)}</span>
                </div>
              )}
              {computed.innerSkinAreaM2 && (
                <div>
                  <span className="text-muted-foreground">Inner Skin Area:</span>
                  <span className="ml-2 font-medium">{formatArea(computed.innerSkinAreaM2)}</span>
                </div>
              )}
              {computed.openingsAreaM2 > 0 && (
                <div>
                  <span className="text-muted-foreground">Openings Area:</span>
                  <span className="ml-2 font-medium">{formatArea(computed.openingsAreaM2)}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Net Wall Area:</span>
                <span className="ml-2 font-medium">{formatArea(computed.netWallAreaM2)}</span>
              </div>
            </div>
          </div>

          {/* Roof */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-3">Roof</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {computed.roofPitchDegrees !== undefined && (
                <div>
                  <span className="text-muted-foreground">Pitch:</span>
                  <span className="ml-2 font-medium">{computed.roofPitchDegrees}°</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Roof Area:</span>
                <span className="ml-2 font-medium">{formatArea(computed.roofAreaM2)}</span>
              </div>
              {computed.ceilingInsulationAreaM2 && (
                <div>
                  <span className="text-muted-foreground">Insulation at Ceiling. Area:</span>
                  <span className="ml-2 font-medium">{formatArea(computed.ceilingInsulationAreaM2)}</span>
                </div>
              )}
              {computed.fasciaLengthM && (
                <div>
                  <span className="text-muted-foreground">Fascia - 225 mm:</span>
                  <span className="ml-2 font-medium">{formatLength(computed.fasciaLengthM)}</span>
                </div>
              )}
              {computed.soffitLengthM && (
                <div>
                  <span className="text-muted-foreground">Soffit - 200 mm:</span>
                  <span className="ml-2 font-medium">{formatLength(computed.soffitLengthM)}</span>
                </div>
              )}
              {computed.bargeboardLengthM && computed.bargeboardLengthM > 0 && (
                <div>
                  <span className="text-muted-foreground">Bargeboard - 200 mm:</span>
                  <span className="ml-2 font-medium">{formatLength(computed.bargeboardLengthM)}</span>
                </div>
              )}
              {computed.rakeSoffitLengthM && computed.rakeSoffitLengthM > 0 && (
                <div>
                  <span className="text-muted-foreground">Rake Soffit - 200 mm:</span>
                  <span className="ml-2 font-medium">{formatLength(computed.rakeSoffitLengthM)}</span>
                </div>
              )}
              {computed.eavesLengthM && (
                <div>
                  <span className="text-muted-foreground">Eaves:</span>
                  <span className="ml-2 font-medium">{formatLength(computed.eavesLengthM)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Knock-Through Dimensions */}
          {(knockThroughWidth || knockThroughHeight) && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold mb-3">Knock-Through Dimensions</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {knockThroughWidth && (
                  <div>
                    <span className="text-muted-foreground">Width:</span>
                    <span className="ml-2 font-medium">{knockThroughWidth.toFixed(2)} m</span>
                  </div>
                )}
                {knockThroughHeight && (
                  <div>
                    <span className="text-muted-foreground">Height:</span>
                    <span className="ml-2 font-medium">{knockThroughHeight.toFixed(2)} m</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

