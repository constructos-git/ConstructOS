// Measurements utilities for Estimate Builder AI

import { roundMoney } from './money';
import type { EstimateMeasurements } from '../domain/types';

export interface MeasurementInputs {
  externalLengthM: number;
  externalWidthM: number;
  eavesHeightM: number;
  ceilingHeightM?: number;
  roofType?: 'flat' | 'pitched';
  flatRoofFactor?: number;
  pitchedRoofFactor?: number;
  soffitMM?: number;
  gableMM?: number;
  wallThicknessMM?: number; // Default 300mm (100mm outer + 100mm cavity + 100mm inner)
  foundationWidthMM?: number;
  foundationDepthMM?: number;
  excavationDepthMM?: number;
  concreteDepthMM?: number;
  dpcLevelMM?: number;
  openingsAreaM2?: number;
  roofPitchDegrees?: number;
}

export function computeMeasurements(
  inputs: MeasurementInputs
): EstimateMeasurements {
  const {
    externalLengthM,
    externalWidthM,
    eavesHeightM,
    ceilingHeightM,
    roofType,
    flatRoofFactor,
    pitchedRoofFactor,
    soffitMM = 200,
    gableMM = 200,
    wallThicknessMM = 300, // Default: 100mm outer + 100mm cavity + 100mm inner
    foundationWidthMM = 600,
    foundationDepthMM = 1000,
    excavationDepthMM = 1000,
    concreteDepthMM = 750,
    dpcLevelMM = 150,
    openingsAreaM2 = 0,
    roofPitchDegrees = 0,
  } = inputs;

  // Wall thickness in metres
  const wallThicknessM = wallThicknessMM / 1000;

  // Basic calculations
  const floorAreaM2 = roundMoney(externalLengthM * externalWidthM);
  const perimeterM = roundMoney(2 * (externalLengthM + externalWidthM));
  
  // Internal dimensions (subtract wall thickness from both sides)
  const internalLengthM = roundMoney(Math.max(0, externalLengthM - (wallThicknessM * 2)));
  const internalWidthM = roundMoney(Math.max(0, externalWidthM - (wallThicknessM * 2)));
  const internalFloorAreaM2 = roundMoney(internalLengthM * internalWidthM);

  // Wall areas
  const externalWallAreaM2 = roundMoney(perimeterM * eavesHeightM);
  const internalWallAreaM2 = roundMoney(
    (2 * (internalLengthM + internalWidthM)) * (ceilingHeightM || eavesHeightM)
  );
  const netWallAreaM2 = roundMoney(Math.max(0, externalWallAreaM2 - openingsAreaM2));

  // Foundation calculations
  const foundationLengthM = perimeterM; // Foundation run = perimeter
  const foundationWidthM = foundationWidthMM / 1000;
  const concreteDepthM = concreteDepthMM / 1000;
  const concreteVolumeM3 = roundMoney(foundationLengthM * foundationWidthM * concreteDepthM);

  // Walls below DPC
  const dpcLevelM = dpcLevelMM / 1000;
  const outerSkinLengthM = perimeterM;
  const innerSkinLengthM = roundMoney(2 * (internalLengthM + internalWidthM));
  const outerSkinAreaM2 = roundMoney(outerSkinLengthM * dpcLevelM);
  const innerSkinAreaM2 = roundMoney(innerSkinLengthM * dpcLevelM);
  const brickHeightMM = dpcLevelMM; // Typically matches DPC level
  const blockHeightMM = dpcLevelMM + 250; // Block extends above DPC
  const cavityWidthMM = 100; // Standard cavity

  // Roof area calculation
  let roofAreaM2: number;
  let roofFactor: number;

  if (roofType === 'flat') {
    roofFactor = flatRoofFactor || 1.05;
    // Flat roof area = floor area + overhangs (soffit)
    const soffitM = soffitMM / 1000;
    const roofLength = externalLengthM + (soffitM * 2);
    const roofWidth = externalWidthM + (soffitM * 2);
    roofAreaM2 = roundMoney(roofLength * roofWidth);
  } else if (roofType === 'pitched') {
    roofFactor = pitchedRoofFactor || 1.15;
    // Pitched roof accounts for pitch and overhangs
    const soffitM = soffitMM / 1000;
    const gableM = gableMM / 1000;
    const baseLength = externalLengthM + (soffitM * 2);
    const baseWidth = externalWidthM + (gableM * 2);
    roofAreaM2 = roundMoney((baseLength * baseWidth) * roofFactor);
  } else {
    // Default to flat if not specified
    roofFactor = 1.05;
    const soffitM = soffitMM / 1000;
    const roofLength = externalLengthM + (soffitM * 2);
    const roofWidth = externalWidthM + (soffitM * 2);
    roofAreaM2 = roundMoney(roofLength * roofWidth);
  }

  // Roof component measurements
  const soffitLengthM = roundMoney(perimeterM); // Soffit runs around perimeter
  const fasciaLengthM = roundMoney(perimeterM); // Fascia runs around perimeter
  const eavesLengthM = roundMoney(perimeterM); // Eaves = perimeter
  const bargeboardLengthM = roofType === 'pitched' 
    ? roundMoney(externalLengthM * 2) // Both gable ends
    : 0;
  const rakeSoffitLengthM = roofType === 'pitched'
    ? roundMoney(externalLengthM * 2) // Both rake edges
    : 0;

  // Ceiling insulation area (internal floor area)
  const ceilingInsulationAreaM2 = internalFloorAreaM2;

  return {
    // Basic dimensions
    externalLengthM,
    externalWidthM,
    eavesHeightM,
    ceilingHeightM: ceilingHeightM || eavesHeightM,
    internalLengthM,
    internalWidthM,
    
    // Areas
    floorAreaM2,
    internalFloorAreaM2,
    perimeterM,
    externalWallAreaM2,
    internalWallAreaM2,
    openingsAreaM2,
    netWallAreaM2,
    
    // Roof
    roofAreaM2,
    roofFactor,
    roofPitchDegrees,
    fasciaLengthM,
    soffitLengthM,
    bargeboardLengthM,
    rakeSoffitLengthM,
    eavesLengthM,
    ceilingInsulationAreaM2,
    
    // Foundation
    foundationLengthM,
    foundationWidthMM,
    foundationDepthMM,
    excavationDepthMM,
    concreteDepthMM,
    concreteVolumeM3,
    
    // Walls below DPC
    dpcLevelMM,
    outerSkinLengthM,
    innerSkinLengthM,
    outerSkinAreaM2,
    innerSkinAreaM2,
    brickHeightMM,
    blockHeightMM,
    cavityWidthMM,
  };
}

export function formatMeasurement(value: number, unit: 'm' | 'm²'): string {
  return `${value.toFixed(2)} ${unit}`;
}

export function formatLength(value: number): string {
  return formatMeasurement(value, 'm');
}

export function formatArea(value: number): string {
  return formatMeasurement(value, 'm²');
}

