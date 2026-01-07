// Brief Builder - Converts EstimateBrief into structured brief content

import type { EstimateBrief, EstimateBriefContent, EstimateMeasurements, RateSettings } from '../domain/types';

export function buildBriefContent(
  brief: EstimateBrief,
  measurements?: EstimateMeasurements,
  rateSettings?: RateSettings
): EstimateBriefContent {
  const keySelections: Record<string, any> = {};
  
  if (brief.location) keySelections.location = brief.location;
  if (brief.knockThrough !== undefined) keySelections.knockThrough = brief.knockThrough;
  if (brief.knockThroughType) keySelections.knockThroughType = brief.knockThroughType;
  if (brief.roofType) keySelections.roofType = brief.roofType;
  if (brief.roofSubType) keySelections.roofSubType = brief.roofSubType;
  if (brief.roofCovering) keySelections.roofCovering = brief.roofCovering;
  if (brief.wallFinish) keySelections.wallFinish = brief.wallFinish;
  if (brief.doorType) keySelections.doorType = brief.doorType;
  if (brief.rooflightsCount !== undefined) keySelections.rooflightsCount = brief.rooflightsCount;
  if (brief.foundationsType) keySelections.foundationsType = brief.foundationsType;
  if (brief.heatingType) keySelections.heatingType = brief.heatingType;
  if (brief.electricsLevel) keySelections.electricsLevel = brief.electricsLevel;

  const provisionalSums: string[] = [];
  const risksUnknowns: string[] = [];

  // Identify provisional sums
  if (brief.foundationsType === 'piled' || brief.foundationsType === 'unknown') {
    provisionalSums.push('Foundations (provisional sum)');
    risksUnknowns.push('Foundations type requires site investigation - provisional sum included');
  }

  // Identify risks
  if (!measurements || measurements.floorAreaM2 <= 0) {
    risksUnknowns.push('Measurements not provided - quantities estimated');
  }

  if (!rateSettings) {
    risksUnknowns.push('Rate settings not configured - using defaults');
  }

  return {
    projectOverview: {
      template: brief.templateId,
      location: brief.location,
      propertyType: brief.propertyType,
      keySelections,
    },
    measurements: measurements ? {
      floorAreaM2: measurements.floorAreaM2,
      wallAreaM2: measurements.externalWallAreaM2,
      roofAreaM2: measurements.roofAreaM2,
      perimeterM: measurements.perimeterM,
    } : {
      floorAreaM2: 0,
      wallAreaM2: 0,
      roofAreaM2: 0,
      perimeterM: 0,
    },
    keySpecs: {
      roofType: brief.roofType,
      roofCovering: brief.roofCovering,
      wallFinish: brief.wallFinish,
      doorType: brief.doorType,
      rooflightsCount: brief.rooflightsCount,
      foundationsType: brief.foundationsType,
      heatingType: brief.heatingType,
      electricsLevel: brief.electricsLevel,
    },
    pricingBasis: rateSettings ? {
      region: rateSettings.region,
      multiplier: rateSettings.regionalMultiplier,
      overheadPct: rateSettings.overheadPct,
      marginPct: rateSettings.marginPct,
      contingencyPct: rateSettings.contingencyPct,
      vatPct: rateSettings.vatPct,
    } : {
      region: 'South East',
      multiplier: 1.0,
      overheadPct: 10,
      marginPct: 15,
      contingencyPct: 5,
      vatPct: 20,
    },
    provisionalSums,
    risksUnknowns,
  };
}

export function briefContentToMarkdown(content: EstimateBriefContent): string {
  let markdown = '# Estimate Brief\n\n';
  
  markdown += '## Project Overview\n\n';
  markdown += `**Template:** ${content.projectOverview.template}\n`;
  if (content.projectOverview.location) {
    markdown += `**Location:** ${content.projectOverview.location}\n`;
  }
  if (content.projectOverview.propertyType) {
    markdown += `**Property Type:** ${content.projectOverview.propertyType}\n`;
  }
  markdown += '\n';

  markdown += '## Measurements\n\n';
  markdown += `- Floor Area: ${content.measurements.floorAreaM2.toFixed(2)} m²\n`;
  markdown += `- Wall Area: ${content.measurements.wallAreaM2.toFixed(2)} m²\n`;
  markdown += `- Roof Area: ${content.measurements.roofAreaM2.toFixed(2)} m²\n`;
  markdown += `- Perimeter: ${content.measurements.perimeterM.toFixed(2)} m\n`;
  markdown += '\n';

  markdown += '## Key Specifications\n\n';
  if (content.keySpecs.roofType) {
    markdown += `- Roof Type: ${content.keySpecs.roofType}\n`;
  }
  if (content.keySpecs.roofCovering) {
    markdown += `- Roof Covering: ${content.keySpecs.roofCovering}\n`;
  }
  if (content.keySpecs.wallFinish) {
    markdown += `- Wall Finish: ${content.keySpecs.wallFinish}\n`;
  }
  if (content.keySpecs.doorType) {
    markdown += `- Door Type: ${content.keySpecs.doorType}\n`;
  }
  if (content.keySpecs.rooflightsCount !== undefined) {
    markdown += `- Rooflights: ${content.keySpecs.rooflightsCount}\n`;
  }
  if (content.keySpecs.foundationsType) {
    markdown += `- Foundations: ${content.keySpecs.foundationsType}\n`;
  }
  if (content.keySpecs.heatingType) {
    markdown += `- Heating: ${content.keySpecs.heatingType}\n`;
  }
  if (content.keySpecs.electricsLevel) {
    markdown += `- Electrics: ${content.keySpecs.electricsLevel}\n`;
  }
  markdown += '\n';

  markdown += '## Pricing Basis\n\n';
  markdown += `- Region: ${content.pricingBasis.region}\n`;
  markdown += `- Regional Multiplier: ${content.pricingBasis.multiplier.toFixed(2)}\n`;
  markdown += `- Overhead: ${content.pricingBasis.overheadPct}%\n`;
  markdown += `- Margin: ${content.pricingBasis.marginPct}%\n`;
  markdown += `- Contingency: ${content.pricingBasis.contingencyPct}%\n`;
  markdown += `- VAT: ${content.pricingBasis.vatPct}%\n`;
  markdown += '\n';

  if (content.provisionalSums.length > 0) {
    markdown += '## Provisional Sums\n\n';
    content.provisionalSums.forEach((ps) => {
      markdown += `- ${ps}\n`;
    });
    markdown += '\n';
  }

  if (content.risksUnknowns.length > 0) {
    markdown += '## Risks & Unknowns\n\n';
    content.risksUnknowns.forEach((risk) => {
      markdown += `- ${risk}\n`;
    });
    markdown += '\n';
  }

  return markdown;
}

