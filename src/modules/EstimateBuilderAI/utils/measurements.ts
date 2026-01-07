// Measurements utilities for Estimate Builder AI

import { roundMoney } from './money';

export interface MeasurementInputs {
  externalLengthM: number;
  externalWidthM: number;
  eavesHeightM: number;
  roofType?: 'flat' | 'pitched';
  flatRoofFactor?: number;
  pitchedRoofFactor?: number;
}

export interface EstimateMeasurements {
  externalLengthM: number;
  externalWidthM: number;
  eavesHeightM: number;
  floorAreaM2: number;
  perimeterM: number;
  externalWallAreaM2: number;
  roofAreaM2: number;
  roofFactor: number;
}

export function computeMeasurements(
  inputs: MeasurementInputs
): EstimateMeasurements {
  const { externalLengthM, externalWidthM, eavesHeightM, roofType, flatRoofFactor, pitchedRoofFactor } = inputs;

  // Basic calculations
  const floorAreaM2 = roundMoney(externalLengthM * externalWidthM);
  const perimeterM = roundMoney(2 * (externalLengthM + externalWidthM));
  const externalWallAreaM2 = roundMoney(perimeterM * eavesHeightM);

  // Roof area calculation
  let roofAreaM2: number;
  let roofFactor: number;

  if (roofType === 'flat') {
    roofFactor = flatRoofFactor || 1.05;
    roofAreaM2 = roundMoney(floorAreaM2 * roofFactor);
  } else if (roofType === 'pitched') {
    roofFactor = pitchedRoofFactor || 1.15;
    roofAreaM2 = roundMoney(floorAreaM2 * roofFactor);
  } else {
    // Default to flat if not specified
    roofFactor = 1.05;
    roofAreaM2 = roundMoney(floorAreaM2 * roofFactor);
  }

  return {
    externalLengthM,
    externalWidthM,
    eavesHeightM,
    floorAreaM2,
    perimeterM,
    externalWallAreaM2,
    roofAreaM2,
    roofFactor,
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

