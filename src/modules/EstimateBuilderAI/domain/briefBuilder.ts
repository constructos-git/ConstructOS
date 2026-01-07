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

  if (answers.knockThrough !== undefined) {
    brief.knockThrough = answers.knockThrough === true || answers.knockThrough === 'yes';
  }

  if (answers.knockThroughType) {
    brief.knockThroughType = answers.knockThroughType;
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
    'foundationsType', 'heatingType', 'electricsLevel', 'measurements', 'rateSettings', 'notes'
  ];
  Object.keys(answers).forEach((key) => {
    if (!knownFields.includes(key)) {
      brief[key] = answers[key];
    }
  });

  return brief;
}

