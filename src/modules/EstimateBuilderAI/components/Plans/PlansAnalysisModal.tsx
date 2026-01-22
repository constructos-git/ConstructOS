// Plans Analysis Modal - Review and edit extracted data from plans

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import type { ExtractedPlansData } from '../../ai/plansAnalyzer';

interface PlansAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedPlansData;
  onConfirm: (data: ExtractedPlansData) => void;
}

const FOUNDATION_TYPES = ['strip', 'raft', 'pad', 'piled'];
const WALL_CONSTRUCTION_TYPES = ['brick-and-block', 'block-and-block', 'timber-frame', 'concrete-block', 'insulated-concrete-form'];
const WALL_FINISHES = ['facing-brick', 'render', 'tile-hanging', 'cladding', 'pebble-dash', 'stone'];
const CAVITY_TYPES = ['full-fill', 'partial-fill', 'empty'];
const ROOF_TYPES = ['flat', 'pitched', 'hipped', 'gabled', 'mansard'];
const FLAT_ROOF_TYPES = ['warm-deck', 'cold-deck', 'inverted', 'hybrid'];
const INSULATION_TYPES = ['full-fill', 'partial-fill', 'external', 'internal', 'between-joists', 'under-slab'];

export function PlansAnalysisModal({
  isOpen,
  onClose,
  extractedData,
  onConfirm,
}: PlansAnalysisModalProps) {
  const [data, setData] = useState<ExtractedPlansData>(extractedData);

  useEffect(() => {
    setData(extractedData);
  }, [extractedData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onConfirm(data);
  };

  const handleCancel = () => {
    setData(extractedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pt-16 pb-4 px-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <CardTitle className="text-2xl">Review Extracted Data</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Message */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Review the extracted information below.</strong> Please verify all details are correct 
              and make any necessary amendments before continuing. This data will be used to pre-populate the 
              estimate builder wizard.
            </p>
          </div>

          {/* Dimensions Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Length (m)</label>
                  <Tooltip content="External length of the extension">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={data.dimensions?.length || ''}
                  onChange={(e) => setData({
                    ...data,
                    dimensions: { ...data.dimensions, length: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Width (m)</label>
                  <Tooltip content="External width of the extension">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={data.dimensions?.width || ''}
                  onChange={(e) => setData({
                    ...data,
                    dimensions: { ...data.dimensions, width: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Height (m)</label>
                  <Tooltip content="External height of the extension">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={data.dimensions?.height || ''}
                  onChange={(e) => setData({
                    ...data,
                    dimensions: { ...data.dimensions, height: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Floor Area (m²)</label>
                  <Tooltip content="Total floor area">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={data.dimensions?.floorArea || ''}
                  onChange={(e) => setData({
                    ...data,
                    dimensions: { ...data.dimensions, floorArea: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Foundations Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Foundations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Foundation Type</label>
                <select
                  value={data.foundations?.type || ''}
                  onChange={(e) => setData({
                    ...data,
                    foundations: { ...data.foundations, type: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {FOUNDATION_TYPES.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Depth (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={data.foundations?.depth || ''}
                  onChange={(e) => setData({
                    ...data,
                    foundations: { ...data.foundations, depth: e.target.value ? parseFloat(e.target.value) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Width (mm)</label>
                <Input
                  type="number"
                  step="10"
                  value={data.foundations?.width || ''}
                  onChange={(e) => setData({
                    ...data,
                    foundations: { ...data.foundations, width: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Foundation Notes</label>
              <textarea
                value={data.foundations?.notes || ''}
                onChange={(e) => setData({
                  ...data,
                  foundations: { ...data.foundations, notes: e.target.value }
                })}
                className="w-full min-h-[60px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* External Walls Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">External Walls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Construction Type</label>
                <select
                  value={data.externalWalls?.constructionType || ''}
                  onChange={(e) => setData({
                    ...data,
                    externalWalls: { ...data.externalWalls, constructionType: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {WALL_CONSTRUCTION_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">External Finish</label>
                <select
                  value={data.externalWalls?.finish || ''}
                  onChange={(e) => setData({
                    ...data,
                    externalWalls: { ...data.externalWalls, finish: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select finish...</option>
                  {WALL_FINISHES.map(finish => (
                    <option key={finish} value={finish}>{finish.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cavity Size (mm)</label>
                <Input
                  type="number"
                  step="10"
                  value={data.externalWalls?.cavitySize || ''}
                  onChange={(e) => setData({
                    ...data,
                    externalWalls: { ...data.externalWalls, cavitySize: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cavity Type</label>
                <select
                  value={data.externalWalls?.cavityType || ''}
                  onChange={(e) => setData({
                    ...data,
                    externalWalls: { ...data.externalWalls, cavityType: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {CAVITY_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Residual Cavity (mm)</label>
                <Input
                  type="number"
                  step="1"
                  value={data.externalWalls?.residualCavity || ''}
                  onChange={(e) => setData({
                    ...data,
                    externalWalls: { ...data.externalWalls, residualCavity: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Insulation Thickness (mm)</label>
                <Input
                  type="number"
                  step="1"
                  value={data.externalWalls?.insulationThickness || ''}
                  onChange={(e) => setData({
                    ...data,
                    externalWalls: { ...data.externalWalls, insulationThickness: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Wall Notes</label>
              <textarea
                value={data.externalWalls?.notes || ''}
                onChange={(e) => setData({
                  ...data,
                  externalWalls: { ...data.externalWalls, notes: e.target.value }
                })}
                className="w-full min-h-[60px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Roof Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Roof</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Roof Type</label>
                <select
                  value={data.roof?.type || ''}
                  onChange={(e) => setData({
                    ...data,
                    roof: { ...data.roof, type: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {ROOF_TYPES.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              {data.roof?.type === 'flat' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Flat Roof Construction</label>
                  <select
                    value={data.roof?.constructionType || ''}
                    onChange={(e) => setData({
                      ...data,
                      roof: { ...data.roof, constructionType: e.target.value || undefined }
                    })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select type...</option>
                    {FLAT_ROOF_TYPES.map(type => (
                      <option key={type} value={type}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Joist Size</label>
                <Input
                  type="text"
                  placeholder="e.g., 47x195mm"
                  value={data.roof?.joistSize || ''}
                  onChange={(e) => setData({
                    ...data,
                    roof: { ...data.roof, joistSize: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Joist Spacing (mm)</label>
                <Input
                  type="number"
                  step="50"
                  value={data.roof?.joistSpacing || ''}
                  onChange={(e) => setData({
                    ...data,
                    roof: { ...data.roof, joistSpacing: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Covering</label>
                <Input
                  type="text"
                  placeholder="e.g., tiles, slates, membrane"
                  value={data.roof?.covering || ''}
                  onChange={(e) => setData({
                    ...data,
                    roof: { ...data.roof, covering: e.target.value }
                  })}
                />
              </div>
              {data.roof?.type === 'pitched' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pitch (degrees)</label>
                  <Input
                    type="number"
                    step="1"
                    value={data.roof?.pitch || ''}
                    onChange={(e) => setData({
                      ...data,
                      roof: { ...data.roof, pitch: e.target.value ? parseInt(e.target.value, 10) : undefined }
                    })}
                  />
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Roof Notes</label>
              <textarea
                value={data.roof?.notes || ''}
                onChange={(e) => setData({
                  ...data,
                  roof: { ...data.roof, notes: e.target.value }
                })}
                className="w-full min-h-[60px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Insulation Section */}
          <div className="pt-2 border-t">
            <h3 className="text-lg font-semibold mb-4">Insulation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Wall Insulation Type</label>
                <select
                  value={data.insulation?.wallInsulationType || ''}
                  onChange={(e) => setData({
                    ...data,
                    insulation: { ...data.insulation, wallInsulationType: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {INSULATION_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Wall Insulation Thickness (mm)</label>
                <Input
                  type="number"
                  step="10"
                  value={data.insulation?.wallInsulationThickness || ''}
                  onChange={(e) => setData({
                    ...data,
                    insulation: { ...data.insulation, wallInsulationThickness: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roof Insulation Type</label>
                <select
                  value={data.insulation?.roofInsulationType || ''}
                  onChange={(e) => setData({
                    ...data,
                    insulation: { ...data.insulation, roofInsulationType: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {INSULATION_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roof Insulation Thickness (mm)</label>
                <Input
                  type="number"
                  step="10"
                  value={data.insulation?.roofInsulationThickness || ''}
                  onChange={(e) => setData({
                    ...data,
                    insulation: { ...data.insulation, roofInsulationThickness: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Floor Insulation Type</label>
                <select
                  value={data.insulation?.floorInsulationType || ''}
                  onChange={(e) => setData({
                    ...data,
                    insulation: { ...data.insulation, floorInsulationType: e.target.value || undefined }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select type...</option>
                  {INSULATION_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Floor Insulation Thickness (mm)</label>
                <Input
                  type="number"
                  step="10"
                  value={data.insulation?.floorInsulationThickness || ''}
                  onChange={(e) => setData({
                    ...data,
                    insulation: { ...data.insulation, floorInsulationThickness: e.target.value ? parseInt(e.target.value, 10) : undefined }
                  })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Insulation Notes</label>
              <textarea
                value={data.insulation?.notes || ''}
                onChange={(e) => setData({
                  ...data,
                  insulation: { ...data.insulation, notes: e.target.value }
                })}
                className="w-full min-h-[60px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Extraction Notes */}
          {data.extractionNotes && (
            <div className="pt-2 border-t">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground">{data.extractionNotes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Continue to Wizard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
