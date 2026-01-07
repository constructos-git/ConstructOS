// Brief Tab Component

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { RefreshCw, Save } from 'lucide-react';
import { useBrief, useCreateBrief, useUpdateBrief } from '../../hooks/useBrief';
import { buildBriefContent, briefContentToMarkdown } from '../../utils/briefBuilder';
import type { EstimateBrief, EstimateMeasurements, RateSettings } from '../../domain/types';

interface BriefTabProps {
  estimateId: string;
  brief: EstimateBrief;
  measurements?: EstimateMeasurements;
  rateSettings?: RateSettings;
  companyId?: string;
  onResetBrief?: () => void;
}

export function BriefTab({
  estimateId,
  brief,
  measurements,
  rateSettings,
  companyId,
  onResetBrief,
}: BriefTabProps) {
  const { data: savedBrief } = useBrief(companyId, estimateId);
  const createBrief = useCreateBrief(companyId);
  const updateBrief = useUpdateBrief(companyId);

  const [assumptions, setAssumptions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved brief or build from current data
  useEffect(() => {
    if (savedBrief) {
      setAssumptions(savedBrief.assumptions || '');
      setExclusions(savedBrief.exclusions || '');
    } else if (estimateId && brief && measurements) {
      // Build brief content from current data
      const briefContent = buildBriefContent(brief, measurements, rateSettings);
      const markdown = briefContentToMarkdown(briefContent);
      
      // Auto-create brief if it doesn't exist
      createBrief.mutateAsync({
        estimateId,
        brief: briefContent,
        markdown,
        assumptions: '',
        exclusions: '',
      }).catch(console.error);
    }
  }, [savedBrief, estimateId, brief, measurements, rateSettings, createBrief]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const briefContent = buildBriefContent(brief, measurements, rateSettings);
      const markdown = briefContentToMarkdown(briefContent);

      if (savedBrief) {
        await updateBrief.mutateAsync({
          estimateId,
          updates: {
            briefJson: briefContent,
            briefMarkdown: markdown,
            assumptions,
            exclusions,
          },
        });
      } else {
        await createBrief.mutateAsync({
          estimateId,
          brief: briefContent,
          markdown,
          assumptions,
          exclusions,
        });
      }
    } catch (error) {
      console.error('Failed to save brief:', error);
      alert('Failed to save brief. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset brief from current answers? This will overwrite any manual edits.')) {
      const briefContent = buildBriefContent(brief, measurements, rateSettings);
      const markdown = briefContentToMarkdown(briefContent);
      
      if (savedBrief) {
        updateBrief.mutateAsync({
          estimateId,
          updates: {
            briefJson: briefContent,
            briefMarkdown: markdown,
          },
        }).catch(console.error);
      } else {
        createBrief.mutateAsync({
          estimateId,
          brief: briefContent,
          markdown,
          assumptions,
          exclusions,
        }).catch(console.error);
      }
      
      if (onResetBrief) {
        onResetBrief();
      }
    }
  };

  const briefContent = savedBrief?.brief_json || buildBriefContent(brief, measurements, rateSettings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estimate Brief</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset from Answers
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Brief'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Structured Brief */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Template:</span> {briefContent.projectOverview.template}
              </div>
              {briefContent.projectOverview.location && (
                <div>
                  <span className="font-medium">Location:</span> {briefContent.projectOverview.location}
                </div>
              )}
              {briefContent.projectOverview.propertyType && (
                <div>
                  <span className="font-medium">Property Type:</span> {briefContent.projectOverview.propertyType}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Floor Area:</span> {briefContent.measurements.floorAreaM2.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Wall Area:</span> {briefContent.measurements.wallAreaM2.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Roof Area:</span> {briefContent.measurements.roofAreaM2.toFixed(2)} m²
              </div>
              <div>
                <span className="font-medium">Perimeter:</span> {briefContent.measurements.perimeterM.toFixed(2)} m
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {briefContent.keySpecs.roofType && (
                <div>
                  <span className="font-medium">Roof Type:</span> {briefContent.keySpecs.roofType}
                </div>
              )}
              {briefContent.keySpecs.roofCovering && (
                <div>
                  <span className="font-medium">Roof Covering:</span> {briefContent.keySpecs.roofCovering}
                </div>
              )}
              {briefContent.keySpecs.wallFinish && (
                <div>
                  <span className="font-medium">Wall Finish:</span> {briefContent.keySpecs.wallFinish}
                </div>
              )}
              {briefContent.keySpecs.doorType && (
                <div>
                  <span className="font-medium">Door Type:</span> {briefContent.keySpecs.doorType}
                </div>
              )}
              {briefContent.keySpecs.rooflightsCount !== undefined && (
                <div>
                  <span className="font-medium">Rooflights:</span> {briefContent.keySpecs.rooflightsCount}
                </div>
              )}
              {briefContent.keySpecs.foundationsType && (
                <div>
                  <span className="font-medium">Foundations:</span> {briefContent.keySpecs.foundationsType}
                </div>
              )}
              {briefContent.keySpecs.heatingType && (
                <div>
                  <span className="font-medium">Heating:</span> {briefContent.keySpecs.heatingType}
                </div>
              )}
              {briefContent.keySpecs.electricsLevel && (
                <div>
                  <span className="font-medium">Electrics:</span> {briefContent.keySpecs.electricsLevel}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Basis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Region:</span> {briefContent.pricingBasis.region}
              </div>
              <div>
                <span className="font-medium">Multiplier:</span> {briefContent.pricingBasis.multiplier.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Overhead:</span> {briefContent.pricingBasis.overheadPct}%
              </div>
              <div>
                <span className="font-medium">Margin:</span> {briefContent.pricingBasis.marginPct}%
              </div>
              <div>
                <span className="font-medium">Contingency:</span> {briefContent.pricingBasis.contingencyPct}%
              </div>
              <div>
                <span className="font-medium">VAT:</span> {briefContent.pricingBasis.vatPct}%
              </div>
            </CardContent>
          </Card>

          {briefContent.provisionalSums.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Provisional Sums</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {briefContent.provisionalSums.map((ps, index) => (
                    <li key={index}>{ps}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {briefContent.risksUnknowns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Risks & Unknowns</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {briefContent.risksUnknowns.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Editable Assumptions & Exclusions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assumptions & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={assumptions}
                onChange={(e) => setAssumptions(e.target.value)}
                placeholder="Enter assumptions and notes..."
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exclusions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                placeholder="Enter exclusions..."
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

