import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

export type RoofStyle = 'flat' | 'pitched' | 'hipped' | 'mansard';
export type RidgeDirection = 'north-south' | 'east-west';

export interface RoofConfig {
  style: RoofStyle;
  ridgeDirection: RidgeDirection;
  eavesLocation: 'all' | 'front' | 'back' | 'sides';
  abutsExisting: boolean;
  abutmentLocation?: 'left' | 'right' | 'back';
}

export function RoofStyleStep({
  config,
  extensionWidth,
  extensionDepth,
  onNext,
  onBack,
  onUpdate,
}: {
  config: RoofConfig;
  extensionWidth: number;
  extensionDepth: number;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (config: RoofConfig) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canvasWidth = 900;
  const canvasHeight = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw extension outline (top-down view)
    const extX = 50;
    const extY = 50;
    const extWidth = Math.min(extensionWidth * 20, 400); // Scale
    const extDepth = Math.min(extensionDepth * 20, 250); // Scale

    // Base rectangle
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(extX, extY, extWidth, extDepth);

    // Draw roof based on style
    if (config.style === 'flat') {
      // Flat roof - just show the outline
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(extX, extY, extWidth, extDepth);
      ctx.fillStyle = '#1e40af';
      ctx.font = '14px sans-serif';
      ctx.fillText('Flat Roof', extX + extWidth / 2 - 30, extY + extDepth / 2);
    } else if (config.style === 'pitched') {
      // Pitched roof - draw ridge line and roof planes
      const ridgeY = extY + extDepth / 2;
      const pitchHeight = 80;

      // Left roof plane
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(extX, extY);
      ctx.lineTo(extX + extWidth / 2, ridgeY - pitchHeight);
      ctx.lineTo(extX + extWidth / 2, ridgeY + pitchHeight);
      ctx.lineTo(extX, extY + extDepth);
      ctx.closePath();
      ctx.fill();

      // Right roof plane
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(extX + extWidth, extY);
      ctx.lineTo(extX + extWidth / 2, ridgeY - pitchHeight);
      ctx.lineTo(extX + extWidth / 2, ridgeY + pitchHeight);
      ctx.lineTo(extX + extWidth, extY + extDepth);
      ctx.closePath();
      ctx.fill();

      // Ridge line
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(extX + extWidth / 2, ridgeY - pitchHeight);
      ctx.lineTo(extX + extWidth / 2, ridgeY + pitchHeight);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `Pitched Roof (${config.ridgeDirection})`,
        extX + extWidth / 2 - 60,
        ridgeY - pitchHeight - 10
      );
    } else if (config.style === 'hipped') {
      // Hipped roof - similar to pitched but with hips
      const ridgeY = extY + extDepth / 2;
      const pitchHeight = 80;
      const hipLength = 40;

      // Draw hipped ends
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(extX, extY);
      ctx.lineTo(extX + hipLength, extY + hipLength);
      ctx.lineTo(extX + extWidth / 2, ridgeY - pitchHeight);
      ctx.lineTo(extX + extWidth - hipLength, extY + hipLength);
      ctx.lineTo(extX + extWidth, extY);
      ctx.closePath();
      ctx.fill();

      // Main roof planes
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(extX + hipLength, extY + hipLength);
      ctx.lineTo(extX + extWidth / 2, ridgeY - pitchHeight);
      ctx.lineTo(extX + extWidth / 2, ridgeY + pitchHeight);
      ctx.lineTo(extX + extWidth - hipLength, extY + extDepth - hipLength);
      ctx.lineTo(extX + extWidth, extY + extDepth);
      ctx.lineTo(extX + extWidth, extY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.fillText('Hipped Roof', extX + extWidth / 2 - 40, ridgeY - pitchHeight - 10);
    }

    // Draw eaves if specified
    if (config.eavesLocation !== 'all') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      if (config.eavesLocation === 'front' || config.eavesLocation === 'all') {
        ctx.beginPath();
        ctx.moveTo(extX, extY);
        ctx.lineTo(extX + extWidth, extY);
        ctx.stroke();
      }
      if (config.eavesLocation === 'back' || config.eavesLocation === 'all') {
        ctx.beginPath();
        ctx.moveTo(extX, extY + extDepth);
        ctx.lineTo(extX + extWidth, extY + extDepth);
        ctx.stroke();
      }
      if (config.eavesLocation === 'sides' || config.eavesLocation === 'all') {
        ctx.beginPath();
        ctx.moveTo(extX, extY);
        ctx.lineTo(extX, extY + extDepth);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(extX + extWidth, extY);
        ctx.lineTo(extX + extWidth, extY + extDepth);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw abutment if specified
    if (config.abutsExisting && config.abutmentLocation) {
      ctx.fillStyle = '#d1d5db';
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      if (config.abutmentLocation === 'left') {
        ctx.fillRect(extX - 30, extY, 30, extDepth);
        ctx.strokeRect(extX - 30, extY, 30, extDepth);
      } else if (config.abutmentLocation === 'right') {
        ctx.fillRect(extX + extWidth, extY, 30, extDepth);
        ctx.strokeRect(extX + extWidth, extY, 30, extDepth);
      } else if (config.abutmentLocation === 'back') {
        ctx.fillRect(extX, extY + extDepth, extWidth, 30);
        ctx.strokeRect(extX, extY + extDepth, extWidth, 30);
      }
    }
  }, [config, extensionWidth, extensionDepth, canvasWidth, canvasHeight]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Roof Style Configuration</h2>
          <p className="text-sm text-muted-foreground">Choose your roof style and configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Next: Fascia & Soffit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Configuration Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roof Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Roof Style</label>
              <div className="grid grid-cols-2 gap-2">
                {(['flat', 'pitched', 'hipped', 'mansard'] as RoofStyle[]).map((style) => (
                  <Button
                    key={style}
                    variant={config.style === style ? 'primary' : 'secondary'}
                    onClick={() => onUpdate({ ...config, style })}
                    className="capitalize"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            {config.style === 'pitched' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Ridge Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={config.ridgeDirection === 'north-south' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate({ ...config, ridgeDirection: 'north-south' })}
                  >
                    North-South
                  </Button>
                  <Button
                    variant={config.ridgeDirection === 'east-west' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate({ ...config, ridgeDirection: 'east-west' })}
                  >
                    East-West
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Eaves Location</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={config.eavesLocation}
                onChange={(e) => onUpdate({ ...config, eavesLocation: e.target.value as RoofConfig['eavesLocation'] })}
              >
                <option value="all">All Sides</option>
                <option value="front">Front Only</option>
                <option value="back">Back Only</option>
                <option value="sides">Sides Only</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.abutsExisting}
                  onChange={(e) => onUpdate({ ...config, abutsExisting: e.target.checked })}
                />
                Roof abuts existing property
              </label>
            </div>

            {config.abutsExisting && (
              <div>
                <label className="text-sm font-medium mb-2 block">Abutment Location</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={config.abutmentLocation === 'left' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate({ ...config, abutmentLocation: 'left' })}
                  >
                    Left
                  </Button>
                  <Button
                    variant={config.abutmentLocation === 'right' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate({ ...config, abutmentLocation: 'right' })}
                  >
                    Right
                  </Button>
                  <Button
                    variant={config.abutmentLocation === 'back' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate({ ...config, abutmentLocation: 'back' })}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visual Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roof Preview</CardTitle>
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
            <div className="mt-2 text-xs text-muted-foreground">
              Top-down view showing roof style and configuration
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

