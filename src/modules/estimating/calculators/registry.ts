import { paintCalculator } from './plugins/paint';
import { plasterSkimCalculator } from './plugins/plasterSkim';
import { lvtFloorCalculator } from './plugins/lvtFloor';
import { studWallCalculator } from './plugins/studWall';
import { plasterboardCalculator } from './plugins/plasterboard';
import { blockworkCalculator } from './plugins/blockwork';
import { insulationCalculator } from './plugins/insulation';
import { roofingFeltTilesCalculator } from './plugins/roofingFeltTiles';
import { kitchenRipOutCalculator } from './plugins/kitchenRipOut';
import type { CalculatorPlugin } from './types';

export const calculatorRegistry: Record<string, CalculatorPlugin> = {
  paint: paintCalculator,
  plaster_skim: plasterSkimCalculator,
  lvt_floor: lvtFloorCalculator,
  stud_wall: studWallCalculator,
  plasterboard: plasterboardCalculator,
  blockwork: blockworkCalculator,
  insulation: insulationCalculator,
  roofing_felt_tiles: roofingFeltTilesCalculator,
  kitchen_rip_out: kitchenRipOutCalculator,
};

export function getCalculator(key: string): CalculatorPlugin | undefined {
  return calculatorRegistry[key];
}

export function getAllCalculators(): CalculatorPlugin[] {
  return Object.values(calculatorRegistry);
}

