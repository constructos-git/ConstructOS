// Wizard Page Component - Single page wizard with sticky summary

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { QuestionBlock } from './QuestionBlock';
import { DimensionsBlock } from './DimensionsBlock';
import { MeasurementsBlock } from './MeasurementsBlock';
import { ArrowLeft, CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import type { EstimateBuilderTemplate, Question, QuestionStep, EstimateMeasurements } from '../../domain/types';
import { buildEstimateBrief } from '../../domain/briefBuilder';
import { formatLength, formatArea } from '../../utils/measurements';

interface WizardPageProps {
  template: EstimateBuilderTemplate;
  answers: Record<string, any>;
  onAnswersChange: (answers: Record<string, any>) => void;
  onBack: () => void;
  onGenerate: (brief: ReturnType<typeof buildEstimateBrief>) => void;
}

export function WizardPage({
  template,
  answers,
  onAnswersChange,
  onBack,
  onGenerate,
}: WizardPageProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set([template.steps[0]?.id]));
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

      // Only auto-expand next step if current step is complete
      if (isCurrentStepComplete && currentStepIndex < template.steps.length - 1) {
        const nextStep = template.steps[currentStepIndex + 1];
        
        // Determine if we should expand the next step
        // - Always expand if current step is dimensions/measurements (they're complete)
        // - Always expand if next step is dimensions/measurements (they're special steps)
        // - Otherwise, check if there are visible questions in the next step
        const shouldExpand = 
          currentStep.id === 'step-dimensions' || 
          currentStep.id === 'step-measurements' || 
          nextStep.id === 'step-dimensions' || 
          nextStep.id === 'step-measurements'
          ? true 
          : nextStep.questions.filter((q) => isQuestionVisible(q, newAnswers)).length > 0;
        
        if (shouldExpand) {
          // Clear any pending scroll
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          // Expand next step
          const newExpanded = new Set(expandedSteps);
          newExpanded.add(nextStep.id);
          setExpandedSteps(newExpanded);

          // Scroll to next step after DOM updates
          // Don't auto-scroll if user is currently scrolling
          if (isUserScrollingRef.current) {
            return;
          }

          // Clear any pending scrolls first
          if (scrollAnimationFrameRef.current) {
            cancelAnimationFrame(scrollAnimationFrameRef.current);
          }
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          
          // Use requestAnimationFrame to ensure DOM is updated, then scroll
          scrollAnimationFrameRef.current = requestAnimationFrame(() => {
            scrollTimeoutRef.current = setTimeout(() => {
              // Check again if user started scrolling
              if (isUserScrollingRef.current) {
                return;
              }

              const stepElement = stepRefs.current[nextStep.id];
              const scrollContainer = scrollContainerRef.current;
              
              if (stepElement && scrollContainer) {
                // Wait for the element to be fully rendered
                const checkAndScroll = (attempts = 0) => {
                  // Prevent infinite loops
                  if (attempts > 10) return;

                  const elementRect = stepElement.getBoundingClientRect();
                  const containerRect = scrollContainer.getBoundingClientRect();
                  
                  // Only scroll if element is actually visible/rendered
                  if (elementRect.height > 0 && !isUserScrollingRef.current) {
                    // Calculate scroll position within the container
                    const elementTopRelative = elementRect.top - containerRect.top + scrollContainer.scrollTop;
                    const offset = 20; // Small offset from top
                    
                    // Scroll the container, not the window
                    scrollContainer.scrollTo({
                      top: elementTopRelative - offset,
                      behavior: 'smooth',
                    });
                  } else if (elementRect.height === 0 && attempts < 10) {
                    // Element not rendered yet, try again
                    requestAnimationFrame(() => checkAndScroll(attempts + 1));
                  }
                };
                
                checkAndScroll();
              }
            }, 300); // Increased delay to ensure expansion animation completes
          });
        }
      }
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

  const handleGenerate = () => {
    const brief = buildEstimateBrief(template.id, answers);
    onGenerate(brief);
  };

  // Build summary for preview
  const summary = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];
    
    if (answers.propertyType) {
      items.push({ label: 'Property Type', value: String(answers.propertyType) });
    }
    if (answers.location) {
      items.push({ label: 'Location', value: String(answers.location) });
    }
    if (answers.knockThrough !== undefined) {
      items.push({ label: 'Knock-Through', value: answers.knockThrough ? 'Yes' : 'No' });
    }
    if (answers.knockThroughType) {
      items.push({ label: 'Knock-Through Type', value: String(answers.knockThroughType) });
    }
    if (answers.roofType) {
      items.push({ label: 'Roof Type', value: String(answers.roofType) });
    }
    if (answers.roofCovering) {
      items.push({ label: 'Roof Covering', value: String(answers.roofCovering) });
    }
    if (answers.wallFinish) {
      items.push({ label: 'Wall Finish', value: String(answers.wallFinish) });
    }
    if (answers.doorType) {
      items.push({ label: 'Door Type', value: String(answers.doorType) });
    }
    if (answers.rooflightsCount !== undefined) {
      items.push({ label: 'Rooflights', value: String(answers.rooflightsCount) });
    }
    if (answers.foundationsType) {
      items.push({ label: 'Foundations', value: String(answers.foundationsType) });
    }
    if (answers.heatingType) {
      items.push({ label: 'Heating', value: String(answers.heatingType) });
    }
    if (answers.electricsLevel) {
      items.push({ label: 'Electrics', value: String(answers.electricsLevel) });
    }

    return items;
  }, [answers]);

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
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
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
              {isExpanded && (
                <CardContent className="space-y-6 p-6 bg-white dark:bg-gray-900">
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
                      onUpdate={(updated) => {
                        handleAnswerChange('measurements', updated as any);
                      }}
                    />
                  ) : (
                    visibleQuestions.map((question) => (
                      <QuestionBlock
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => handleAnswerChange(question.id, value as string | number | boolean | (string | number | boolean)[])}
                        isVisible={isQuestionVisible(question, answers)}
                      />
                    ))
                  )}
                </CardContent>
              )}
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

              {summary.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Key Choices</div>
                  <div className="space-y-1">
                    {summary.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-medium capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
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
    </div>
  );
}

