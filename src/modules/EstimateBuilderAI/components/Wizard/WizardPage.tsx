// Wizard Page Component - Single page wizard with sticky summary

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { QuestionBlock } from './QuestionBlock';
import { DimensionsBlock } from './DimensionsBlock';
import { MeasurementsBlock } from './MeasurementsBlock';
import { LocationPropertiesModal, type LocationProperties } from './LocationPropertiesModal';
import { PropertyTypePropertiesModal, type PropertyTypeProperties } from './PropertyTypePropertiesModal';
import { SiteConditionsModal, type SiteConditionsProperties } from './SiteConditionsModal';
import { ScaffoldingModal, type ScaffoldingProperties } from './ScaffoldingModal';
import { HealthSafetyWelfareModal, type HealthSafetyWelfareProperties } from './HealthSafetyWelfareModal';
import { WallConstructionModal, type WallConstructionProperties } from './WallConstructionModal';
import { ProfessionalServicesModal, type ProfessionalServicesProperties } from './ProfessionalServicesModal';
import { FoundationsModal, type FoundationsProperties } from './FoundationsModal';
import { GroundFloorModal, type GroundFloorProperties } from './GroundFloorModal';
import { ExternalWallFinishModal, type ExternalWallFinishProperties } from './ExternalWallFinishModal';
import { RoofTypeModal, type RoofTypeProperties } from './RoofTypeModal';
import { RoofCoveringsModal, type RoofCoveringsProperties } from './RoofCoveringsModal';
import { InsulationModal, type InsulationProperties } from './InsulationModal';
import { FasciaSoffitRainwaterModal, type FasciaSoffitRainwaterProperties } from './FasciaSoffitRainwaterModal';
import { KnockThroughModal, type KnockThroughProperties } from './KnockThroughModal';
import { StructuralSteelsModal, type StructuralSteelsProperties } from './StructuralSteelsModal';
import { DoorsModal, type DoorsProperties } from './DoorsModal';
import { RooflightsModal, type RooflightsProperties } from './RooflightsModal';
import { HeatingModal, type HeatingProperties } from './HeatingModal';
import { ElectricsModal, type ElectricsProperties } from './ElectricsModal';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, HelpCircle, Settings } from 'lucide-react';
import type { EstimateBuilderTemplate, Question, QuestionStep, EstimateMeasurements } from '../../domain/types';
import { buildEstimateBrief } from '../../domain/briefBuilder';
import { formatLength, formatArea } from '../../utils/measurements';
import { useEstimateBuilderSettings } from '../../hooks/useEstimateBuilderSettings';

interface WizardPageProps {
  template: EstimateBuilderTemplate;
  answers: Record<string, any>;
  onAnswersChange: (answers: Record<string, any>) => void;
  onBack: () => void;
  onGenerate: (brief: ReturnType<typeof buildEstimateBrief>) => void;
  onOpenSettings?: () => void;
}

export function WizardPage({
  template,
  answers,
  onAnswersChange,
  onBack,
  onGenerate,
  onOpenSettings,
}: WizardPageProps) {
  // Load settings
  const { settings, isLoaded } = useEstimateBuilderSettings();
  
  // Location properties modal state
  const [showLocationPropertiesModal, setShowLocationPropertiesModal] = useState(false);
  // Property type properties modal state
  const [showPropertyTypePropertiesModal, setShowPropertyTypePropertiesModal] = useState(false);
  // Site conditions modal state
  const [showSiteConditionsModal, setShowSiteConditionsModal] = useState(false);
  // Scaffolding modal state
  const [showScaffoldingModal, setShowScaffoldingModal] = useState(false);
  // Health & Safety & Welfare modal state
  const [showHealthSafetyWelfareModal, setShowHealthSafetyWelfareModal] = useState(false);
  // Wall Construction modal state
  const [showWallConstructionModal, setShowWallConstructionModal] = useState(false);
  // Professional Services modal state
  const [showProfessionalServicesModal, setShowProfessionalServicesModal] = useState(false);
  // Foundations modal state
  const [showFoundationsModal, setShowFoundationsModal] = useState(false);
  // Ground Floor modal state
  const [showGroundFloorModal, setShowGroundFloorModal] = useState(false);
  // External Wall Finish modal state
  const [showExternalWallFinishModal, setShowExternalWallFinishModal] = useState(false);
  // Roof Type modal state
  const [showRoofTypeModal, setShowRoofTypeModal] = useState(false);
  // Roof Coverings modal state
  const [showRoofCoveringsModal, setShowRoofCoveringsModal] = useState(false);
  // Insulation modal state
  const [showInsulationModal, setShowInsulationModal] = useState(false);
  // Fascia Soffit Rainwater modal state
  const [showFasciaSoffitRainwaterModal, setShowFasciaSoffitRainwaterModal] = useState(false);
  // Knock Through modal state
  const [showKnockThroughModal, setShowKnockThroughModal] = useState(false);
  // Structural Steels modal state
  const [showStructuralSteelsModal, setShowStructuralSteelsModal] = useState(false);
  // Doors modal state
  const [showDoorsModal, setShowDoorsModal] = useState(false);
  // Rooflights modal state
  const [showRooflightsModal, setShowRooflightsModal] = useState(false);
  // Heating modal state
  const [showHeatingModal, setShowHeatingModal] = useState(false);
  // Electrics modal state
  const [showElectricsModal, setShowElectricsModal] = useState(false);
  
  // Initialize with first step expanded
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (template.steps[0]?.id) {
      initial.add(template.steps[0].id);
    }
    return initial;
  });
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track user scrolling to prevent auto-scroll interference
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScrollStart = () => {
      isUserScrollingRef.current = true;
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      // Reset flag after scroll ends
      userScrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    scrollContainer.addEventListener('wheel', handleScrollStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleScrollStart, { passive: true });

    return () => {
      scrollContainer.removeEventListener('wheel', handleScrollStart);
      scrollContainer.removeEventListener('touchmove', handleScrollStart);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollAnimationFrameRef.current) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // Helper to check visibility with updated answers
  const isQuestionVisible = useCallback((question: Question, currentAnswers: Record<string, any> = answers): boolean => {
    if (!question.dependencies || question.dependencies.length === 0) {
      return true;
    }

    // Special case: steelsStructural should show if EITHER knockThroughSupport OR knockThroughSupportExisting is set
    if (question.id === 'steelsStructural') {
      const support = currentAnswers['knockThroughSupport'];
      const supportExisting = currentAnswers['knockThroughSupportExisting'];
      return (support === 'steel' || support === 'lintel') || 
             (supportExisting === 'steel' || supportExisting === 'lintel');
    }

    return question.dependencies.every((dep) => {
      const answerValue = currentAnswers[dep.questionId];
      
      // Handle array answers (multi-select)
      if (Array.isArray(answerValue)) {
        if (dep.condition === 'in') {
          const values = Array.isArray(dep.value) ? dep.value : [dep.value];
          return answerValue.some((val) => values.includes(val));
        }
        if (dep.condition === 'notIn') {
          const values = Array.isArray(dep.value) ? dep.value : [dep.value];
          return !answerValue.some((val) => values.includes(val));
        }
        if (dep.condition === 'equals') {
          return answerValue.includes(dep.value);
        }
        if (dep.condition === 'notEquals') {
          return !answerValue.includes(dep.value);
        }
      }
      
      // Handle single value answers
      if (dep.condition === 'equals') {
        return answerValue === dep.value;
      }
      if (dep.condition === 'notEquals') {
        return answerValue !== dep.value;
      }
      if (dep.condition === 'in') {
        const values = Array.isArray(dep.value) ? dep.value : [dep.value];
        return values.includes(answerValue);
      }
      if (dep.condition === 'notIn') {
        const values = Array.isArray(dep.value) ? dep.value : [dep.value];
        return !values.includes(answerValue);
      }
      return true;
    });
  }, [answers]);

  // Check if step is complete
  const isStepComplete = useCallback((step: QuestionStep): boolean => {
    // Special handling for dimensions step
    if (step.id === 'step-dimensions') {
      const dimensions = answers.dimensions as { length: number; width: number } | undefined;
      return !!(
        dimensions &&
        dimensions.length > 0 &&
        dimensions.width > 0
      );
    }
    
    // Special handling for measurements step
    if (step.id === 'step-measurements') {
      const measurements = answers.measurements as EstimateMeasurements | undefined;
      return !!(
        measurements &&
        measurements.externalLengthM > 0 &&
        measurements.externalWidthM > 0 &&
        measurements.floorAreaM2 > 0
      );
    }

    return step.questions.every((q) => {
      // If question is not visible, it doesn't need to be answered
      if (!isQuestionVisible(q, answers)) return true;
      
      // If question is visible and has dependencies, it should be treated as required
      // (even if marked as required: false, because it's shown for a reason)
      const isEffectivelyRequired = q.required || (q.dependencies && q.dependencies.length > 0);
      
      if (!isEffectivelyRequired) return true;
      
      const answer = answers[q.id];
      if (q.type === 'multiSelect') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== '';
    });
  }, [answers, isQuestionVisible]);

  // Check if all required questions are answered
  const canGenerate = useMemo(() => {
    return template.steps.every((step) => isStepComplete(step));
  }, [template.steps, isStepComplete]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const allQuestions = template.steps.flatMap((s) => s.questions);
    const visibleQuestions = allQuestions.filter((q) => isQuestionVisible(q));
    const requiredQuestions = visibleQuestions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter((q) => {
      const answer = answers[q.id];
      if (q.type === 'multiSelect') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== '';
    });
    return requiredQuestions.length > 0
      ? Math.round((answeredRequired.length / requiredQuestions.length) * 100)
      : 100;
  }, [template.steps, answers, isQuestionVisible]);

  const handleAnswerChange = (questionId: string, value: string | number | boolean | (string | number | boolean)[] | Record<string, any>) => {
    const newAnswers = {
      ...answers,
      [questionId]: value,
    };

    // Auto-calculate steel/lintel length when knock-through width changes
    // Length = width + 0.3m (150mm bearing each end)
    if (questionId === 'knockThroughWidth' || questionId === 'knockThroughWidthExisting') {
      const width = typeof value === 'number' ? value : parseFloat(String(value));
      if (!isNaN(width) && width > 0) {
        const calculatedLength = width + 0.3; // 150mm each end = 300mm total
        
        // Set the corresponding length field
        if (questionId === 'knockThroughWidth') {
          if (newAnswers.knockThroughSupport === 'steel') {
            newAnswers.knockThroughSteelLength = calculatedLength;
          } else if (newAnswers.knockThroughSupport === 'lintel') {
            newAnswers.knockThroughLintelLength = calculatedLength;
          }
        } else if (questionId === 'knockThroughWidthExisting') {
          if (newAnswers.knockThroughSupportExisting === 'steel') {
            newAnswers.knockThroughSteelLengthExisting = calculatedLength;
          } else if (newAnswers.knockThroughSupportExisting === 'lintel') {
            newAnswers.knockThroughLintelLengthExisting = calculatedLength;
          }
        }
      }
    }

    // Auto-calculate length when support type changes (if width already exists)
    if (questionId === 'knockThroughSupport' || questionId === 'knockThroughSupportExisting') {
      const widthId = questionId === 'knockThroughSupport' ? 'knockThroughWidth' : 'knockThroughWidthExisting';
      const width = newAnswers[widthId] || answers[widthId];
      const widthValue = typeof width === 'number' ? width : parseFloat(String(width));
      
      if (!isNaN(widthValue) && widthValue > 0) {
        const calculatedLength = widthValue + 0.3; // 150mm each end = 300mm total
        
        if (questionId === 'knockThroughSupport') {
          if (value === 'steel') {
            newAnswers.knockThroughSteelLength = calculatedLength;
          } else if (value === 'lintel') {
            newAnswers.knockThroughLintelLength = calculatedLength;
          }
        } else if (questionId === 'knockThroughSupportExisting') {
          if (value === 'steel') {
            newAnswers.knockThroughSteelLengthExisting = calculatedLength;
          } else if (value === 'lintel') {
            newAnswers.knockThroughLintelLengthExisting = calculatedLength;
          }
        }
      }
    }

    onAnswersChange(newAnswers);

    // Find the current step - handle special cases for dimensions and measurements
    let currentStepIndex = -1;
    let currentStep: QuestionStep | null = null;
    
    if (questionId === 'dimensions') {
      // Special handling for dimensions step
      currentStepIndex = template.steps.findIndex((step) => step.id === 'step-dimensions');
      if (currentStepIndex >= 0) {
        currentStep = template.steps[currentStepIndex];
      }
    } else if (questionId === 'measurements') {
      // Special handling for measurements step
      currentStepIndex = template.steps.findIndex((step) => step.id === 'step-measurements');
      if (currentStepIndex >= 0) {
        currentStep = template.steps[currentStepIndex];
      }
    } else {
      // Regular question handling
      currentStepIndex = template.steps.findIndex((step) =>
        step.questions.some((q) => q.id === questionId)
      );
      if (currentStepIndex >= 0) {
        currentStep = template.steps[currentStepIndex];
      }
    }
    
    if (currentStepIndex >= 0 && currentStep) {
      // Check if current step is now complete with the new answer
      const isCurrentStepComplete = (() => {
        // Special handling for dimensions step
        if (currentStep.id === 'step-dimensions') {
          const dimensions = newAnswers.dimensions as { length: number; width: number } | undefined;
          return !!(
            dimensions &&
            dimensions.length > 0 &&
            dimensions.width > 0
          );
        }
        
        // Special handling for measurements step
        if (currentStep.id === 'step-measurements') {
          const measurements = newAnswers.measurements as EstimateMeasurements | undefined;
          return !!(
            measurements &&
            measurements.externalLengthM > 0 &&
            measurements.externalWidthM > 0 &&
            measurements.floorAreaM2 > 0
          );
        }

        return currentStep.questions.every((q) => {
          // If question is not visible, it doesn't need to be answered
          if (!isQuestionVisible(q, newAnswers)) return true;
          
          // If question is visible and has dependencies, it should be treated as required
          // (even if marked as required: false, because it's shown for a reason)
          const isEffectivelyRequired = q.required || (q.dependencies && q.dependencies.length > 0);
          
          if (!isEffectivelyRequired) return true;
          
          const answer = newAnswers[q.id];
          if (q.type === 'multiSelect') {
            return Array.isArray(answer) && answer.length > 0;
          }
          return answer !== undefined && answer !== null && answer !== '';
        });
      })();

      // Auto-expansion disabled - next section will only expand when user clicks "Next" button
      // The handleNextStep function handles expansion and scrolling
    }
  };

  const handleStepToggle = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleNextStep = useCallback((currentStepId: string) => {
    const currentStepIndex = template.steps.findIndex((step) => step.id === currentStepId);
    if (currentStepIndex < 0 || currentStepIndex >= template.steps.length - 1) {
      return; // No next step
    }

    const nextStep = template.steps[currentStepIndex + 1];
    
    // Collapse current step
    setExpandedSteps((prev) => {
      const newExpanded = new Set(prev);
      newExpanded.delete(currentStepId);
      return newExpanded;
    });

    // Longer delay to allow collapse animation to complete smoothly
    setTimeout(() => {
      // Expand next step
      setExpandedSteps((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.add(nextStep.id);
        return newExpanded;
      });

      // Wait for expansion to start, then scroll smoothly
      setTimeout(() => {
        requestAnimationFrame(() => {
          const nextStepElement = stepRefs.current[nextStep.id];
          if (nextStepElement && scrollContainerRef.current) {
            const containerRect = scrollContainerRef.current.getBoundingClientRect();
            const elementRect = nextStepElement.getBoundingClientRect();
            const scrollTop = scrollContainerRef.current.scrollTop;
            const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 20; // 20px offset from top

            // Use smooth scroll with a longer duration via CSS
            scrollContainerRef.current.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth',
            });
          }
        });
      }, 200); // Wait for expansion animation to start
    }, 400); // Wait for collapse animation to complete (increased from 150ms)
  }, [template.steps]);

  const handleGenerate = () => {
    const brief = buildEstimateBrief(template.id, answers);
    onGenerate(brief);
  };

  // Build sectioned summary for preview
  const sectionedSummary = useMemo(() => {
    type SummarySection = {
      title: string;
      items: Array<{ label: string; value: string }>;
    };
    
    // Helper function to capitalize strings (handles kebab-case, lowercase, etc.)
    const capitalizeString = (str: string): string => {
      if (!str) return str;
      // Replace hyphens/underscores with spaces, then capitalize each word
      return str
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const sections: SummarySection[] = [];
    
    // Declare variables at the top for use throughout the function
    const propertyTypeProperties = answers.propertyTypeProperties as PropertyTypeProperties | undefined;
    const locationProperties = answers.locationProperties as LocationProperties | undefined;
    const siteConditionsProperties = answers.siteConditionsProperties as SiteConditionsProperties | undefined;
    
    // Property Type Properties Section (includes address)
    if (propertyTypeProperties) {
      const propertyItems: Array<{ label: string; value: string }> = [];
      
      // Property Type (capitalize properly)
      if (answers.propertyType) {
        propertyItems.push({ label: 'Property Type', value: capitalizeString(String(answers.propertyType)) });
      }
      
      // Property details
      if (propertyTypeProperties.propertyAge) {
        propertyItems.push({ label: 'Property Age', value: propertyTypeProperties.propertyAge });
      }
      if (propertyTypeProperties.numberOfFloors) {
        propertyItems.push({ label: 'Number of Floors', value: String(propertyTypeProperties.numberOfFloors) });
      }
      if (propertyTypeProperties.numberOfBedrooms) {
        propertyItems.push({ label: 'Number of Bedrooms', value: String(propertyTypeProperties.numberOfBedrooms) });
      }
      if (propertyTypeProperties.numberOfBathrooms) {
        propertyItems.push({ label: 'Number of Bathrooms', value: String(propertyTypeProperties.numberOfBathrooms) });
      }
      
      // Address fields
      if (propertyTypeProperties.addressLine1) {
        propertyItems.push({ label: 'Address Line 1', value: propertyTypeProperties.addressLine1 });
      }
      if (propertyTypeProperties.addressLine2) {
        propertyItems.push({ label: 'Address Line 2', value: propertyTypeProperties.addressLine2 });
      }
      if (propertyTypeProperties.addressLine3) {
        propertyItems.push({ label: 'Address Line 3', value: propertyTypeProperties.addressLine3 });
      }
      if (propertyTypeProperties.townCity) {
        propertyItems.push({ label: 'Town/City', value: propertyTypeProperties.townCity });
      }
      if (propertyTypeProperties.county) {
        propertyItems.push({ label: 'County', value: propertyTypeProperties.county });
      }
      if (propertyTypeProperties.postcode) {
        propertyItems.push({ label: 'Postcode', value: propertyTypeProperties.postcode });
      }
      if (!propertyTypeProperties.addressLine1 && propertyTypeProperties.address) {
        propertyItems.push({ label: 'Address', value: propertyTypeProperties.address });
      }
      if (propertyTypeProperties.notes) {
        propertyItems.push({ label: 'Property Notes', value: propertyTypeProperties.notes });
      }
      
      if (propertyItems.length > 0) {
        sections.push({ title: 'Property Type', items: propertyItems });
      }
    }
    
    // Location Properties Section (Extension Location)
    if (locationProperties) {
      const locationItems: Array<{ label: string; value: string }> = [];
      if (locationProperties.extensionLocation) {
        locationItems.push({ label: 'Extension Location', value: locationProperties.extensionLocation });
      }
      if (locationProperties.extensionPosition) {
        locationItems.push({ label: 'Extension Position', value: locationProperties.extensionPosition });
      }
      if (locationProperties.distanceFromBoundary) {
        locationItems.push({ label: 'Distance from Boundary', value: locationProperties.distanceFromBoundary });
      }
      if (locationProperties.adjacentProperties) {
        locationItems.push({ label: 'Adjacent Properties', value: locationProperties.adjacentProperties });
      }
      if (locationProperties.notes) {
        locationItems.push({ label: 'Location Notes', value: locationProperties.notes });
      }
      if (locationItems.length > 0) {
        sections.push({ title: 'Extension Location', items: locationItems });
      }
    }
    
    // Site Conditions and Access Section
    if (siteConditionsProperties) {
      const siteItems: Array<{ label: string; value: string }> = [];
      if (siteConditionsProperties.siteAccess) {
        siteItems.push({ label: 'Site Access', value: siteConditionsProperties.siteAccess });
      }
      if (siteConditionsProperties.siteConstraints) {
        siteItems.push({ label: 'Site Constraints', value: siteConditionsProperties.siteConstraints });
      }
      if (siteConditionsProperties.existingServices) {
        siteItems.push({ label: 'Existing Services', value: siteConditionsProperties.existingServices });
      }
      if (siteConditionsProperties.groundConditions) {
        siteItems.push({ label: 'Ground Conditions', value: siteConditionsProperties.groundConditions });
      }
      if (siteConditionsProperties.notes) {
        siteItems.push({ label: 'Site Notes', value: siteConditionsProperties.notes });
      }
      if (siteItems.length > 0) {
        sections.push({ title: 'Site Conditions and Access', items: siteItems });
      }
    }

    // Scaffolding Section
    const scaffoldingProperties = answers.scaffoldingProperties as ScaffoldingProperties | undefined;
    if (scaffoldingProperties) {
      const scaffoldingItems: Array<{ label: string; value: string }> = [];
      if (scaffoldingProperties.scaffoldingType) {
        scaffoldingItems.push({ label: 'Scaffolding Type', value: scaffoldingProperties.scaffoldingType });
      }
      if (scaffoldingProperties.height) {
        scaffoldingItems.push({ label: 'Height', value: `${scaffoldingProperties.height}m` });
      }
      if (scaffoldingProperties.length) {
        scaffoldingItems.push({ label: 'Length', value: `${scaffoldingProperties.length}m` });
      }
      if (scaffoldingProperties.width) {
        scaffoldingItems.push({ label: 'Width', value: `${scaffoldingProperties.width}m` });
      }
      if (scaffoldingProperties.levels) {
        scaffoldingItems.push({ label: 'Number of Levels', value: String(scaffoldingProperties.levels) });
      }
      if (scaffoldingProperties.accessRequirements) {
        scaffoldingItems.push({ label: 'Access Requirements', value: scaffoldingProperties.accessRequirements });
      }
      if (scaffoldingProperties.specialRequirements) {
        scaffoldingItems.push({ label: 'Special Requirements', value: scaffoldingProperties.specialRequirements });
      }
      if (scaffoldingProperties.duration) {
        scaffoldingItems.push({ label: 'Duration', value: `${scaffoldingProperties.duration} weeks` });
      }
      if (scaffoldingProperties.notes) {
        scaffoldingItems.push({ label: 'Notes', value: scaffoldingProperties.notes });
      }
      if (scaffoldingItems.length > 0) {
        sections.push({ title: 'Scaffolding', items: scaffoldingItems });
      }
    }

    // Health & Safety & Welfare Section
    const healthSafetyWelfareProperties = answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties | undefined;
    if (healthSafetyWelfareProperties) {
      const hswItems: Array<{ label: string; value: string }> = [];
      
      // Site Setup
      if (healthSafetyWelfareProperties.siteSetupCost) {
        hswItems.push({ label: 'Site Setup Cost', value: `£${healthSafetyWelfareProperties.siteSetupCost.toFixed(2)}` });
      }
      
      // First Aid
      if (healthSafetyWelfareProperties.firstAidKitRequired) {
        hswItems.push({ label: 'First Aid Kit', value: healthSafetyWelfareProperties.firstAidKitType || 'Required' });
        if (healthSafetyWelfareProperties.firstAidKitCost) {
          hswItems.push({ label: 'First Aid Kit Cost', value: `£${healthSafetyWelfareProperties.firstAidKitCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.firstAidTrainingRequired) {
        hswItems.push({ label: 'First Aid Training', value: `${healthSafetyWelfareProperties.firstAidPersonnel || 1} trained first aider(s)` });
        if (healthSafetyWelfareProperties.firstAidTrainingCost) {
          hswItems.push({ label: 'First Aid Training Cost', value: `£${healthSafetyWelfareProperties.firstAidTrainingCost.toFixed(2)}` });
        }
      }
      
      // Welfare Facilities
      if (healthSafetyWelfareProperties.welfareUnitRequired) {
        hswItems.push({ label: 'Welfare Unit', value: healthSafetyWelfareProperties.welfareUnitType || 'Required' });
        if (healthSafetyWelfareProperties.welfareUnitCost) {
          hswItems.push({ label: 'Welfare Unit Cost', value: `£${healthSafetyWelfareProperties.welfareUnitCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.toiletFacilities) {
        hswItems.push({ label: 'Toilet Facilities', value: healthSafetyWelfareProperties.toiletFacilities });
        if (healthSafetyWelfareProperties.toiletFacilitiesCost) {
          hswItems.push({ label: 'Toilet Facilities Cost', value: `£${healthSafetyWelfareProperties.toiletFacilitiesCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.handWashingFacilities) {
        hswItems.push({ label: 'Hand Washing Facilities', value: 'Yes' });
        if (healthSafetyWelfareProperties.handWashingCost) {
          hswItems.push({ label: 'Hand Washing Cost', value: `£${healthSafetyWelfareProperties.handWashingCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.drinkingWater) {
        hswItems.push({ label: 'Drinking Water', value: 'Yes' });
        if (healthSafetyWelfareProperties.drinkingWaterCost) {
          hswItems.push({ label: 'Drinking Water Cost', value: `£${healthSafetyWelfareProperties.drinkingWaterCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.restArea) {
        hswItems.push({ label: 'Rest Area', value: 'Yes' });
        if (healthSafetyWelfareProperties.restAreaCost) {
          hswItems.push({ label: 'Rest Area Cost', value: `£${healthSafetyWelfareProperties.restAreaCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.dryingRoom) {
        hswItems.push({ label: 'Drying Room', value: 'Yes' });
        if (healthSafetyWelfareProperties.dryingRoomCost) {
          hswItems.push({ label: 'Drying Room Cost', value: `£${healthSafetyWelfareProperties.dryingRoomCost.toFixed(2)}` });
        }
      }
      
      // Safety Equipment
      if (healthSafetyWelfareProperties.safetySignage) {
        hswItems.push({ label: 'Safety Signage', value: 'Yes' });
        if (healthSafetyWelfareProperties.safetySignageCost) {
          hswItems.push({ label: 'Safety Signage Cost', value: `£${healthSafetyWelfareProperties.safetySignageCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.personalProtectiveEquipment) {
        hswItems.push({ label: 'PPE', value: 'Yes' });
        if (healthSafetyWelfareProperties.ppeCost) {
          hswItems.push({ label: 'PPE Cost', value: `£${healthSafetyWelfareProperties.ppeCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.fireSafetyEquipment) {
        hswItems.push({ label: 'Fire Safety Equipment', value: 'Yes' });
        if (healthSafetyWelfareProperties.fireSafetyCost) {
          hswItems.push({ label: 'Fire Safety Cost', value: `£${healthSafetyWelfareProperties.fireSafetyCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.emergencyProcedures) {
        hswItems.push({ label: 'Emergency Procedures', value: 'Yes' });
        if (healthSafetyWelfareProperties.emergencyProceduresCost) {
          hswItems.push({ label: 'Emergency Procedures Cost', value: `£${healthSafetyWelfareProperties.emergencyProceduresCost.toFixed(2)}` });
        }
      }
      
      // Site Security
      if (healthSafetyWelfareProperties.siteSecurity) {
        hswItems.push({ label: 'Site Security', value: healthSafetyWelfareProperties.siteSecurityType || 'Yes' });
        if (healthSafetyWelfareProperties.siteSecurityCost) {
          hswItems.push({ label: 'Site Security Cost', value: `£${healthSafetyWelfareProperties.siteSecurityCost.toFixed(2)}` });
        }
      }
      
      // Risk Assessment & Method Statements
      if (healthSafetyWelfareProperties.riskAssessmentRequired) {
        hswItems.push({ label: 'Risk Assessment', value: 'Required' });
        if (healthSafetyWelfareProperties.riskAssessmentCost) {
          hswItems.push({ label: 'Risk Assessment Cost', value: `£${healthSafetyWelfareProperties.riskAssessmentCost.toFixed(2)}` });
        }
      }
      if (healthSafetyWelfareProperties.methodStatementsRequired) {
        hswItems.push({ label: 'Method Statements', value: 'Required' });
        if (healthSafetyWelfareProperties.methodStatementsCost) {
          hswItems.push({ label: 'Method Statements Cost', value: `£${healthSafetyWelfareProperties.methodStatementsCost.toFixed(2)}` });
        }
      }
      
      // Additional Costs
      if (healthSafetyWelfareProperties.additionalCosts) {
        hswItems.push({ label: 'Additional Costs', value: `£${healthSafetyWelfareProperties.additionalCosts.toFixed(2)}` });
        if (healthSafetyWelfareProperties.additionalCostsNotes) {
          hswItems.push({ label: 'Additional Costs Notes', value: healthSafetyWelfareProperties.additionalCostsNotes });
        }
      }
      
      if (healthSafetyWelfareProperties.notes) {
        hswItems.push({ label: 'Notes', value: healthSafetyWelfareProperties.notes });
      }
      
      if (hswItems.length > 0) {
        sections.push({ title: 'Health & Safety & Welfare', items: hswItems });
      }
    }

    // Professional Services Section
    const professionalItems: Array<{ label: string; value: string }> = [];
    if (answers.planningRequired) {
      professionalItems.push({ label: 'Planning', value: capitalizeString(String(answers.planningRequired)) });
      if (answers.planningApplicationFee && typeof answers.planningApplicationFee === 'number' && answers.planningApplicationFee > 0) {
        professionalItems.push({ label: 'Planning App Fee', value: `£${answers.planningApplicationFee.toFixed(2)}` });
      }
      if (answers.planningConsultantFee && typeof answers.planningConsultantFee === 'number' && answers.planningConsultantFee > 0) {
        professionalItems.push({ label: 'Planning Consultant', value: `£${answers.planningConsultantFee.toFixed(2)}` });
      }
    }
    if (answers.buildingControlRequired) {
      professionalItems.push({ label: 'Building Control', value: capitalizeString(String(answers.buildingControlRequired)) });
      if (answers.buildingControlType) {
        professionalItems.push({ label: 'BC Type', value: capitalizeString(String(answers.buildingControlType)) });
      }
      if (answers.buildingControlApplicationFee && typeof answers.buildingControlApplicationFee === 'number' && answers.buildingControlApplicationFee > 0) {
        professionalItems.push({ label: 'BC App Fee', value: `£${answers.buildingControlApplicationFee.toFixed(2)}` });
      }
      if (answers.buildingControlInspectionFee && typeof answers.buildingControlInspectionFee === 'number' && answers.buildingControlInspectionFee > 0) {
        professionalItems.push({ label: 'BC Inspection Fee', value: `£${answers.buildingControlInspectionFee.toFixed(2)}` });
      }
    }
    if (answers.structuralEngineerRequired) {
      professionalItems.push({ label: 'Structural Engineer', value: capitalizeString(String(answers.structuralEngineerRequired)) });
      if (answers.structuralEngineerFee && typeof answers.structuralEngineerFee === 'number' && answers.structuralEngineerFee > 0) {
        professionalItems.push({ label: 'SE Fee', value: `£${answers.structuralEngineerFee.toFixed(2)}` });
      }
    }
    if (answers.partyWallRequired) {
      professionalItems.push({ label: 'Party Wall', value: capitalizeString(String(answers.partyWallRequired)) });
      if (answers.partyWallSurveyorFee && typeof answers.partyWallSurveyorFee === 'number' && answers.partyWallSurveyorFee > 0) {
        professionalItems.push({ label: 'PW Surveyor Fee', value: `£${answers.partyWallSurveyorFee.toFixed(2)}` });
      }
      if (answers.partyWallNeighborSurveyorFee && typeof answers.partyWallNeighborSurveyorFee === 'number' && answers.partyWallNeighborSurveyorFee > 0) {
        professionalItems.push({ label: 'PW Neighbor Fee', value: `£${answers.partyWallNeighborSurveyorFee.toFixed(2)}` });
      }
    }
    if (answers.architectRequired) {
      professionalItems.push({ label: 'Architect/Designer', value: capitalizeString(String(answers.architectRequired)) });
      if (answers.architectFee && typeof answers.architectFee === 'number' && answers.architectFee > 0) {
        professionalItems.push({ label: 'Architect Fee', value: `£${answers.architectFee.toFixed(2)}` });
      }
    }
    if (answers.otherProfessionalServices) {
      professionalItems.push({ label: 'Other Services', value: capitalizeString(String(answers.otherProfessionalServices)) });
      if (answers.otherProfessionalServicesFee && typeof answers.otherProfessionalServicesFee === 'number' && answers.otherProfessionalServicesFee > 0) {
        professionalItems.push({ label: 'Other Services Fee', value: `£${answers.otherProfessionalServicesFee.toFixed(2)}` });
      }
    }
    if (professionalItems.length > 0) {
      sections.push({ title: 'Professional Services', items: professionalItems });
    }
    
    // Dimensions Section
    const dimensionsItems: Array<{ label: string; value: string }> = [];
    const dimensions = answers.dimensions as { 
      length?: number; 
      width?: number; 
    } | undefined;
    
    if (dimensions?.length) {
      dimensionsItems.push({ label: 'Extension Depth', value: `${dimensions.length.toFixed(2)}m` });
    }
    if (dimensions?.width) {
      dimensionsItems.push({ label: 'Extension Width', value: `${dimensions.width.toFixed(2)}m` });
    }
    
    const measurements = answers.measurements as EstimateMeasurements | undefined;
    if (measurements) {
      if (measurements.floorAreaM2 > 0) {
        dimensionsItems.push({ label: 'External Footprint', value: `${measurements.floorAreaM2.toFixed(2)}m²` });
      }
      if (measurements.internalFloorAreaM2 && measurements.internalFloorAreaM2 > 0) {
        dimensionsItems.push({ label: 'Internal Floor Area', value: `${measurements.internalFloorAreaM2.toFixed(2)}m²` });
      }
    }
    if (dimensionsItems.length > 0) {
      sections.push({ title: 'Dimensions', items: dimensionsItems });
    }
    
    // Structure Section
    const structureItems: Array<{ label: string; value: string }> = [];
    if (answers.foundationsType) {
      structureItems.push({ label: 'Foundations Type', value: capitalizeString(String(answers.foundationsType)) });
    }
    if (answers.foundationLength) {
      const length = typeof answers.foundationLength === 'number' ? answers.foundationLength : parseFloat(String(answers.foundationLength));
      if (!isNaN(length) && length > 0) {
        structureItems.push({ label: 'Foundation Length', value: `${length.toFixed(2)}m` });
      }
    }
    if (answers.foundationWidth) {
      const width = typeof answers.foundationWidth === 'number' ? answers.foundationWidth : parseFloat(String(answers.foundationWidth));
      if (!isNaN(width) && width > 0) {
        structureItems.push({ label: 'Foundation Width', value: `${width}mm` });
      }
    }
    if (answers.foundationDepth) {
      const depth = typeof answers.foundationDepth === 'number' ? answers.foundationDepth : parseFloat(String(answers.foundationDepth));
      if (!isNaN(depth) && depth > 0) {
        structureItems.push({ label: 'Foundation Depth', value: `${depth}mm` });
      }
    }
    if (answers.foundationLength && answers.foundationWidth && answers.foundationDepth) {
      const lengthM = typeof answers.foundationLength === 'number' ? answers.foundationLength : parseFloat(String(answers.foundationLength));
      const widthMM = typeof answers.foundationWidth === 'number' ? answers.foundationWidth : parseFloat(String(answers.foundationWidth));
      const depthMM = typeof answers.foundationDepth === 'number' ? answers.foundationDepth : parseFloat(String(answers.foundationDepth));
      if (!isNaN(lengthM) && !isNaN(widthMM) && !isNaN(depthMM) && lengthM > 0 && widthMM > 0 && depthMM > 0) {
        const widthM = widthMM / 1000;
        const depthM = depthMM / 1000;
        const volumeM3 = lengthM * widthM * depthM;
        structureItems.push({ label: 'Foundation Volume', value: `${volumeM3.toFixed(2)}m³` });
      }
    }
    if (answers.groundFloorType) {
      structureItems.push({ label: 'Ground Floor', value: capitalizeString(String(answers.groundFloorType)) });
    }
    if (answers.ceilingHeight) {
      const height = typeof answers.ceilingHeight === 'number' ? answers.ceilingHeight : parseFloat(String(answers.ceilingHeight));
      if (!isNaN(height) && height > 0) {
        structureItems.push({ label: 'Ceiling Height', value: `${height.toFixed(2)}m` });
      }
    }
    if (answers.wallConstructionType) {
      structureItems.push({ label: 'Wall Construction', value: capitalizeString(String(answers.wallConstructionType)) });
    }
    if (answers.cavitySize) {
      structureItems.push({ label: 'Cavity Size', value: `${answers.cavitySize}mm` });
    }
    if (answers.cavityType) {
      structureItems.push({ label: 'Cavity Type', value: capitalizeString(String(answers.cavityType)) });
    }
    if (answers.wallInsulationThickness) {
      structureItems.push({ label: 'Insulation Thickness', value: `${answers.wallInsulationThickness}mm` });
    }
    if (answers.residualCavity) {
      structureItems.push({ label: 'Residual Cavity', value: `${answers.residualCavity}mm` });
    }
    if (answers.wallInsulationType) {
      structureItems.push({ label: 'Wall Insulation Type', value: capitalizeString(String(answers.wallInsulationType)) });
    }
    if (answers.timberFrameInsulationType) {
      structureItems.push({ label: 'Timber Frame Insulation', value: capitalizeString(String(answers.timberFrameInsulationType)) });
    }
    if (answers.timberFrameInsulationThickness) {
      structureItems.push({ label: 'Timber Frame Insulation Thickness', value: `${answers.timberFrameInsulationThickness}mm` });
    }
    if (structureItems.length > 0) {
      sections.push({ title: 'Structure', items: structureItems });
    }
    
    // Features Section
    const featuresItems: Array<{ label: string; value: string }> = [];
    if (answers.knockThrough !== undefined) {
      const knockThroughValue = answers.knockThrough === true ? 'Yes' : 
                                answers.knockThrough === 'existing' ? 'Yes - Existing Alteration' : 
                                'No';
      featuresItems.push({ label: 'Knock-Through', value: knockThroughValue });
    }
    if (answers.existingOpeningAction) {
      featuresItems.push({ label: 'Existing Opening', value: capitalizeString(String(answers.existingOpeningAction)) });
    }
    if (answers.knockThroughType) {
      featuresItems.push({ label: 'Knock-Through Type', value: capitalizeString(String(answers.knockThroughType)) });
    }
    if (answers.knockThroughSupport) {
      featuresItems.push({ label: 'Knock-Through Support', value: String(answers.knockThroughSupport) });
    }
    const knockThroughWidth = answers.knockThroughWidth || answers.knockThroughWidthExisting;
    const knockThroughHeight = answers.knockThroughHeight || answers.knockThroughHeightExisting;
    if (knockThroughWidth && knockThroughHeight) {
      const width = typeof knockThroughWidth === 'number' ? knockThroughWidth : parseFloat(String(knockThroughWidth));
      const height = typeof knockThroughHeight === 'number' ? knockThroughHeight : parseFloat(String(knockThroughHeight));
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        const area = (width * height).toFixed(2);
        featuresItems.push({ label: 'Knock-Through Size', value: `${width.toFixed(2)}m × ${height.toFixed(2)}m (${area}m²)` });
      }
    } else if (knockThroughWidth) {
      const width = typeof knockThroughWidth === 'number' ? knockThroughWidth : parseFloat(String(knockThroughWidth));
      if (!isNaN(width) && width > 0) {
        featuresItems.push({ label: 'Knock-Through Width', value: `${width.toFixed(2)}m` });
      }
    } else if (knockThroughHeight) {
      const height = typeof knockThroughHeight === 'number' ? knockThroughHeight : parseFloat(String(knockThroughHeight));
      if (!isNaN(height) && height > 0) {
        featuresItems.push({ label: 'Knock-Through Height', value: `${height.toFixed(2)}m` });
      }
    }
    if (answers.steelsStructural && Array.isArray(answers.steelsStructural) && answers.steelsStructural.length > 0) {
      featuresItems.push({ label: 'Steels & Structural', value: answers.steelsStructural.map(s => capitalizeString(String(s))).join(', ') });
    }
    if (answers.roofType) {
      featuresItems.push({ label: 'Roof Type', value: capitalizeString(String(answers.roofType)) });
    }
    if (answers.roofSubType) {
      featuresItems.push({ label: 'Roof Sub-Type', value: capitalizeString(String(answers.roofSubType)) });
    }
    if (answers.roofCovering) {
      featuresItems.push({ label: 'Roof Covering', value: capitalizeString(String(answers.roofCovering)) });
    }
    if (answers.fasciaType) {
      featuresItems.push({ label: 'Fascia', value: capitalizeString(String(answers.fasciaType)) });
    }
    if (answers.fasciaDepth) {
      featuresItems.push({ label: 'Fascia Depth', value: `${answers.fasciaDepth}mm` });
    }
    if (answers.soffitType) {
      featuresItems.push({ label: 'Soffit', value: capitalizeString(String(answers.soffitType)) });
    }
    if (answers.bargeboardType) {
      featuresItems.push({ label: 'Bargeboard', value: capitalizeString(String(answers.bargeboardType)) });
    }
    if (answers.gutterType) {
      const gutterValue = answers.gutterSize 
        ? `${capitalizeString(String(answers.gutterType))} (${answers.gutterSize})`
        : capitalizeString(String(answers.gutterType));
      featuresItems.push({ label: 'Gutter', value: gutterValue });
    }
    if (answers.downpipeType) {
      const downpipeValue = answers.downpipeSize 
        ? `${capitalizeString(String(answers.downpipeType))} (${answers.downpipeSize})`
        : capitalizeString(String(answers.downpipeType));
      featuresItems.push({ label: 'Downpipe', value: downpipeValue });
    }
    if (answers.wallFinish) {
      featuresItems.push({ label: 'Wall Finish', value: capitalizeString(String(answers.wallFinish)) });
    }
    if (answers.doorType) {
      featuresItems.push({ label: 'Door Type', value: capitalizeString(String(answers.doorType)) });
    }
    if (answers.rooflightsCount !== undefined) {
      featuresItems.push({ label: 'Rooflights', value: String(answers.rooflightsCount) });
    }
    if (featuresItems.length > 0) {
      sections.push({ title: 'Features', items: featuresItems });
    }
    
    // Insulation & Services Section
    const insulationItems: Array<{ label: string; value: string }> = [];
    if (answers.floorInsulation !== undefined) {
      insulationItems.push({ label: 'Floor Insulation', value: answers.floorInsulation ? 'Yes' : 'No' });
    }
    if (answers.roofInsulation !== undefined) {
      insulationItems.push({ label: 'Roof Insulation', value: answers.roofInsulation ? 'Yes' : 'No' });
    }
    if (answers.heatingType) {
      insulationItems.push({ label: 'Heating', value: capitalizeString(String(answers.heatingType)) });
    }
    if (answers.electricsLevel) {
      insulationItems.push({ label: 'Electrics', value: capitalizeString(String(answers.electricsLevel)) });
    }
    if (insulationItems.length > 0) {
      sections.push({ title: 'Insulation & Services', items: insulationItems });
    }
    
    // Project Details / Overview Section (only if property type not in Property Type section)
    if (!propertyTypeProperties && answers.propertyType) {
      const overviewItems: Array<{ label: string; value: string }> = [];
      overviewItems.push({ label: 'Property Type', value: capitalizeString(String(answers.propertyType)) });
      if (answers.location && !locationProperties) {
        overviewItems.push({ label: 'Location', value: capitalizeString(String(answers.location)) });
      }
      if (overviewItems.length > 0) {
        sections.push({ title: 'Project Details', items: overviewItems });
      }
    }
    
    return sections;
  }, [answers, template]);

  // Get measurements for summary
  const measurements = answers.measurements as EstimateMeasurements | undefined;

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left Side - Wizard Steps */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Estimate Builder AI</h1>
            <p className="text-muted-foreground">Please answer a few quick questions about your project to retrieve your quote.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onOpenSettings || (() => console.warn('Settings not available'))} 
              title="Settings"
              disabled={!onOpenSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Progress</span>
                  <Tooltip content="Shows how many required questions have been answered. Complete all required questions to generate your estimate.">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <span className="text-muted-foreground">{completionPercentage}% Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        {template.steps.map((step) => {
          const isExpanded = expandedSteps.has(step.id);
          const isComplete = isStepComplete(step);
          const visibleQuestions = step.questions.filter((q) => isQuestionVisible(q, answers));

          return (
            <Card key={step.id} className="overflow-hidden" ref={(el) => (stepRefs.current[step.id] = el)}>
              <CardHeader
                className="cursor-pointer bg-primary-600 text-white rounded-t-lg py-2.5 px-4"
                onClick={() => handleStepToggle(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/80" />
                    )}
                    <div>
                      <CardTitle className="text-base text-white font-semibold">
                        {step.title} {step.questions.some((q) => q.required) && '*'}
                      </CardTitle>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6 w-6 p-0">
                    {isExpanded ? '▼' : '▶'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={cn(
                'overflow-hidden transition-all duration-500 ease-in-out',
                isExpanded 
                  ? 'max-h-[5000px] opacity-100 p-6' 
                  : 'max-h-0 opacity-0 p-0'
              )}>
                {isExpanded && (
                <div className="space-y-6 bg-white dark:bg-gray-900">
                  {step.description && (
                    <div className="flex items-start gap-2 mb-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{step.description}</p>
                      <Tooltip content={step.description} position="right">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0 mt-0.5" />
                      </Tooltip>
                    </div>
                  )}
                  {step.id === 'step-dimensions' ? (
                    <DimensionsBlock
                      length={answers.dimensions?.length}
                      width={answers.dimensions?.width}
                      onUpdate={(dimensions) => {
                        handleAnswerChange('dimensions', dimensions);
                        // Also update measurements if they exist, to keep them in sync
                        if (answers.measurements) {
                          const measurements = answers.measurements as EstimateMeasurements;
                          handleAnswerChange('measurements', {
                            ...measurements,
                            externalLengthM: dimensions.length,
                            externalWidthM: dimensions.width,
                          } as any);
                        }
                      }}
                    />
                  ) : step.id === 'step-measurements' ? (
                    <MeasurementsBlock
                      measurements={{
                        ...(answers.measurements || {}),
                        // Pre-populate from dimensions if available
                        externalLengthM: answers.dimensions?.length || answers.measurements?.externalLengthM || 0,
                        externalWidthM: answers.dimensions?.width || answers.measurements?.externalWidthM || 0,
                      }}
                      roofType={answers.roofType as 'flat' | 'pitched' | undefined}
                      dimensions={answers.dimensions}
                      knockThroughWidth={(answers.knockThroughWidth || answers.knockThroughWidthExisting) as number | undefined}
                      knockThroughHeight={(answers.knockThroughHeight || answers.knockThroughHeightExisting) as number | undefined}
                      openingsAreaM2={answers.openingsAreaM2 as number | undefined}
                      onUpdate={(updated) => {
                        handleAnswerChange('measurements', updated as any);
                      }}
                    />
                  ) : step.id === 'step-site-conditions' ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          Configure site access, constraints, existing services, and ground conditions that may affect the build.
                        </p>
                        <Tooltip content="Configure site conditions and access requirements">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0 mt-0.5" />
                        </Tooltip>
                      </div>
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Site Conditions and Access</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure site access, constraints, existing services, and ground conditions
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowSiteConditionsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Site Conditions
                              </Button>
                            </div>
                            {(answers.siteConditionsProperties as SiteConditionsProperties | undefined) && (
                              <div className="mt-4 pt-4 border-t w-full">
                                <p className="text-xs text-muted-foreground mb-2">Current configuration:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {(answers.siteConditionsProperties as SiteConditionsProperties).siteAccess && (
                                    <Badge variant="outline">Site Access</Badge>
                                  )}
                                  {(answers.siteConditionsProperties as SiteConditionsProperties).siteConstraints && (
                                    <Badge variant="outline">Site Constraints</Badge>
                                  )}
                                  {(answers.siteConditionsProperties as SiteConditionsProperties).existingServices && (
                                    <Badge variant="outline">Existing Services</Badge>
                                  )}
                                  {(answers.siteConditionsProperties as SiteConditionsProperties).groundConditions && (
                                    <Badge variant="outline">Ground Conditions</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-scaffolding' ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          Configure scaffolding requirements including type, dimensions, access, and special requirements.
                        </p>
                        <Tooltip content="Configure scaffolding requirements">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0 mt-0.5" />
                        </Tooltip>
                      </div>
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Scaffolding</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure scaffolding type, dimensions, access requirements, and special features
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowScaffoldingModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Scaffolding
                              </Button>
                            </div>
                            {(answers.scaffoldingProperties as ScaffoldingProperties | undefined) && (
                              <div className="mt-4 pt-4 border-t w-full">
                                <p className="text-xs text-muted-foreground mb-2">Current configuration:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {(answers.scaffoldingProperties as ScaffoldingProperties).scaffoldingType && (
                                    <Badge variant="outline">
                                      {(answers.scaffoldingProperties as ScaffoldingProperties).scaffoldingType}
                                    </Badge>
                                  )}
                                  {(answers.scaffoldingProperties as ScaffoldingProperties).height && (
                                    <Badge variant="outline">
                                      H: {(answers.scaffoldingProperties as ScaffoldingProperties).height}m
                                    </Badge>
                                  )}
                                  {(answers.scaffoldingProperties as ScaffoldingProperties).length && (
                                    <Badge variant="outline">
                                      L: {(answers.scaffoldingProperties as ScaffoldingProperties).length}m
                                    </Badge>
                                  )}
                                  {(answers.scaffoldingProperties as ScaffoldingProperties).levels && (
                                    <Badge variant="outline">
                                      {(answers.scaffoldingProperties as ScaffoldingProperties).levels} Levels
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-professional-services' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Professional Services</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure planning, building control, structural engineer, party wall, architect, and other professional services
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowProfessionalServicesModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Professional Services
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-foundations' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Foundations</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure foundation type and dimensions
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowFoundationsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Foundations
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-ground-floor' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Ground Floor Construction</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure ground floor construction type
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowGroundFloorModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Ground Floor
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-wall-construction' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Wall Construction</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure wall construction type, cavity size, insulation type and thickness
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowWallConstructionModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Wall Construction
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-2' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Knock-Through</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure knock-through requirements and opening details
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowKnockThroughModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Knock-Through
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-3' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Knock-Through Type</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure knock-through type and opening details
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowKnockThroughModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Knock-Through
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-steels-structural' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Structural - Steels and Lintels</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure steels and lintels for knock-through and the rest of the project
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowStructuralSteelsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Steels & Lintels
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-4' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Roof Type</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure roof type and details
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowRoofTypeModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Roof Type
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-5' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Roof Coverings</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure roof covering material
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowRoofCoveringsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Roof Coverings
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-insulation' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Insulation</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure floor and roof/ceiling insulation requirements
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowInsulationModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Insulation
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-fascia-soffit-rainwater' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Fascia, Soffit & Rainwater Goods</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure fascia, soffit, overhangs, and rainwater goods
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowFasciaSoffitRainwaterModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Fascia & Rainwater
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-6' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">External Wall Finish</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure external wall finish type
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowExternalWallFinishModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Wall Finish
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-7' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Rear Opening/Doors</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure door type for rear opening
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowDoorsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Doors
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-8' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Rooflights</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure number of rooflights
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowRooflightsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Rooflights
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-10' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Heating Approach</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure heating approach for the extension
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowHeatingModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Heating
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-11' ? (
                    <div className="space-y-4">
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Electrics Specification</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure electrical specification level
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowElectricsModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Electrics
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : step.id === 'step-health-safety-welfare' ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          Configure health, safety, and welfare provisions in compliance with UK HSE guidelines. Include first aid, welfare facilities, safety equipment, and related costs.
                        </p>
                        <Tooltip content="Configure health, safety, and welfare provisions (UK HSE Compliant)">
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0 mt-0.5" />
                        </Tooltip>
                      </div>
                      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <Settings className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Health & Safety & Welfare</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Configure health, safety, and welfare provisions including first aid, welfare facilities, safety equipment, and costs
                              </p>
                              <Button
                                variant="default"
                                onClick={() => setShowHealthSafetyWelfareModal(true)}
                                className="mt-2"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Health & Safety
                              </Button>
                            </div>
                            {(answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties | undefined) && (
                              <div className="mt-4 pt-4 border-t w-full">
                                <p className="text-xs text-muted-foreground mb-2">Current configuration:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {(answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties).firstAidKitRequired && (
                                    <Badge variant="outline">First Aid</Badge>
                                  )}
                                  {(answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties).welfareUnitRequired && (
                                    <Badge variant="outline">Welfare Unit</Badge>
                                  )}
                                  {(answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties).siteSecurity && (
                                    <Badge variant="outline">Security</Badge>
                                  )}
                                  {(answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties).riskAssessmentRequired && (
                                    <Badge variant="outline">Risk Assessment</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : visibleQuestions.length > 0 ? (
                    visibleQuestions.map((question) => (
                      <QuestionBlock
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => handleAnswerChange(question.id, value as string | number | boolean | (string | number | boolean)[])}
                        isVisible={isQuestionVisible(question, answers)}
                        onLocationPropertiesClick={
                          question.id === 'location' 
                            ? () => setShowLocationPropertiesModal(true) 
                            : question.id === 'propertyType'
                            ? () => setShowPropertyTypePropertiesModal(true)
                            : question.id === 'siteConditions' || question.id === 'site-conditions'
                            ? () => setShowSiteConditionsModal(true)
                            : undefined
                        }
                      />
                    ))
                  ) : step.questions.length === 0 ? null : (
                    // Step where all questions are hidden by dependencies - show helpful message
                    <div className="text-sm text-muted-foreground italic">
                      Complete previous steps to see questions here.
                    </div>
                  )}

                  {/* Next Button - Bottom Right */}
                  {template.steps.findIndex((s) => s.id === step.id) < template.steps.length - 1 && (
                    <div className="flex justify-end pt-4 border-t mt-6">
                      <Button
                        onClick={() => handleNextStep(step.id)}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Right Side - Sticky Summary */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Template</div>
                <div className="text-sm text-muted-foreground">{template.name}</div>
              </div>

              {sectionedSummary.length > 0 && (
                <div className="space-y-4">
                  {sectionedSummary.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={sectionIndex > 0 ? 'pt-4 border-t' : ''}>
                      <div className="text-sm font-semibold mb-2 text-primary">{section.title}</div>
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}:</span>
                            <span className="font-medium text-right max-w-[60%] break-words">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {measurements && measurements.floorAreaM2 > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="text-sm font-medium">Measurements</div>
                    <Tooltip content="Calculated measurements based on your input dimensions. These values are used to generate accurate cost estimates.">
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Floor Area:</span>
                        <Tooltip content="The total floor area of the extension (length × width). Used for flooring, underfloor heating, and general area-based calculations.">
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-medium">{formatArea(measurements.floorAreaM2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Perimeter:</span>
                        <Tooltip content="The total length around the extension (2 × (length + width)). Used for foundations, external walls, and perimeter-based calculations.">
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-medium">{formatLength(measurements.perimeterM)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Wall Area:</span>
                        <Tooltip content="The total external wall area (perimeter × eaves height). Used for brickwork, render, cladding, and insulation calculations.">
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-medium">{formatArea(measurements.externalWallAreaM2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Roof Area:</span>
                        <Tooltip content="The total roof area including overhangs and soffits (floor area × roof factor). Used for roofing materials, insulation, and roof structure calculations.">
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-medium">{formatArea(measurements.roofAreaM2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Estimate Preview</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overhead:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contingency:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total:</span>
                    <span>-</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleGenerate}
                disabled={!canGenerate || !measurements || measurements.floorAreaM2 <= 0}
              >
                {canGenerate && measurements && measurements.floorAreaM2 > 0
                  ? 'Generate Estimate'
                  : `Complete ${completionPercentage}% to Generate`}
              </Button>

              {(!canGenerate || !measurements || measurements.floorAreaM2 <= 0) && (
                <p className="text-xs text-muted-foreground text-center">
                  {!measurements || measurements.floorAreaM2 <= 0
                    ? 'Please enter measurements (length and width)'
                    : 'Please answer all required questions to generate an estimate'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Location Properties Modal */}
      <LocationPropertiesModal
        isOpen={showLocationPropertiesModal}
        onClose={() => setShowLocationPropertiesModal(false)}
        properties={(answers.locationProperties as LocationProperties) || {}}
        onSave={(properties) => {
          onAnswersChange({
            ...answers,
            locationProperties: properties,
          });
        }}
      />

      {/* Property Type Properties Modal */}
      <PropertyTypePropertiesModal
        isOpen={showPropertyTypePropertiesModal}
        onClose={() => setShowPropertyTypePropertiesModal(false)}
        properties={{
          propertyType: answers.propertyType as string | undefined,
          ...((answers.propertyTypeProperties as PropertyTypeProperties) || {}),
        }}
        onSave={(properties) => {
          onAnswersChange({
            ...answers,
            propertyTypeProperties: properties,
          });
        }}
      />

      {/* Site Conditions Modal */}
      <SiteConditionsModal
        isOpen={showSiteConditionsModal}
        onClose={() => setShowSiteConditionsModal(false)}
        properties={(answers.siteConditionsProperties as SiteConditionsProperties) || {}}
        onSave={(properties) => {
          onAnswersChange({
            ...answers,
            siteConditionsProperties: properties,
          });
        }}
      />

      {/* Scaffolding Modal */}
      <ScaffoldingModal
        isOpen={showScaffoldingModal}
        onClose={() => setShowScaffoldingModal(false)}
        properties={(answers.scaffoldingProperties as ScaffoldingProperties) || {}}
        onSave={(properties) => {
          onAnswersChange({
            ...answers,
            scaffoldingProperties: properties,
          });
        }}
      />

      {/* Health & Safety & Welfare Modal */}
      <HealthSafetyWelfareModal
        isOpen={showHealthSafetyWelfareModal}
        onClose={() => setShowHealthSafetyWelfareModal(false)}
        properties={(answers.healthSafetyWelfareProperties as HealthSafetyWelfareProperties) || {}}
        onSave={(properties) => {
          onAnswersChange({
            ...answers,
            healthSafetyWelfareProperties: properties,
          });
        }}
      />

      {/* Wall Construction Modal */}
      <WallConstructionModal
        isOpen={showWallConstructionModal}
        onClose={() => setShowWallConstructionModal(false)}
        properties={answers.wallConstructionProperties as WallConstructionProperties | undefined}
        onSave={(properties) => {
          const newAnswers = {
            ...answers,
            wallConstructionProperties: properties,
          };
          if (properties.wallConstructionType) newAnswers.wallConstructionType = properties.wallConstructionType;
          if (properties.cavitySize !== undefined) newAnswers.cavitySize = properties.cavitySize;
          if (properties.cavityType) newAnswers.cavityType = properties.cavityType;
          if (properties.wallInsulationThickness !== undefined) newAnswers.wallInsulationThickness = properties.wallInsulationThickness;
          if (properties.residualCavity !== undefined) newAnswers.residualCavity = properties.residualCavity;
          if (properties.wallInsulationType) newAnswers.wallInsulationType = properties.wallInsulationType;
          if (properties.timberFrameInsulationType) newAnswers.timberFrameInsulationType = properties.timberFrameInsulationType;
          if (properties.timberFrameInsulationThickness !== undefined) newAnswers.timberFrameInsulationThickness = properties.timberFrameInsulationThickness;
          if (properties.notes) newAnswers.wallConstructionNotes = properties.notes;
          onAnswersChange(newAnswers);
        }}
        answers={answers}
      />

      {/* Professional Services Modal */}
      <ProfessionalServicesModal
        isOpen={showProfessionalServicesModal}
        onClose={() => setShowProfessionalServicesModal(false)}
        properties={answers.professionalServicesProperties as ProfessionalServicesProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, professionalServicesProperties: properties };
          Object.keys(properties).forEach(key => {
            if (properties[key as keyof ProfessionalServicesProperties] !== undefined) {
              newAnswers[key] = properties[key as keyof ProfessionalServicesProperties];
            }
          });
          onAnswersChange(newAnswers);
        }}
      />

      {/* Foundations Modal */}
      <FoundationsModal
        isOpen={showFoundationsModal}
        onClose={() => setShowFoundationsModal(false)}
        properties={answers.foundationsProperties as FoundationsProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, foundationsProperties: properties };
          if (properties.foundationsType) newAnswers.foundationsType = properties.foundationsType;
          if (properties.foundationLength !== undefined) newAnswers.foundationLength = properties.foundationLength;
          if (properties.foundationWidth !== undefined) newAnswers.foundationWidth = properties.foundationWidth;
          if (properties.foundationDepth !== undefined) newAnswers.foundationDepth = properties.foundationDepth;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Ground Floor Modal */}
      <GroundFloorModal
        isOpen={showGroundFloorModal}
        onClose={() => setShowGroundFloorModal(false)}
        properties={answers.groundFloorProperties as GroundFloorProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, groundFloorProperties: properties };
          if (properties.groundFloorType) newAnswers.groundFloorType = properties.groundFloorType;
          onAnswersChange(newAnswers);
        }}
      />

      {/* External Wall Finish Modal */}
      <ExternalWallFinishModal
        isOpen={showExternalWallFinishModal}
        onClose={() => setShowExternalWallFinishModal(false)}
        properties={answers.externalWallFinishProperties as ExternalWallFinishProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, externalWallFinishProperties: properties };
          if (properties.wallFinish) newAnswers.wallFinish = properties.wallFinish;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Roof Type Modal */}
      <RoofTypeModal
        isOpen={showRoofTypeModal}
        onClose={() => setShowRoofTypeModal(false)}
        properties={answers.roofTypeProperties as RoofTypeProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, roofTypeProperties: properties };
          if (properties.roofType) newAnswers.roofType = properties.roofType;
          if (properties.roofSubType) newAnswers.roofSubType = properties.roofSubType;
          if (properties.roofPitchedDetails) newAnswers.roofPitchedDetails = properties.roofPitchedDetails;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Roof Coverings Modal */}
      <RoofCoveringsModal
        isOpen={showRoofCoveringsModal}
        onClose={() => setShowRoofCoveringsModal(false)}
        properties={answers.roofCoveringsProperties as RoofCoveringsProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, roofCoveringsProperties: properties };
          if (properties.roofCovering) newAnswers.roofCovering = properties.roofCovering;
          onAnswersChange(newAnswers);
        }}
        roofType={answers.roofType as string | undefined}
      />

      {/* Insulation Modal */}
      <InsulationModal
        isOpen={showInsulationModal}
        onClose={() => setShowInsulationModal(false)}
        properties={answers.insulationProperties as InsulationProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, insulationProperties: properties };
          if (properties.floorInsulation !== undefined) newAnswers.floorInsulation = properties.floorInsulation;
          if (properties.roofInsulation !== undefined) newAnswers.roofInsulation = properties.roofInsulation;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Fascia Soffit Rainwater Modal */}
      <FasciaSoffitRainwaterModal
        isOpen={showFasciaSoffitRainwaterModal}
        onClose={() => setShowFasciaSoffitRainwaterModal(false)}
        properties={answers.fasciaSoffitRainwaterProperties as FasciaSoffitRainwaterProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, fasciaSoffitRainwaterProperties: properties };
          Object.keys(properties).forEach(key => {
            if (properties[key as keyof FasciaSoffitRainwaterProperties] !== undefined) {
              newAnswers[key] = properties[key as keyof FasciaSoffitRainwaterProperties];
            }
          });
          onAnswersChange(newAnswers);
        }}
        roofType={answers.roofType as string | undefined}
      />

      {/* Knock Through Modal */}
      <KnockThroughModal
        isOpen={showKnockThroughModal}
        onClose={() => setShowKnockThroughModal(false)}
        properties={answers.knockThroughProperties as KnockThroughProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, knockThroughProperties: properties };
          Object.keys(properties).forEach(key => {
            if (properties[key as keyof KnockThroughProperties] !== undefined) {
              newAnswers[key] = properties[key as keyof KnockThroughProperties];
            }
          });
          onAnswersChange(newAnswers);
        }}
      />

      {/* Structural Steels Modal */}
      <StructuralSteelsModal
        isOpen={showStructuralSteelsModal}
        onClose={() => setShowStructuralSteelsModal(false)}
        properties={answers.structuralSteelsProperties as StructuralSteelsProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, structuralSteelsProperties: properties };
          Object.keys(properties).forEach(key => {
            if (properties[key as keyof StructuralSteelsProperties] !== undefined) {
              newAnswers[key] = properties[key as keyof StructuralSteelsProperties];
            }
          });
          onAnswersChange(newAnswers);
        }}
        knockThroughSupport={answers.knockThroughSupport as string | undefined}
        knockThroughSupportExisting={answers.knockThroughSupportExisting as string | undefined}
        knockThroughWidth={answers.knockThroughWidth as number | undefined}
        knockThroughWidthExisting={answers.knockThroughWidthExisting as number | undefined}
      />

      {/* Doors Modal */}
      <DoorsModal
        isOpen={showDoorsModal}
        onClose={() => setShowDoorsModal(false)}
        properties={answers.doorsProperties as DoorsProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, doorsProperties: properties };
          if (properties.doorType) newAnswers.doorType = properties.doorType;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Rooflights Modal */}
      <RooflightsModal
        isOpen={showRooflightsModal}
        onClose={() => setShowRooflightsModal(false)}
        properties={answers.rooflightsProperties as RooflightsProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, rooflightsProperties: properties };
          if (properties.rooflightsCount !== undefined) newAnswers.rooflightsCount = properties.rooflightsCount;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Heating Modal */}
      <HeatingModal
        isOpen={showHeatingModal}
        onClose={() => setShowHeatingModal(false)}
        properties={answers.heatingProperties as HeatingProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, heatingProperties: properties };
          if (properties.heatingType) newAnswers.heatingType = properties.heatingType;
          onAnswersChange(newAnswers);
        }}
      />

      {/* Electrics Modal */}
      <ElectricsModal
        isOpen={showElectricsModal}
        onClose={() => setShowElectricsModal(false)}
        properties={answers.electricsProperties as ElectricsProperties | undefined}
        onSave={(properties) => {
          const newAnswers = { ...answers, electricsProperties: properties };
          if (properties.electricsLevel) newAnswers.electricsLevel = properties.electricsLevel;
          onAnswersChange(newAnswers);
        }}
      />
    </div>
  );
}

