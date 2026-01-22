// Estimate Builder AI Domain Types

export type QuestionType = 'cardGrid' | 'text' | 'number' | 'select' | 'multiSelect';

export interface QuestionOption {
  id: string;
  label: string;
  icon?: string; // Icon name from lucide-react
  description?: string;
  value: string | number | boolean;
}

export interface QuestionDependency {
  questionId: string;
  condition: 'equals' | 'notEquals' | 'in' | 'notIn';
  value: string | number | boolean | (string | number | boolean)[];
}

export interface Question {
  id: string;
  title: string;
  helpText?: string;
  type: QuestionType;
  options?: QuestionOption[];
  dependencies?: QuestionDependency[];
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export interface QuestionStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface EstimateBuilderTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon: string;
  steps: QuestionStep[];
  promptBuilder: (answers: Record<string, any>) => EstimateBrief;
}

export interface EstimateMeasurements {
  // Basic dimensions
  externalLengthM: number;
  externalWidthM: number;
  eavesHeightM: number;
  ceilingHeightM?: number;
  internalLengthM: number;
  internalWidthM: number;
  
  // Areas
  floorAreaM2: number; // External footprint
  internalFloorAreaM2: number; // Internal floor area (minus wall thickness)
  perimeterM: number;
  externalWallAreaM2: number;
  internalWallAreaM2: number;
  openingsAreaM2: number;
  netWallAreaM2: number; // External wall area minus openings
  
  // Roof
  roofAreaM2: number;
  roofFactor: number;
  roofPitchDegrees?: number;
  fasciaLengthM?: number;
  soffitLengthM?: number;
  bargeboardLengthM?: number;
  rakeSoffitLengthM?: number;
  eavesLengthM?: number;
  ceilingInsulationAreaM2?: number;
  
  // Foundation
  foundationLengthM?: number; // Foundation run (perimeter)
  foundationWidthMM?: number;
  foundationDepthMM?: number;
  excavationDepthMM?: number;
  concreteDepthMM?: number;
  concreteVolumeM3?: number;
  
  // Walls below DPC
  dpcLevelMM?: number;
  outerSkinLengthM?: number;
  innerSkinLengthM?: number;
  outerSkinAreaM2?: number;
  innerSkinAreaM2?: number;
  brickHeightMM?: number;
  blockHeightMM?: number;
  cavityWidthMM?: number;
  
  // Knock-through
  knockThroughWidthM?: number;
  knockThroughHeightM?: number;
}

export interface RateSettings {
  region: string;
  regionalMultiplier: number;
  overheadPct: number;
  marginPct: number;
  contingencyPct: number;
  vatPct: number;
  autoRateMode: boolean;
}

export interface EstimateBrief {
  templateId: string;
  propertyType?: string;
  alterationTypes?: (string | number | boolean)[];
  location?: string;
  knockThrough?: boolean | string; // Can be true, false, or 'existing'
  knockThroughType?: string;
  existingOpeningAction?: 'remove-and-make-good' | 'enlarge';
  knockThroughEnlargementAmount?: number;
  knockThroughWidthM?: number;
  knockThroughHeightM?: number;
  knockThroughSupport?: 'steel' | 'lintel';
  roofType?: string;
  roofSubType?: string; // warm deck, cold deck, gable, hipped, etc.
  roofCovering?: string;
  wallFinish?: string;
  doorType?: string;
  rooflightsCount?: number;
  foundationsType?: string;
  groundFloorType?: string;
  wallConstructionType?: string;
  cavitySize?: number; // millimeters
  cavityType?: string; // 'full-fill', 'partial-fill', 'empty'
  wallInsulationThickness?: number; // millimeters
  residualCavity?: number; // millimeters
  wallInsulationType?: string;
  timberFrameInsulationType?: string;
  timberFrameInsulationThickness?: number; // millimeters
  fasciaType?: string;
  fasciaDepth?: number;
  soffitType?: string;
  bargeboardType?: string;
  gutterType?: string;
  gutterSize?: string;
  downpipeType?: string;
  downpipeSize?: string;
  rainwaterGoodsOther?: string;
  floorInsulation?: boolean;
  roofInsulation?: boolean;
  heatingType?: string;
  electricsLevel?: string;
  measurements?: EstimateMeasurements;
  rateSettings?: RateSettings;
  notes?: string;
  assumptions?: string[];
  [key: string]: any; // Allow additional fields
}

export interface AssemblyLine {
  id: string;
  title: string;
  costType: 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim';
  qtyFormula: string;
  unit: string;
  baseUnitCost: number;
  defaultMarkupPct: number;
  vatApplicable: boolean;
  customerTextBlock?: string;
}

export interface Assembly {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  description: string;
  lines: AssemblyLine[];
}

export interface InternalCostingItem {
  id: string;
  itemType: 'material' | 'labour' | 'subcontract' | 'plant' | 'prelim';
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unitCost: number; // Internal cost
  unitPrice: number; // Selling price
  marginPercent: number;
  overheadPercent: number;
  contingencyPercent: number;
  vatRate: number;
  isProvisional: boolean;
  isPurchasable: boolean;
  isWorkOrderEligible: boolean;
  calculationTrace?: string;
  // New fields for assemblies and auto-rating
  isAutoRated?: boolean;
  isManualOverride?: boolean;
  assemblyId?: string;
  assemblyLineId?: string;
  qtyFormula?: string;
  sourceTokens?: Record<string, number>;
  isQtyLocked?: boolean;
}

export interface InternalCostingSection {
  id: string;
  title: string;
  items: InternalCostingItem[];
  notes?: string;
}

export interface InternalCosting {
  sections: InternalCostingSection[];
  subtotal: number;
  overhead: number;
  margin: number;
  contingency: number;
  vat: number;
  total: number;
  assumptions: string[];
}

export interface CustomerEstimateItem {
  id: string;
  title: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  lineTotal?: number;
  notes?: string;
}

export interface CustomerEstimateSection {
  id: string;
  title: string;
  items: CustomerEstimateItem[];
  sectionTotal?: number;
  notes?: string;
}

export interface CustomerEstimate {
  sections: CustomerEstimateSection[];
  subtotal: number;
  vat: number;
  total: number;
  provisionalSums?: number;
}

export interface VisibilitySettings {
  showSectionTotals: boolean;
  showVat: boolean;
  showTotalsWithVat: boolean;
  showTotalsWithoutVat: boolean;
  showProvisionalSums: boolean;
  showGrandTotalOnly: boolean;
  showDescriptions: boolean;
  showLabourItems: boolean;
  showMaterialItems: boolean;
  showLineTotals: boolean;
  showQuantities: boolean;
  showUnits: boolean;
  showNotes: boolean;
}

export interface EstimateBuilderAIEstimate {
  id: string;
  companyId: string;
  templateId: string;
  title: string;
  status: 'draft' | 'generated' | 'finalized';
  estimateBrief: EstimateBrief;
  internalCosting?: InternalCosting;
  customerEstimate?: CustomerEstimate;
  visibilitySettings: VisibilitySettings;
  clientId?: string;
  projectId?: string;
  opportunityId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  estimateId: string;
  supplierName?: string;
  supplierId?: string;
  poNumber?: string;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  deliveryAddress?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PurchaseOrderItem {
  id: string;
  poId: string;
  estimateItemId?: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  sortOrder: number;
}

export interface WorkOrder {
  id: string;
  companyId: string;
  estimateId: string;
  contractorName?: string;
  contractorId?: string;
  woNumber?: string;
  status: 'draft' | 'sent' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pricingMode: 'fixed' | 'schedule';
  fixedPrice?: number;
  scopeText?: string;
  notes?: string;
  items?: WorkOrderItem[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkOrderItem {
  id: string;
  woId: string;
  estimateItemId?: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  sortOrder: number;
}

export interface EstimateBriefContent {
  projectOverview: {
    template: string;
    location?: string;
    propertyType?: string;
    keySelections: Record<string, any>;
  };
  measurements: {
    floorAreaM2: number;
    wallAreaM2: number;
    roofAreaM2: number;
    perimeterM: number;
  };
  keySpecs: {
    roofType?: string;
    roofCovering?: string;
    wallFinish?: string;
    doorType?: string;
    rooflightsCount?: number;
    foundationsType?: string;
    heatingType?: string;
    electricsLevel?: string;
  };
  pricingBasis: {
    region: string;
    multiplier: number;
    overheadPct: number;
    marginPct: number;
    contingencyPct: number;
    vatPct: number;
  };
  provisionalSums: string[];
  risksUnknowns: string[];
}

export interface ContentBlock {
  id: string;
  type: 'scope' | 'note' | 'exclusion' | 'ps_wording';
  title: string;
  body: string;
  iconKey?: string;
  tags: string[];
  isSeed?: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  templateIds?: string[];
  conditions?: (answers: Record<string, any>) => boolean;
  description?: string;
  assemblyRefs: Array<{
    assemblyId: string;
    overrideQtyFormula?: string;
  }>;
}

export interface EstimateVersion {
  id: string;
  estimateId: string;
  versionNumber: number;
  snapshotJson: {
    answers: Record<string, any>;
    measurements?: EstimateMeasurements;
    rateSettings?: RateSettings;
    sections: InternalCostingSection[];
    visibilitySettings: VisibilitySettings;
    brief?: EstimateBriefContent;
  };
  createdAt: string;
  createdBy: string;
}

