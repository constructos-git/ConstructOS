import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, Check } from 'lucide-react';
import type { RoofStyle } from './RoofStyleStep';

export interface FasciaSoffitConfig {
  fasciaHeight: number; // mm
  soffitDepth: number; // mm
  fasciaLocations: {
    front: boolean;
    back: boolean;
    left: boolean;
    right: boolean;
  };
  soffitLocations: {
    front: boolean;
    back: boolean;
    left: boolean;
    right: boolean;
  };
}

export function FasciaSoffitStep({
  config,
  roofStyle,
  extensionWidth,
  extensionDepth,
  onComplete,
  onBack,
  onUpdate,
}: {
  config: FasciaSoffitConfig;
  roofStyle: RoofStyle;
  extensionWidth: number;
  extensionDepth: number;
  onComplete: () => void;
  onBack: () => void;
  onUpdate: (config: FasciaSoffitConfig) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = 900;
  const canvasHeight = 600;

  // Default values based on roof style
  const defaultFasciaHeight = roofStyle === 'flat' ? 250 : 250;
  const defaultSoffitDepth = roofStyle === 'flat' ? 150 : 250;

  useEffect(() => {
    if (config.fasciaHeight === 0) {
      onUpdate({ ...config, fasciaHeight: defaultFasciaHeight });
    }
    if (config.soffitDepth === 0) {
      onUpdate({ ...config, soffitDepth: defaultSoffitDepth });
    }
  }, [roofStyle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw extension outline (elevation view)
    const extX = 100;
    const extY = 100;
    const extWidth = Math.min(extensionWidth * 20, 400);
    const extHeight = Math.min(extensionDepth * 20, 200);

    // Extension wall
    ctx.fillStyle = '#e5e7eb';
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.fillRect(extX, extY, extWidth, extHeight);
    ctx.strokeRect(extX, extY, extWidth, extHeight);

    // Draw roof
    if (roofStyle === 'flat') {
      // Flat roof
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(extX, extY, extWidth, 20);
      ctx.strokeRect(extX, extY, extWidth, 20);
    } else {
      // Pitched roof
      const pitchHeight = 60;
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(extX, extY);
      ctx.lineTo(extX + extWidth / 2, extY - pitchHeight);
      ctx.lineTo(extX + extWidth, extY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw fascia (shown as thicker line at roof edge)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    if (config.fasciaLocations.front) {
      ctx.beginPath();
      ctx.moveTo(extX, extY);
      ctx.lineTo(extX + extWidth, extY);
      ctx.stroke();
    }
    if (config.fasciaLocations.back) {
      ctx.beginPath();
      ctx.moveTo(extX, extY + extHeight);
      ctx.lineTo(extX + extWidth, extY + extHeight);
      ctx.stroke();
    }
    if (config.fasciaLocations.left) {
      ctx.beginPath();
      ctx.moveTo(extX, extY);
      ctx.lineTo(extX, extY + extHeight);
      ctx.stroke();
    }
    if (config.fasciaLocations.right) {
      ctx.beginPath();
      ctx.moveTo(extX + extWidth, extY);
      ctx.lineTo(extX + extWidth, extY + extHeight);
      ctx.stroke();
    }

    // Draw soffit (shown as dashed line below fascia)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    if (config.soffitLocations.front) {
      ctx.beginPath();
      ctx.moveTo(extX, extY + 5);
      ctx.lineTo(extX + extWidth, extY + 5);
      ctx.stroke();
    }
    if (config.soffitLocations.back) {
      ctx.beginPath();
      ctx.moveTo(extX, extY + extHeight - 5);
      ctx.lineTo(extX + extWidth, extY + extHeight - 5);
      ctx.stroke();
    }
    if (config.soffitLocations.left) {
      ctx.beginPath();
      ctx.moveTo(extX + 5, extY);
      ctx.lineTo(extX + 5, extY + extHeight);
      ctx.stroke();
    }
    if (config.soffitLocations.right) {
      ctx.beginPath();
      ctx.moveTo(extX + extWidth - 5, extY);
      ctx.lineTo(extX + extWidth - 5, extY + extHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('Fascia (orange)', extX + extWidth + 10, extY + 15);
    ctx.fillText('Soffit (green)', extX + extWidth + 10, extY + 35);
  }, [config, roofStyle, extensionWidth, extensionDepth, canvasWidth, canvasHeight]);

  const toggleFasciaLocation = (location: keyof FasciaSoffitConfig['fasciaLocations']) => {
    onUpdate({
      ...config,
      fasciaLocations: {
        ...config.fasciaLocations,
        [location]: !config.fasciaLocations[location],
      },
    });
  };

  const toggleSoffitLocation = (location: keyof FasciaSoffitConfig['soffitLocations']) => {
    onUpdate({
      ...config,
      soffitLocations: {
        ...config.soffitLocations,
        [location]: !config.soffitLocations[location],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Fascia & Soffit Configuration</h2>
          <p className="text-sm text-muted-foreground">Configure fascia height, soffit depth, and locations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onComplete}>
            <Check className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fascia & Soffit Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fascia Height (mm)</label>
              <Input
                type="number"
                step="1"
                min="0"
                value={config.fasciaHeight}
                onChange={(e) => onUpdate({ ...config, fasciaHeight: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default: {defaultFasciaHeight}mm for {roofStyle} roof
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Soffit Depth (mm)</label>
              <Input
                type="number"
                step="1"
                min="0"
                value={config.soffitDepth}
                onChange={(e) => onUpdate({ ...config, soffitDepth: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default: {defaultSoffitDepth}mm for {roofStyle} roof
              </p>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">Fascia Locations</label>
              <div className="grid grid-cols-2 gap-2">
                {(['front', 'back', 'left', 'right'] as const).map((loc) => (
                  <Button
                    key={loc}
                    variant={config.fasciaLocations[loc] ? 'primary' : 'secondary'}
                    onClick={() => toggleFasciaLocation(loc)}
                    className="capitalize"
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">Soffit Locations</label>
              <div className="grid grid-cols-2 gap-2">
                {(['front', 'back', 'left', 'right'] as const).map((loc) => (
                  <Button
                    key={loc}
                    variant={config.soffitLocations[loc] ? 'primary' : 'secondary'}
                    onClick={() => toggleSoffitLocation(loc)}
                    className="capitalize"
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Elevation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div>• Orange lines = Fascia locations</div>
              <div>• Green dashed lines = Soffit locations</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

