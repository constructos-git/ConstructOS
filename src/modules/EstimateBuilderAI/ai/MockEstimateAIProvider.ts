// Mock AI Provider - Generates realistic estimates using assemblies and measurements

import type { IEstimateAIProvider } from './IEstimateAIProvider';
import type {
  EstimateBrief,
  InternalCosting,
  CustomerEstimate,
  VisibilitySettings,
  InternalCostingSection,
  CustomerEstimateSection,
  CustomerEstimateItem,
  RateSettings,
  AssemblyLine,
} from '../domain/types';
import { generateId } from '../utils/ids';
import { roundMoney, calculateVat } from '../utils/money';
import { seedAssemblies } from '../domain/assembliesRegistry';
import { evaluateFormula } from '../utils/formula';
import { getDefaultRateSettings, applyRegionalMultiplier } from '../utils/rates';

export class MockEstimateAIProvider implements IEstimateAIProvider {
  async generateEstimate(brief: EstimateBrief): Promise<{
    internalCosting: InternalCosting;
    customerEstimate: CustomerEstimate;
    visibilitySettings: VisibilitySettings;
  }> {
    const measurements = brief.measurements;
    const rateSettings = brief.rateSettings || getDefaultRateSettings();

    if (!measurements || measurements.floorAreaM2 <= 0) {
      throw new Error('Measurements are required to generate estimate');
    }

    // Generate internal costing using assemblies
    const internalCosting = this.generateInternalCosting(brief, measurements, rateSettings);
    
    // Generate customer estimate from internal costing
    const customerEstimate = this.generateCustomerEstimate(internalCosting);
    
    // Default visibility settings
    const visibilitySettings: VisibilitySettings = {
      showSectionTotals: true,
      showVat: true,
      showTotalsWithVat: true,
      showTotalsWithoutVat: false,
      showProvisionalSums: true,
      showGrandTotalOnly: false,
      showDescriptions: true,
      showLabourItems: true,
      showMaterialItems: true,
      showLineTotals: true,
      showQuantities: true,
      showUnits: true,
      showNotes: true,
    };

    return {
      internalCosting,
      customerEstimate,
      visibilitySettings,
    };
  }

  private generateInternalCosting(
    brief: EstimateBrief,
    measurements: EstimateBrief['measurements'],
    rateSettings: RateSettings
  ): InternalCosting {
    const sections: InternalCostingSection[] = [];
    const assumptions: string[] = [];

    if (!measurements) {
      throw new Error('Measurements required');
    }

    // Build formula context from measurements
    const formulaContext = {
      floorAreaM2: measurements.floorAreaM2,
      perimeterM: measurements.perimeterM,
      externalWallAreaM2: measurements.externalWallAreaM2,
      roofAreaM2: measurements.roofAreaM2,
      externalLengthM: measurements.externalLengthM,
      externalWidthM: measurements.externalWidthM,
      eavesHeightM: measurements.eavesHeightM,
    };

    // Section 1: Groundworks & Foundations
    const foundationsSection: InternalCostingSection = {
      id: generateId(),
      title: 'Groundworks & Foundations',
      items: [],
      notes: this.getFoundationsNote(brief.foundationsType),
    };

    if (brief.foundationsType === 'piled' || brief.foundationsType === 'unknown') {
      // Provisional sum
      foundationsSection.items.push({
        id: generateId(),
        itemType: 'prelim',
        title: 'Foundations (Provisional Sum)',
        description: `Foundations type: ${brief.foundationsType}`,
        quantity: 1,
        unit: 'sum',
        unitCost: 5000.0,
        unitPrice: 6000.0,
        marginPercent: 15,
        overheadPercent: 10,
        contingencyPercent: 5,
        vatRate: rateSettings.vatPct,
        isProvisional: true,
        isPurchasable: false,
        isWorkOrderEligible: false,
        isAutoRated: true,
        isManualOverride: false,
        calculationTrace: `Provisional sum for ${brief.foundationsType} foundations`,
      });
    } else {
      // Use strip foundations assembly
      const foundationsAssembly = seedAssemblies.find((a) => a.id === 'strip-foundations');
      if (foundationsAssembly) {
        foundationsAssembly.lines.forEach((line: AssemblyLine) => {
          const qty = evaluateFormula(line.qtyFormula, formulaContext);
          const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
          const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

          foundationsSection.items.push({
            id: generateId(),
            itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
            title: line.title,
            description: line.customerTextBlock,
            quantity: qty,
            unit: line.unit,
            unitCost: baseCost,
            unitPrice,
            marginPercent: line.defaultMarkupPct,
            overheadPercent: rateSettings.overheadPct,
            contingencyPercent: rateSettings.contingencyPct,
            vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
            isProvisional: false,
            isPurchasable: line.costType === 'material',
            isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
            isAutoRated: true,
            isManualOverride: false,
            assemblyId: foundationsAssembly.id,
            assemblyLineId: line.id,
            qtyFormula: line.qtyFormula,
            sourceTokens: formulaContext,
            calculationTrace: `From ${foundationsAssembly.name} assembly, qty=${qty.toFixed(2)} ${line.unit}`,
          });
        });
      }
    }

    sections.push(foundationsSection);
    assumptions.push(`Foundations: ${brief.foundationsType || 'standard-strip'}`);

    // Section 2: Structure & Shell
    const structureSection: InternalCostingSection = {
      id: generateId(),
      title: 'Structure & Shell',
      items: [],
    };

    // Concrete slab
    const slabAssembly = seedAssemblies.find((a) => a.id === 'concrete-slab');
    if (slabAssembly) {
      slabAssembly.lines.forEach((line: AssemblyLine) => {
        const qty = evaluateFormula(line.qtyFormula, formulaContext);
        const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
        const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

        structureSection.items.push({
          id: generateId(),
          itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
          title: line.title,
          description: line.customerTextBlock,
          quantity: qty,
          unit: line.unit,
          unitCost: baseCost,
          unitPrice,
          marginPercent: line.defaultMarkupPct,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
          isProvisional: false,
          isPurchasable: line.costType === 'material',
          isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
          isAutoRated: true,
          isManualOverride: false,
          assemblyId: slabAssembly.id,
          assemblyLineId: line.id,
          qtyFormula: line.qtyFormula,
          sourceTokens: formulaContext,
          calculationTrace: `From ${slabAssembly.name} assembly`,
        });
      });
    }

    // External walls
    const wallsAssembly = seedAssemblies.find((a) => a.id === 'external-cavity-wall');
    if (wallsAssembly) {
      wallsAssembly.lines.forEach((line: AssemblyLine) => {
        const qty = evaluateFormula(line.qtyFormula, formulaContext);
        const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
        const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

        structureSection.items.push({
          id: generateId(),
          itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
          title: line.title,
          description: line.customerTextBlock,
          quantity: qty,
          unit: line.unit,
          unitCost: baseCost,
          unitPrice,
          marginPercent: line.defaultMarkupPct,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
          isProvisional: false,
          isPurchasable: line.costType === 'material',
          isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
          isAutoRated: true,
          isManualOverride: false,
          assemblyId: wallsAssembly.id,
          assemblyLineId: line.id,
          qtyFormula: line.qtyFormula,
          sourceTokens: formulaContext,
          calculationTrace: `From ${wallsAssembly.name} assembly, wall finish: ${brief.wallFinish || 'standard'}`,
        });
      });
    }

    sections.push(structureSection);
    assumptions.push(`Wall finish: ${brief.wallFinish || 'standard'}`);

    // Section 3: Roofing
    const roofingSection: InternalCostingSection = {
      id: generateId(),
      title: 'Roofing',
      items: [],
    };

    if (brief.roofType === 'flat') {
      const flatRoofAssembly = seedAssemblies.find((a) => a.id === 'flat-roof-warm-deck');
      if (flatRoofAssembly) {
        flatRoofAssembly.lines.forEach((line: AssemblyLine) => {
          const qty = evaluateFormula(line.qtyFormula, formulaContext);
          const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
          const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

          roofingSection.items.push({
            id: generateId(),
            itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
            title: line.title,
            description: line.customerTextBlock,
            quantity: qty,
            unit: line.unit,
            unitCost: baseCost,
            unitPrice,
            marginPercent: line.defaultMarkupPct,
            overheadPercent: rateSettings.overheadPct,
            contingencyPercent: rateSettings.contingencyPct,
            vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
            isProvisional: false,
            isPurchasable: line.costType === 'material',
            isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
            isAutoRated: true,
            isManualOverride: false,
            assemblyId: flatRoofAssembly.id,
            assemblyLineId: line.id,
            qtyFormula: line.qtyFormula,
            sourceTokens: formulaContext,
            calculationTrace: `From ${flatRoofAssembly.name} assembly`,
          });
        });
      }
    } else if (brief.roofType === 'pitched') {
      const pitchedRoofAssembly = seedAssemblies.find((a) => a.id === 'pitched-roof-covering');
      if (pitchedRoofAssembly) {
        pitchedRoofAssembly.lines.forEach((line: AssemblyLine) => {
          const qty = evaluateFormula(line.qtyFormula, formulaContext);
          const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
          const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

          roofingSection.items.push({
            id: generateId(),
            itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
            title: line.title,
            description: line.customerTextBlock,
            quantity: qty,
            unit: line.unit,
            unitCost: baseCost,
            unitPrice,
            marginPercent: line.defaultMarkupPct,
            overheadPercent: rateSettings.overheadPct,
            contingencyPercent: rateSettings.contingencyPct,
            vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
            isProvisional: false,
            isPurchasable: line.costType === 'material',
            isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
            isAutoRated: true,
            isManualOverride: false,
            assemblyId: pitchedRoofAssembly.id,
            assemblyLineId: line.id,
            qtyFormula: line.qtyFormula,
            sourceTokens: formulaContext,
            calculationTrace: `From ${pitchedRoofAssembly.name} assembly, covering: ${brief.roofCovering || 'standard'}`,
          });
        });
      }
    }

    // Rooflights
    const rooflightsCount = brief.rooflightsCount || 0;
    if (rooflightsCount > 0) {
      const rooflightCost = applyRegionalMultiplier(450.0, rateSettings.regionalMultiplier);
      roofingSection.items.push({
        id: generateId(),
        itemType: 'material',
        title: 'Rooflights',
        description: `${rooflightsCount} rooflight(s)`,
        quantity: rooflightsCount,
        unit: 'no',
        unitCost: rooflightCost,
        unitPrice: roundMoney(rooflightCost * 1.2),
        marginPercent: 15,
        overheadPercent: rateSettings.overheadPct,
        contingencyPercent: rateSettings.contingencyPct,
        vatRate: rateSettings.vatPct,
        isProvisional: false,
        isPurchasable: true,
        isWorkOrderEligible: false,
        isAutoRated: true,
        isManualOverride: false,
        calculationTrace: `${rooflightsCount} rooflight(s) at £${rooflightCost.toFixed(2)} each`,
      });
    }

    sections.push(roofingSection);
    assumptions.push(`Roof type: ${brief.roofType}, covering: ${brief.roofCovering || 'standard'}, rooflights: ${rooflightsCount}`);

    // Section 4: Openings
    const openingsSection: InternalCostingSection = {
      id: generateId(),
      title: 'Openings',
      items: [],
    };

    // Rear doors
    if (brief.doorType && brief.doorType !== 'none') {
      const doorCosts: Record<string, number> = {
        bifold: 1200.0,
        sliding: 800.0,
        french: 600.0,
        patio: 700.0,
      };
      const baseCost = applyRegionalMultiplier(doorCosts[brief.doorType] || 800.0, rateSettings.regionalMultiplier);
      openingsSection.items.push({
        id: generateId(),
        itemType: 'material',
        title: `Rear doors - ${brief.doorType}`,
        description: `${brief.doorType} doors`,
        quantity: 1,
        unit: 'no',
        unitCost: baseCost,
        unitPrice: roundMoney(baseCost * 1.2),
        marginPercent: 15,
        overheadPercent: rateSettings.overheadPct,
        contingencyPercent: rateSettings.contingencyPct,
        vatRate: rateSettings.vatPct,
        isProvisional: false,
        isPurchasable: true,
        isWorkOrderEligible: false,
        isAutoRated: true,
        isManualOverride: false,
        calculationTrace: `Door type: ${brief.doorType}`,
      });
    }

    // Windows (standard allowance)
    openingsSection.items.push({
      id: generateId(),
      itemType: 'material',
      title: 'Windows',
      description: 'Double glazed windows',
      quantity: 3,
      unit: 'no',
      unitCost: applyRegionalMultiplier(350.0, rateSettings.regionalMultiplier),
      unitPrice: roundMoney(applyRegionalMultiplier(350.0, rateSettings.regionalMultiplier) * 1.2),
      marginPercent: 15,
      overheadPercent: rateSettings.overheadPct,
      contingencyPercent: rateSettings.contingencyPct,
      vatRate: rateSettings.vatPct,
      isProvisional: false,
      isPurchasable: true,
      isWorkOrderEligible: false,
      isAutoRated: true,
      isManualOverride: false,
      calculationTrace: 'Standard window allowance',
    });

    sections.push(openingsSection);

    // Section 5: First Fix
    const firstFixSection: InternalCostingSection = {
      id: generateId(),
      title: 'First Fix',
      items: [],
    };

    // Electrics
    const electricsAssembly = seedAssemblies.find((a) => a.id === 'first-fix-electrics');
    if (electricsAssembly) {
      const levelMultiplier = brief.electricsLevel === 'high-spec' ? 1.5 : brief.electricsLevel === 'standard' ? 1.2 : 1.0;
      electricsAssembly.lines.forEach((line: AssemblyLine) => {
        const qty = evaluateFormula(line.qtyFormula, formulaContext);
        let baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
        baseCost = roundMoney(baseCost * levelMultiplier);
        const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

        firstFixSection.items.push({
          id: generateId(),
          itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
          title: line.title,
          description: line.customerTextBlock,
          quantity: qty,
          unit: line.unit,
          unitCost: baseCost,
          unitPrice,
          marginPercent: line.defaultMarkupPct,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
          isProvisional: false,
          isPurchasable: line.costType === 'material',
          isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
          isAutoRated: true,
          isManualOverride: false,
          assemblyId: electricsAssembly.id,
          assemblyLineId: line.id,
          qtyFormula: line.qtyFormula,
          sourceTokens: formulaContext,
          calculationTrace: `From ${electricsAssembly.name} assembly, level: ${brief.electricsLevel || 'basic'}`,
        });
      });
    }

    // Heating
    if (brief.heatingType && brief.heatingType !== 'none-existing') {
      const heatingAssembly = seedAssemblies.find((a) => a.id === 'heating-allowance');
      if (heatingAssembly) {
        heatingAssembly.lines.forEach((line: AssemblyLine) => {
          const qty = evaluateFormula(line.qtyFormula, formulaContext);
          const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
          const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

          firstFixSection.items.push({
            id: generateId(),
            itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
            title: line.title,
            description: `${line.customerTextBlock} - ${brief.heatingType}`,
            quantity: qty,
            unit: line.unit,
            unitCost: baseCost,
            unitPrice,
            marginPercent: line.defaultMarkupPct,
            overheadPercent: rateSettings.overheadPct,
            contingencyPercent: rateSettings.contingencyPct,
            vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
            isProvisional: false,
            isPurchasable: line.costType === 'material',
            isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
            isAutoRated: true,
            isManualOverride: false,
            assemblyId: heatingAssembly.id,
            assemblyLineId: line.id,
            qtyFormula: line.qtyFormula,
            sourceTokens: formulaContext,
            calculationTrace: `From ${heatingAssembly.name} assembly, type: ${brief.heatingType}`,
          });
        });
      }
    }

    sections.push(firstFixSection);
    assumptions.push(`Electrics: ${brief.electricsLevel || 'basic'}, Heating: ${brief.heatingType || 'none'}`);

    // Section 6: Finishes
    const finishesSection: InternalCostingSection = {
      id: generateId(),
      title: 'Finishes',
      items: [],
    };

    const plasterAssembly = seedAssemblies.find((a) => a.id === 'plasterboard-skim');
    if (plasterAssembly) {
      plasterAssembly.lines.forEach((line: AssemblyLine) => {
        const qty = evaluateFormula(line.qtyFormula, formulaContext);
        const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
        const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

        finishesSection.items.push({
          id: generateId(),
          itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
          title: line.title,
          description: line.customerTextBlock,
          quantity: qty,
          unit: line.unit,
          unitCost: baseCost,
          unitPrice,
          marginPercent: line.defaultMarkupPct,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
          isProvisional: false,
          isPurchasable: line.costType === 'material',
          isWorkOrderEligible: line.costType === 'labour' || line.costType === 'subcontract',
          isAutoRated: true,
          isManualOverride: false,
          assemblyId: plasterAssembly.id,
          assemblyLineId: line.id,
          qtyFormula: line.qtyFormula,
          sourceTokens: formulaContext,
          calculationTrace: `From ${plasterAssembly.name} assembly`,
        });
      });
    }

    sections.push(finishesSection);

    // Section 7: Preliminaries
    const prelimSection: InternalCostingSection = {
      id: generateId(),
      title: 'Preliminaries',
      items: [],
    };

    // Waste/Skips
    const wasteAssembly = seedAssemblies.find((a) => a.id === 'waste-skips');
    if (wasteAssembly) {
      wasteAssembly.lines.forEach((line: AssemblyLine) => {
        const qty = evaluateFormula(line.qtyFormula, formulaContext);
        const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
        const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

        prelimSection.items.push({
          id: generateId(),
          itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
          title: line.title,
          description: line.customerTextBlock,
          quantity: qty,
          unit: line.unit,
          unitCost: baseCost,
          unitPrice,
          marginPercent: line.defaultMarkupPct,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
          isProvisional: false,
          isPurchasable: false,
          isWorkOrderEligible: false,
          isAutoRated: true,
          isManualOverride: false,
          assemblyId: wasteAssembly.id,
          assemblyLineId: line.id,
          qtyFormula: line.qtyFormula,
          sourceTokens: formulaContext,
          calculationTrace: `From ${wasteAssembly.name} assembly`,
        });
      });
    }

    // Scaffolding (provisional)
    const scaffoldingAssembly = seedAssemblies.find((a) => a.id === 'scaffolding');
    if (scaffoldingAssembly) {
      scaffoldingAssembly.lines.forEach((line: AssemblyLine) => {
        const qty = evaluateFormula(line.qtyFormula, formulaContext);
        const baseCost = applyRegionalMultiplier(line.baseUnitCost, rateSettings.regionalMultiplier);
        const unitPrice = roundMoney(baseCost * (1 + line.defaultMarkupPct / 100));

        prelimSection.items.push({
          id: generateId(),
          itemType: line.costType as 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim',
          title: line.title,
          description: line.customerTextBlock,
          quantity: qty,
          unit: line.unit,
          unitCost: baseCost,
          unitPrice,
          marginPercent: line.defaultMarkupPct,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: line.vatApplicable ? rateSettings.vatPct : 0,
          isProvisional: true,
          isPurchasable: false,
          isWorkOrderEligible: false,
          isAutoRated: true,
          isManualOverride: false,
          assemblyId: scaffoldingAssembly.id,
          assemblyLineId: line.id,
          qtyFormula: line.qtyFormula,
          sourceTokens: formulaContext,
          calculationTrace: `From ${scaffoldingAssembly.name} assembly (provisional)`,
        });
      });
    }

    sections.push(prelimSection);

    // Knock-through (if required)
    if (brief.knockThrough) {
      const knockThroughSection: InternalCostingSection = {
        id: generateId(),
        title: 'Knock-Through',
        items: [],
      };

      const knockThroughCost = applyRegionalMultiplier(800.0, rateSettings.regionalMultiplier);
      const steelBeamCost = applyRegionalMultiplier(450.0, rateSettings.regionalMultiplier);

      knockThroughSection.items.push(
        {
          id: generateId(),
          itemType: 'labour',
          title: `Knock-through - ${brief.knockThroughType || 'standard'}`,
          description: `Create opening for ${brief.knockThroughType || 'opening'}`,
          quantity: 1,
          unit: 'no',
          unitCost: knockThroughCost,
          unitPrice: roundMoney(knockThroughCost * 1.2),
          marginPercent: 15,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: rateSettings.vatPct,
          isProvisional: false,
          isPurchasable: false,
          isWorkOrderEligible: true,
          isAutoRated: true,
          isManualOverride: false,
          calculationTrace: `Knock-through type: ${brief.knockThroughType}`,
        },
        {
          id: generateId(),
          itemType: 'material',
          title: 'Steel beam',
          description: 'Structural steel beam for opening',
          quantity: 1,
          unit: 'no',
          unitCost: steelBeamCost,
          unitPrice: roundMoney(steelBeamCost * 1.2),
          marginPercent: 15,
          overheadPercent: rateSettings.overheadPct,
          contingencyPercent: rateSettings.contingencyPct,
          vatRate: rateSettings.vatPct,
          isProvisional: false,
          isPurchasable: true,
          isWorkOrderEligible: false,
          isAutoRated: true,
          isManualOverride: false,
          calculationTrace: 'Steel beam for structural opening',
        }
      );

      sections.push(knockThroughSection);
      assumptions.push(`Knock-through required: ${brief.knockThroughType}`);
    }

    // Calculate totals using rate settings
    let subtotal = 0;
    sections.forEach((section) => {
      section.items.forEach((item) => {
        const baseTotal = item.quantity * item.unitPrice;
        const margin = roundMoney(baseTotal * (item.marginPercent / 100));
        const overhead = roundMoney(baseTotal * (item.overheadPercent / 100));
        const contingency = roundMoney(baseTotal * (item.contingencyPercent / 100));
        subtotal += baseTotal + margin + overhead + contingency;
      });
    });

    const overhead = roundMoney(subtotal * (rateSettings.overheadPct / 100));
    const margin = roundMoney(subtotal * (rateSettings.marginPct / 100));
    const contingency = roundMoney(subtotal * (rateSettings.contingencyPct / 100));
    const vatBase = subtotal + overhead + margin + contingency;
    const vat = calculateVat(vatBase, rateSettings.vatPct);
    const total = roundMoney(vatBase + vat);

    assumptions.push(`Region: ${rateSettings.region}, Multiplier: ${rateSettings.regionalMultiplier.toFixed(2)}`);
    assumptions.push(`Overhead: ${rateSettings.overheadPct}%, Margin: ${rateSettings.marginPct}%, Contingency: ${rateSettings.contingencyPct}%, VAT: ${rateSettings.vatPct}%`);

    return {
      sections,
      subtotal,
      overhead,
      margin,
      contingency,
      vat,
      total,
      assumptions,
    };
  }

  private getFoundationsNote(foundationsType?: string): string {
    if (foundationsType === 'piled' || foundationsType === 'unknown') {
      return 'Provisional sum - to be confirmed';
    }
    if (foundationsType === 'trench-fill') {
      return 'Trench fill foundations';
    }
    return 'Strip foundations to Building Regulations';
  }

  private generateCustomerEstimate(internalCosting: InternalCosting): CustomerEstimate {
    const sections: CustomerEstimateSection[] = internalCosting.sections.map((section) => {
      const items: CustomerEstimateItem[] = section.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || item.calculationTrace,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal: roundMoney(item.quantity * item.unitPrice),
        notes: item.isProvisional ? 'Provisional sum' : undefined,
      }));

      const sectionTotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

      return {
        id: section.id,
        title: section.title,
        items,
        sectionTotal: roundMoney(sectionTotal),
        notes: section.notes,
      };
    });

    const subtotal = sections.reduce((sum, section) => sum + (section.sectionTotal || 0), 0);
    const vat = calculateVat(subtotal, 20);
    const total = roundMoney(subtotal + vat);

    const provisionalSums = sections.reduce((sum, section) => {
      return sum + section.items.reduce((itemSum, item) => {
        return itemSum + (item.notes === 'Provisional sum' ? (item.lineTotal || 0) : 0);
      }, 0);
    }, 0);

    return {
      sections,
      subtotal,
      vat,
      total,
      provisionalSums: provisionalSums > 0 ? roundMoney(provisionalSums) : undefined,
    };
  }
}
