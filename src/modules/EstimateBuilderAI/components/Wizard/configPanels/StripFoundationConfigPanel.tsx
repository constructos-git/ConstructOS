// Strip Foundation Configuration Panel
// Includes measurements, labour, materials, and plant configuration

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface StripFoundationConfig {
  // Measurements
  foundationRun: number; // meters
  trenchWidth: number; // mm
  excavationDepth: number; // mm
  concreteDepth: number; // mm
  
  // Materials
  concreteGrade: string;
  formwork: boolean;
  reinforcementMesh: boolean;
  meshType: string;
  
  // Labour
  excavationMethod: string;
  concretePlacement: string;
  
  // Plant
  excavatorType: string;
  concretePump: boolean;
}

interface StripFoundationConfigPanelProps {
  config: StripFoundationConfig;
  onConfigChange: (config: StripFoundationConfig) => void;
}

export function StripFoundationConfigPanel({
  config,
  onConfigChange,
}: StripFoundationConfigPanelProps) {
  const handleChange = (key: keyof StripFoundationConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  // Calculate volumes and pricing
  const calculations = useMemo(() => {
    const trenchWidthM = config.trenchWidth / 1000;
    const excavationDepthM = config.excavationDepth / 1000;
    const concreteDepthM = config.concreteDepth / 1000;
    
    const excavationVolume = config.foundationRun * trenchWidthM * excavationDepthM;
    const concreteVolume = config.foundationRun * trenchWidthM * concreteDepthM;
    const meshArea = config.reinforcementMesh ? config.foundationRun * trenchWidthM : 0;
    
    return {
      excavationVolume: excavationVolume.toFixed(2),
      concreteVolume: concreteVolume.toFixed(2),
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
                Foundation Run (m)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={config.foundationRun}
                onChange={(e) =>
                  handleChange('foundationRun', parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Trench Width (mm)
              </label>
              <Input
                type="number"
                step="10"
                min="0"
                value={config.trenchWidth}
                onChange={(e) =>
                  handleChange('trenchWidth', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Excavation Depth (mm)
              </label>
              <Input
                type="number"
                step="10"
                min="0"
                value={config.excavationDepth}
                onChange={(e) =>
                  handleChange('excavationDepth', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Concrete Depth (mm)
              </label>
              <Input
                type="number"
                step="10"
                min="0"
                value={config.concreteDepth}
                onChange={(e) =>
                  handleChange('concreteDepth', parseInt(e.target.value) || 0)
                }
              />
            </div>

            {/* Calculated Values */}
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm font-medium mb-2">Calculated Values</div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Excavation Volume:</span>
                <span className="font-medium">{calculations.excavationVolume} m³</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Concrete Volume:</span>
                <span className="font-medium">{calculations.concreteVolume} m³</span>
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

            <div className="flex items-center gap-2">
              <Checkbox
                checked={config.formwork}
                onCheckedChange={(checked) => handleChange('formwork', checked)}
              />
              <span className="text-sm font-medium">Formwork Required</span>
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
                Excavation Method
              </label>
              <select
                value={config.excavationMethod}
                onChange={(e) => handleChange('excavationMethod', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="machine">Machine Excavation</option>
                <option value="hand">Hand Excavation</option>
                <option value="mixed">Mixed (Machine + Hand)</option>
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Excavator Type
              </label>
              <select
                value={config.excavatorType}
                onChange={(e) => handleChange('excavatorType', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="1.5-tonne">1.5 Tonne Mini Excavator</option>
                <option value="3-tonne">3 Tonne Mini Excavator</option>
                <option value="5-tonne">5 Tonne Excavator</option>
                <option value="8-tonne">8 Tonne Excavator</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={config.concretePump}
                onCheckedChange={(checked) => handleChange('concretePump', checked)}
              />
              <span className="text-sm font-medium">Concrete Pump Required</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

