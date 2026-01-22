// Solid Floor Configuration Panel
// Includes measurements, labour, materials, and plant configuration

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface SolidFloorConfig {
  // Measurements
  floorArea: number; // m²
  floorThickness: number; // mm
  insulationThickness: number; // mm
  screedThickness: number; // mm
  
  // Materials
  concreteGrade: string;
  insulationType: string;
  dpm: boolean; // Damp Proof Membrane
  reinforcementMesh: boolean;
  meshType: string;
  
  // Labour
  preparationMethod: string;
  concretePlacement: string;
  screedType: string;
  
  // Plant
  concretePump: boolean;
  vibratingScreed: boolean;
}

interface SolidFloorConfigPanelProps {
  config: SolidFloorConfig;
  onConfigChange: (config: SolidFloorConfig) => void;
}

export function SolidFloorConfigPanel({
  config,
  onConfigChange,
}: SolidFloorConfigPanelProps) {
  const handleChange = (key: keyof SolidFloorConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  // Calculate volumes and areas
  const calculations = useMemo(() => {
    const floorThicknessM = config.floorThickness / 1000;
    const insulationThicknessM = config.insulationThickness / 1000;
    const screedThicknessM = config.screedThickness / 1000;
    
    const concreteVolume = config.floorArea * floorThicknessM;
    const insulationVolume = config.floorArea * insulationThicknessM;
    const screedVolume = config.floorArea * screedThicknessM;
    const meshArea = config.reinforcementMesh ? config.floorArea : 0;
    
    return {
      concreteVolume: concreteVolume.toFixed(2),
      insulationVolume: insulationVolume.toFixed(2),
      screedVolume: screedVolume.toFixed(2),
      meshArea: meshArea.toFixed(2),
    };
  }, [config]);

  return (
    <Tabs defaultValue="measurements" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="measurements">Measurements</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="labour">Labour</TabsTrigger>
        <TabsTrigger value="plant">Plant</TabsTrigger>
      </TabsList>

      {/* Measurements Tab */}
      <TabsContent value="measurements" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Measurements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Floor Area (m²)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={config.floorArea}
                onChange={(e) =>
                  handleChange('floorArea', parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Floor Thickness (mm)
              </label>
              <Input
                type="number"
                step="10"
                min="0"
                value={config.floorThickness}
                onChange={(e) =>
                  handleChange('floorThickness', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Insulation Thickness (mm)
              </label>
              <Input
                type="number"
                step="10"
                min="0"
                value={config.insulationThickness}
                onChange={(e) =>
                  handleChange('insulationThickness', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Screed Thickness (mm)
              </label>
              <Input
                type="number"
                step="5"
                min="0"
                value={config.screedThickness}
                onChange={(e) =>
                  handleChange('screedThickness', parseInt(e.target.value) || 0)
                }
              />
            </div>

            {/* Calculated Values */}
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm font-medium mb-2">Calculated Values</div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Concrete Volume:</span>
                <span className="font-medium">{calculations.concreteVolume} m³</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Insulation Volume:</span>
                <span className="font-medium">{calculations.insulationVolume} m³</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Screed Volume:</span>
                <span className="font-medium">{calculations.screedVolume} m³</span>
              </div>
              {config.reinforcementMesh && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mesh Area:</span>
                  <span className="font-medium">{calculations.meshArea} m²</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Materials Tab */}
      <TabsContent value="materials" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Concrete Grade
              </label>
              <select
                value={config.concreteGrade}
                onChange={(e) => handleChange('concreteGrade', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="C20">C20</option>
                <option value="C25">C25</option>
                <option value="C30">C30</option>
                <option value="C35">C35</option>
                <option value="C40">C40</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Insulation Type
              </label>
              <select
                value={config.insulationType}
                onChange={(e) => handleChange('insulationType', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="eps">EPS (Expanded Polystyrene)</option>
                <option value="xps">XPS (Extruded Polystyrene)</option>
                <option value="pir">PIR (Polyisocyanurate)</option>
                <option value="mineral-wool">Mineral Wool</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={config.dpm}
                onCheckedChange={(checked) => handleChange('dpm', checked)}
              />
              <span className="text-sm font-medium">Damp Proof Membrane (DPM)</span>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={config.reinforcementMesh}
                onCheckedChange={(checked) => handleChange('reinforcementMesh', checked)}
              />
              <span className="text-sm font-medium">Reinforcement Mesh</span>
            </div>

            {config.reinforcementMesh && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mesh Type
                </label>
                <select
                  value={config.meshType}
                  onChange={(e) => handleChange('meshType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="A142">A142 (6mm @ 200mm centres)</option>
                  <option value="A193">A193 (7mm @ 200mm centres)</option>
                  <option value="A252">A252 (8mm @ 200mm centres)</option>
                  <option value="A393">A393 (10mm @ 200mm centres)</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Labour Tab */}
      <TabsContent value="labour" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Labour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Preparation Method
              </label>
              <select
                value={config.preparationMethod}
                onChange={(e) => handleChange('preparationMethod', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="hardcore">Hardcore & Blinding</option>
                <option value="existing">Existing Sub-base</option>
                <option value="compacted">Compacted Fill</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Concrete Placement Method
              </label>
              <select
                value={config.concretePlacement}
                onChange={(e) => handleChange('concretePlacement', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="pump">Concrete Pump</option>
                <option value="skip">Skip Discharge</option>
                <option value="wheelbarrow">Wheelbarrow</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Screed Type
              </label>
              <select
                value={config.screedType}
                onChange={(e) => handleChange('screedType', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="sand-cement">Sand & Cement Screed</option>
                <option value="flowing">Flowing Screed</option>
                <option value="no-screed">No Screed (Direct Finish)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Plant Tab */}
      <TabsContent value="plant" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plant & Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={config.concretePump}
                onCheckedChange={(checked) => handleChange('concretePump', checked)}
              />
              <span className="text-sm font-medium">Concrete Pump Required</span>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={config.vibratingScreed}
                onCheckedChange={(checked) => handleChange('vibratingScreed', checked)}
              />
              <span className="text-sm font-medium">Vibrating Screed Required</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

