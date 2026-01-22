// Brief Builder: Converts wizard answers into structured EstimateBrief

import type { EstimateBrief } from './types';

export function buildEstimateBrief(
  templateId: string,
  answers: Record<string, any>
): EstimateBrief {
  const brief: EstimateBrief = {
    templateId,
  };

  // Map answers to brief fields based on question IDs
  if (answers.propertyType) {
    brief.propertyType = answers.propertyType;
  }

  if (Array.isArray(answers.alterationTypes)) {
    brief.alterationTypes = answers.alterationTypes;
  }

  if (answers.location) {
    brief.location = answers.location;
  }

  // Professional Services
  if (answers.planningRequired) {
    brief.planningRequired = answers.planningRequired;
  }
  if (answers.planningApplicationFee !== undefined) {
    brief.planningApplicationFee = typeof answers.planningApplicationFee === 'number'
      ? answers.planningApplicationFee
      : parseFloat(String(answers.planningApplicationFee)) || 0;
  }
  if (answers.planningConsultantFee !== undefined) {
    brief.planningConsultantFee = typeof answers.planningConsultantFee === 'number'
      ? answers.planningConsultantFee
      : parseFloat(String(answers.planningConsultantFee)) || 0;
  }
  if (answers.buildingControlRequired) {
    brief.buildingControlRequired = answers.buildingControlRequired;
  }
  if (answers.buildingControlType) {
    brief.buildingControlType = answers.buildingControlType;
  }
  if (answers.buildingControlApplicationFee !== undefined) {
    brief.buildingControlApplicationFee = typeof answers.buildingControlApplicationFee === 'number'
      ? answers.buildingControlApplicationFee
      : parseFloat(String(answers.buildingControlApplicationFee)) || 0;
  }
  if (answers.buildingControlInspectionFee !== undefined) {
    brief.buildingControlInspectionFee = typeof answers.buildingControlInspectionFee === 'number'
      ? answers.buildingControlInspectionFee
      : parseFloat(String(answers.buildingControlInspectionFee)) || 0;
  }
  if (answers.structuralEngineerRequired) {
    brief.structuralEngineerRequired = answers.structuralEngineerRequired;
  }
  if (answers.structuralEngineerFee !== undefined) {
    brief.structuralEngineerFee = typeof answers.structuralEngineerFee === 'number'
      ? answers.structuralEngineerFee
      : parseFloat(String(answers.structuralEngineerFee)) || 0;
  }
  if (answers.partyWallRequired) {
    brief.partyWallRequired = answers.partyWallRequired;
  }
  if (answers.partyWallSurveyorFee !== undefined) {
    brief.partyWallSurveyorFee = typeof answers.partyWallSurveyorFee === 'number'
      ? answers.partyWallSurveyorFee
      : parseFloat(String(answers.partyWallSurveyorFee)) || 0;
  }
  if (answers.partyWallNeighborSurveyorFee !== undefined) {
    brief.partyWallNeighborSurveyorFee = typeof answers.partyWallNeighborSurveyorFee === 'number'
      ? answers.partyWallNeighborSurveyorFee
      : parseFloat(String(answers.partyWallNeighborSurveyorFee)) || 0;
  }
  if (answers.architectRequired) {
    brief.architectRequired = answers.architectRequired;
  }
  if (answers.architectFee !== undefined) {
    brief.architectFee = typeof answers.architectFee === 'number'
      ? answers.architectFee
      : parseFloat(String(answers.architectFee)) || 0;
  }
  if (answers.otherProfessionalServices) {
    brief.otherProfessionalServices = answers.otherProfessionalServices;
  }
  if (answers.otherProfessionalServicesFee !== undefined) {
    brief.otherProfessionalServicesFee = typeof answers.otherProfessionalServicesFee === 'number'
      ? answers.otherProfessionalServicesFee
      : parseFloat(String(answers.otherProfessionalServicesFee)) || 0;
  }

  if (answers.knockThrough !== undefined) {
    brief.knockThrough = answers.knockThrough === true || answers.knockThrough === 'yes' || answers.knockThrough === 'existing';
  }

  if (answers.knockThroughType) {
    brief.knockThroughType = answers.knockThroughType;
  }

  if (answers.existingOpeningAction) {
    brief.existingOpeningAction = answers.existingOpeningAction;
  }

  if (answers.knockThroughEnlargementAmount !== undefined) {
    brief.knockThroughEnlargementAmount = typeof answers.knockThroughEnlargementAmount === 'number'
      ? answers.knockThroughEnlargementAmount
      : parseFloat(String(answers.knockThroughEnlargementAmount));
  }

  // Handle knock-through width (new opening or existing)
  if (answers.knockThroughWidth !== undefined) {
    brief.knockThroughWidthM = typeof answers.knockThroughWidth === 'number'
      ? answers.knockThroughWidth
      : parseFloat(String(answers.knockThroughWidth));
  } else if (answers.knockThroughWidthExisting !== undefined) {
    brief.knockThroughWidthM = typeof answers.knockThroughWidthExisting === 'number'
      ? answers.knockThroughWidthExisting
      : parseFloat(String(answers.knockThroughWidthExisting));
  }

  // Handle knock-through height (new opening or existing)
  if (answers.knockThroughHeight !== undefined) {
    brief.knockThroughHeightM = typeof answers.knockThroughHeight === 'number'
      ? answers.knockThroughHeight
      : parseFloat(String(answers.knockThroughHeight));
  } else if (answers.knockThroughHeightExisting !== undefined) {
    brief.knockThroughHeightM = typeof answers.knockThroughHeightExisting === 'number'
      ? answers.knockThroughHeightExisting
      : parseFloat(String(answers.knockThroughHeightExisting));
  }

  // Handle knock-through support (new opening or existing)
  if (answers.knockThroughSupport) {
    brief.knockThroughSupport = answers.knockThroughSupport;
  } else if (answers.knockThroughSupportExisting) {
    brief.knockThroughSupport = answers.knockThroughSupportExisting;
  }

  // Foundation dimensions (now in Foundations section)
  if (answers.foundationLength !== undefined) {
    if (!brief.measurements) {
      brief.measurements = {};
    }
    brief.measurements.foundationLengthM = typeof answers.foundationLength === 'number'
      ? answers.foundationLength
      : parseFloat(String(answers.foundationLength));
  }
  if (answers.foundationWidth !== undefined) {
    if (!brief.measurements) {
      brief.measurements = {};
    }
    brief.measurements.foundationWidthMM = typeof answers.foundationWidth === 'number'
      ? answers.foundationWidth
      : parseFloat(String(answers.foundationWidth));
  }
  if (answers.foundationDepth !== undefined) {
    if (!brief.measurements) {
      brief.measurements = {};
    }
    brief.measurements.foundationDepthMM = typeof answers.foundationDepth === 'number'
      ? answers.foundationDepth
      : parseFloat(String(answers.foundationDepth));
  }

  // Ceiling height (now in Ground Floor section)
  if (answers.ceilingHeight !== undefined) {
    if (!brief.measurements) {
      brief.measurements = {};
    }
    brief.measurements.ceilingHeightM = typeof answers.ceilingHeight === 'number'
      ? answers.ceilingHeight
      : parseFloat(String(answers.ceilingHeight));
  }

  // Roof overhangs (now in Fascia, Soffit & Rainwater Goods section)
  if (answers.soffitOverhang !== undefined) {
    if (!brief.measurements) {
      brief.measurements = {};
    }
    brief.measurements.soffitMM = typeof answers.soffitOverhang === 'number'
      ? answers.soffitOverhang
      : parseFloat(String(answers.soffitOverhang));
  }
  if (answers.rakeOverhang !== undefined) {
    if (!brief.measurements) {
      brief.measurements = {};
    }
    brief.measurements.gableMM = typeof answers.rakeOverhang === 'number'
      ? answers.rakeOverhang
      : parseFloat(String(answers.rakeOverhang));
  }

  if (answers.groundFloorType) {
    brief.groundFloorType = answers.groundFloorType;
  }

  if (answers.floorInsulation !== undefined) {
    brief.floorInsulation = answers.floorInsulation === true || answers.floorInsulation === 'yes';
  }

  if (answers.roofInsulation !== undefined) {
    brief.roofInsulation = answers.roofInsulation === true || answers.roofInsulation === 'yes';
  }

  if (answers.openingsAreaM2 !== undefined) {
    if (brief.measurements) {
      brief.measurements.openingsAreaM2 = typeof answers.openingsAreaM2 === 'number'
        ? answers.openingsAreaM2
        : parseFloat(String(answers.openingsAreaM2));
    }
  }

  if (answers.roofType) {
    brief.roofType = answers.roofType;
  }

  if (answers.roofSubType) {
    brief.roofSubType = answers.roofSubType;
  }

  if (answers.roofCovering) {
    brief.roofCovering = answers.roofCovering;
  }

  if (answers.wallFinish) {
    brief.wallFinish = answers.wallFinish;
  }

  if (answers.doorType) {
    brief.doorType = answers.doorType;
  }

  if (answers.rooflightsCount !== undefined) {
    brief.rooflightsCount = typeof answers.rooflightsCount === 'number' ? answers.rooflightsCount : parseInt(String(answers.rooflightsCount), 10);
  }

  if (answers.foundationsType) {
    brief.foundationsType = answers.foundationsType;
  }

  if (answers.groundFloorType) {
    brief.groundFloorType = answers.groundFloorType;
  }

  if (answers.wallConstructionType) {
    brief.wallConstructionType = answers.wallConstructionType;
  }

  if (answers.cavitySize) {
    brief.cavitySize = typeof answers.cavitySize === 'number' 
      ? answers.cavitySize 
      : parseFloat(String(answers.cavitySize)) || undefined;
  }

  if (answers.cavityType) {
    brief.cavityType = answers.cavityType;
  }

  if (answers.wallInsulationThickness) {
    brief.wallInsulationThickness = typeof answers.wallInsulationThickness === 'number'
      ? answers.wallInsulationThickness
      : parseFloat(String(answers.wallInsulationThickness)) || undefined;
  }

  if (answers.residualCavity) {
    brief.residualCavity = typeof answers.residualCavity === 'number'
      ? answers.residualCavity
      : parseFloat(String(answers.residualCavity)) || undefined;
  }

  if (answers.wallInsulationType) {
    brief.wallInsulationType = answers.wallInsulationType;
  }

  if (answers.timberFrameInsulationType) {
    brief.timberFrameInsulationType = answers.timberFrameInsulationType;
  }

  if (answers.timberFrameInsulationThickness) {
    brief.timberFrameInsulationThickness = typeof answers.timberFrameInsulationThickness === 'number'
      ? answers.timberFrameInsulationThickness
      : parseFloat(String(answers.timberFrameInsulationThickness)) || undefined;
  }

  if (answers.fasciaType) {
    brief.fasciaType = answers.fasciaType;
  }

  if (answers.fasciaDepth !== undefined) {
    brief.fasciaDepth = typeof answers.fasciaDepth === 'number' ? answers.fasciaDepth : parseFloat(String(answers.fasciaDepth));
  }

  if (answers.soffitType) {
    brief.soffitType = answers.soffitType;
  }

  if (answers.bargeboardType) {
    brief.bargeboardType = answers.bargeboardType;
  }

  if (answers.gutterType) {
    brief.gutterType = answers.gutterType;
  }

  if (answers.gutterSize) {
    brief.gutterSize = answers.gutterSize;
  }

  if (answers.downpipeType) {
    brief.downpipeType = answers.downpipeType;
  }

  if (answers.downpipeSize) {
    brief.downpipeSize = answers.downpipeSize;
  }

  if (answers.rainwaterGoodsOther) {
    brief.rainwaterGoodsOther = String(answers.rainwaterGoodsOther);
  }

  if (answers.floorInsulation !== undefined) {
    brief.floorInsulation = answers.floorInsulation === true || answers.floorInsulation === 'yes';
  }

  if (answers.roofInsulation !== undefined) {
    brief.roofInsulation = answers.roofInsulation === true || answers.roofInsulation === 'yes';
  }

  if (answers.openingsAreaM2 !== undefined) {
    if (brief.measurements) {
      brief.measurements.openingsAreaM2 = typeof answers.openingsAreaM2 === 'number'
        ? answers.openingsAreaM2
        : parseFloat(String(answers.openingsAreaM2));
    }
  }

  if (answers.heatingType) {
    brief.heatingType = answers.heatingType;
  }

  if (answers.electricsLevel) {
    brief.electricsLevel = answers.electricsLevel;
  }

  if (answers.measurements) {
    brief.measurements = answers.measurements;
  }

  if (answers.rateSettings) {
    brief.rateSettings = answers.rateSettings;
  }

  if (answers.notes) {
    brief.notes = answers.notes;
  }

  // Add any additional fields from answers
  const knownFields = [
    'propertyType', 'alterationTypes', 'location', 'knockThrough', 'knockThroughType',
    'roofType', 'roofSubType', 'roofCovering', 'wallFinish', 'doorType', 'rooflightsCount',
    'foundationsType', 'heatingType', 'electricsLevel', 'measurements', 'rateSettings', 'notes',
    'planningRequired', 'planningApplicationFee', 'planningConsultantFee',
    'buildingControlRequired', 'buildingControlType', 'buildingControlApplicationFee', 'buildingControlInspectionFee',
    'structuralEngineerRequired', 'structuralEngineerFee',
    'partyWallRequired', 'partyWallSurveyorFee', 'partyWallNeighborSurveyorFee',
    'architectRequired', 'architectFee',
    'otherProfessionalServices', 'otherProfessionalServicesFee'
  ];
  Object.keys(answers).forEach((key) => {
    if (!knownFields.includes(key)) {
      brief[key] = answers[key];
    }
  });

  return brief;
}

