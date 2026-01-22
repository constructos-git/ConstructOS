// Plans Data Mapper - Maps extracted plans data to wizard answers format

import type { ExtractedPlansData } from '../ai/plansAnalyzer';

/**
 * Maps extracted plans data to wizard answers format
 * This function takes the structured data from plan analysis and converts it
 * into the format expected by the wizard's answer structure
 */
export function mapExtractedDataToAnswers(extractedData: ExtractedPlansData): Record<string, any> {
  const answers: Record<string, any> = {};

  // Map dimensions to measurements
  if (extractedData.dimensions) {
    if (extractedData.dimensions.length) {
      answers.dimensions = {
        ...answers.dimensions,
        length: extractedData.dimensions.length,
      };
    }
    if (extractedData.dimensions.width) {
      answers.dimensions = {
        ...answers.dimensions,
        width: extractedData.dimensions.width,
      };
    }
    if (extractedData.dimensions.height) {
      answers.dimensions = {
        ...answers.dimensions,
        height: extractedData.dimensions.height,
      };
    }
    if (extractedData.dimensions.floorArea) {
      answers.measurements = {
        ...answers.measurements,
        floorAreaM2: extractedData.dimensions.floorArea,
        externalLengthM: extractedData.dimensions.length || 0,
        externalWidthM: extractedData.dimensions.width || 0,
      };
    }
  }

  // Map foundations
  if (extractedData.foundations) {
    if (extractedData.foundations.type) {
      // Map foundation type to wizard format
      const foundationTypeMap: Record<string, string> = {
        'strip': 'strip',
        'raft': 'raft',
        'pad': 'pad',
        'piled': 'piled',
      };
      answers.foundationsType = foundationTypeMap[extractedData.foundations.type] || extractedData.foundations.type;
    }
    if (extractedData.foundations.depth) {
      answers.foundationDepth = extractedData.foundations.depth * 1000; // Convert meters to mm
    }
    if (extractedData.foundations.width) {
      answers.foundationWidth = extractedData.foundations.width;
    }
  }

  // Map external walls
  if (extractedData.externalWalls) {
    if (extractedData.externalWalls.constructionType) {
      // Map construction type
      const constructionTypeMap: Record<string, string> = {
        'brick-and-block': 'brick-and-block',
        'block-and-block': 'block-and-block',
        'timber-frame': 'timber-frame',
        'concrete-block': 'concrete-block',
        'insulated-concrete-form': 'icf',
      };
      answers.wallConstructionType = constructionTypeMap[extractedData.externalWalls.constructionType] || extractedData.externalWalls.constructionType;
    }
    if (extractedData.externalWalls.finish) {
      // Map finish type
      const finishMap: Record<string, string> = {
        'facing-brick': 'facing-brick',
        'render': 'render',
        'tile-hanging': 'tile-hanging',
        'cladding': 'cladding',
        'pebble-dash': 'pebble-dash',
        'stone': 'stone',
      };
      answers.wallFinish = finishMap[extractedData.externalWalls.finish] || extractedData.externalWalls.finish;
    }
    if (extractedData.externalWalls.cavitySize) {
      answers.cavitySize = extractedData.externalWalls.cavitySize;
    }
    if (extractedData.externalWalls.cavityType) {
      answers.cavityType = extractedData.externalWalls.cavityType;
    }
    if (extractedData.externalWalls.residualCavity) {
      answers.residualCavity = extractedData.externalWalls.residualCavity;
    }
    if (extractedData.externalWalls.insulationThickness) {
      answers.wallInsulationThickness = extractedData.externalWalls.insulationThickness;
    }
  }

  // Map roof
  if (extractedData.roof) {
    if (extractedData.roof.type) {
      const roofTypeMap: Record<string, string> = {
        'flat': 'flat',
        'pitched': 'pitched',
        'hipped': 'pitched', // Map to pitched
        'gabled': 'pitched', // Map to pitched
        'mansard': 'pitched', // Map to pitched
      };
      answers.roofType = roofTypeMap[extractedData.roof.type] || extractedData.roof.type;
    }
    if (extractedData.roof.type === 'flat' && extractedData.roof.constructionType) {
      const flatRoofMap: Record<string, string> = {
        'warm-deck': 'warm-deck',
        'cold-deck': 'cold-deck',
        'inverted': 'inverted',
        'hybrid': 'hybrid',
      };
      answers.flatRoofType = flatRoofMap[extractedData.roof.constructionType] || extractedData.roof.constructionType;
    }
    if (extractedData.roof.covering) {
      answers.roofCovering = extractedData.roof.covering;
    }
    if (extractedData.roof.pitch) {
      answers.roofPitch = extractedData.roof.pitch;
    }
    if (extractedData.roof.joistSize) {
      answers.roofJoistSize = extractedData.roof.joistSize;
    }
    if (extractedData.roof.joistSpacing) {
      answers.roofJoistSpacing = extractedData.roof.joistSpacing;
    }
  }

  // Map insulation
  if (extractedData.insulation) {
    if (extractedData.insulation.wallInsulationType) {
      const insulationTypeMap: Record<string, string> = {
        'full-fill': 'full-fill',
        'partial-fill': 'partial-fill',
        'external': 'external',
        'internal': 'internal',
      };
      answers.wallInsulationType = insulationTypeMap[extractedData.insulation.wallInsulationType] || extractedData.insulation.wallInsulationType;
    }
    if (extractedData.insulation.wallInsulationThickness) {
      answers.wallInsulationThickness = extractedData.insulation.wallInsulationThickness;
    }
    if (extractedData.insulation.roofInsulationType) {
      answers.roofInsulationType = extractedData.insulation.roofInsulationType;
    }
    if (extractedData.insulation.roofInsulationThickness) {
      answers.roofInsulationThickness = extractedData.insulation.roofInsulationThickness;
    }
    if (extractedData.insulation.floorInsulationType) {
      answers.floorInsulationType = extractedData.insulation.floorInsulationType;
    }
    if (extractedData.insulation.floorInsulationThickness) {
      answers.floorInsulationThickness = extractedData.insulation.floorInsulationThickness;
    }
  }

  return answers;
}
