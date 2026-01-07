import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Maximize2, Grid3x3 } from 'lucide-react';

export interface PlanViewConfig {
  extensionWidth: number; // metres
  extensionDepth: number; // metres
  extensionHeight: number; // metres
  existingPropertyWidth: number; // metres
  existingPropertyDepth: number; // metres
  existingPropertyX: number; // pixels on canvas
  existingPropertyY: number; // pixels on canvas
  attachmentSide: 'front' | 'back' | 'left' | 'right' | null; // Which side of existing property to attach to
  existingWindows: Array<{ x: number; y: number; width: number; height: number; type: 'window' | 'door' }>; // Windows/doors on existing property
  existingRoofStyle: 'pitched' | 'flat' | 'hipped' | 'gable' | null; // Roof style of existing property
}

export function PlanViewStep({
  config,
  onNext,
  onBack,
  onUpdate,
}: {
  config: PlanViewConfig;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (config: PlanViewConfig) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingMode, setDrawingMode] = useState<'existing' | 'extension' | null>(null);
  const [zoom, setZoom] = useState(1); // Zoom level (1 = 100%)
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Pan offset
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingProperty, setIsDraggingProperty] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Canvas dimensions - increased for better visibility
  const canvasWidth = 1600;
  const canvasHeight = 1200;
  const scale = 50; // pixels per metre (increased significantly for much larger display)
  const gridSpacing = 25; // 0.5 metres at 50px/m scale (smaller grid for better alignment)

  // Snap coordinate to nearest grid line (aligns with grid, not centers on intersections)
  const snapToGridPoint = useCallback((value: number) => {
    if (!snapToGrid) return value;
    // Snap to the nearest grid line
    return Math.round(value / gridSpacing) * gridSpacing;
  }, [snapToGrid, gridSpacing]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(4, zoom * delta));
    setZoom(newZoom);
  }, [zoom]);

  // Get existing property dimensions in pixels
  const existingPropertyWidthPx = (config.existingPropertyWidth || 10) * scale;
  const existingPropertyDepthPx = (config.existingPropertyDepth || 8) * scale;

  // Check if click is inside existing property
  const isPointInProperty = useCallback((x: number, y: number) => {
    if (config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0) return false;
    const widthPx = config.existingPropertyWidth * scale;
    const depthPx = config.existingPropertyDepth * scale;
    return (
      x >= config.existingPropertyX &&
      x <= config.existingPropertyX + widthPx &&
      y >= config.existingPropertyY &&
      y <= config.existingPropertyY + depthPx
    );
  }, [config, scale]);

  // Check if click is on a wall label (A, B, C, D)
  const getClickedWall = useCallback((x: number, y: number): 'front' | 'back' | 'left' | 'right' | null => {
    if (config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0) return null;
    const widthPx = config.existingPropertyWidth * scale;
    const depthPx = config.existingPropertyDepth * scale;
    const labelRadius = 20; // Clickable area around labels
    
    // Check Wall A (front/bottom) - center bottom
    const wallAY = config.existingPropertyY + depthPx;
    const wallAX = config.existingPropertyX + widthPx / 2;
    if (Math.abs(x - wallAX) < labelRadius && Math.abs(y - wallAY) < labelRadius + 15) {
      return 'front';
    }
    
    // Check Wall B (right) - center right
    const wallBX = config.existingPropertyX + widthPx;
    const wallBY = config.existingPropertyY + depthPx / 2;
    if (Math.abs(x - wallBX) < labelRadius + 15 && Math.abs(y - wallBY) < labelRadius) {
      return 'right';
    }
    
    // Check Wall C (back/top) - center top
    const wallCY = config.existingPropertyY;
    const wallCX = config.existingPropertyX + widthPx / 2;
    if (Math.abs(x - wallCX) < labelRadius && Math.abs(y - wallCY) < labelRadius + 15) {
      return 'back';
    }
    
    // Check Wall D (left) - center left
    const wallDX = config.existingPropertyX;
    const wallDY = config.existingPropertyY + depthPx / 2;
    if (Math.abs(x - wallDX) < labelRadius + 15 && Math.abs(y - wallDY) < labelRadius) {
      return 'left';
    }
    
    return null;
  }, [config, scale]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if clicking on a wall label to select attachment side
    const clickedWall = getClickedWall(x, y);
    if (clickedWall && !drawingMode) {
      onUpdate({ ...config, attachmentSide: clickedWall });
      e.preventDefault();
      return;
    }
    
    // Check if clicking on existing property to drag it
    if (isPointInProperty(x, y) && !drawingMode) {
      setIsDraggingProperty(true);
      setDragOffset({
        x: x - config.existingPropertyX,
        y: y - config.existingPropertyY,
      });
      e.preventDefault();
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.ctrlKey) || (e.button === 0 && e.metaKey)) {
      // Middle mouse button or Ctrl/Cmd + Left click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    } else if (drawingMode === 'existing') {
      // Start dragging to place existing property
      setIsDraggingProperty(true);
      const widthPx = existingPropertyWidthPx;
      const depthPx = existingPropertyDepthPx;
      setDragOffset({
        x: widthPx / 2,
        y: depthPx / 2,
      });
      // Place it initially at click position (snapped to grid)
      const snappedX = snapToGridPoint(x - widthPx / 2);
      const snappedY = snapToGridPoint(y - depthPx / 2);
      onUpdate({
        ...config,
        existingPropertyX: snappedX,
        existingPropertyY: snappedY,
      });
      e.preventDefault();
    }
  }, [pan, zoom, drawingMode, scale, config, onUpdate, isPointInProperty, snapToGridPoint, getClickedWall]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingProperty) {
      // Drag existing property
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      // Calculate position with drag offset, then snap to grid
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      const snappedX = snapToGridPoint(newX);
      const snappedY = snapToGridPoint(newY);

      onUpdate({
        ...config,
        existingPropertyX: snappedX,
        existingPropertyY: snappedY,
      });
    } else if (isPanning) {
      // Pan the view
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isDraggingProperty, isPanning, panStart, pan, zoom, dragOffset, config, onUpdate, scale, snapToGridPoint]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDraggingProperty && drawingMode === 'existing') {
      // Finished placing property, exit drawing mode
      setDrawingMode(null);
    }
    setIsPanning(false);
    setIsDraggingProperty(false);
  }, [isDraggingProperty, drawingMode]);

  // Reset zoom and pan
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Fit to view - zoom and pan to show both existing property and extension
  const handleFitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get container dimensions (accounting for padding/borders)
    const containerRect = container.getBoundingClientRect();
    const viewWidth = containerRect.width - 20; // Account for padding
    const viewHeight = containerRect.height - 20;

    // Calculate bounding box of all visible elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Include existing property if placed
    if (config.existingPropertyWidth > 0 && config.existingPropertyDepth > 0) {
      const widthPx = config.existingPropertyWidth * scale;
      const depthPx = config.existingPropertyDepth * scale;
      minX = Math.min(minX, config.existingPropertyX);
      minY = Math.min(minY, config.existingPropertyY);
      maxX = Math.max(maxX, config.existingPropertyX + widthPx);
      maxY = Math.max(maxY, config.existingPropertyY + depthPx);
    }

    // Include extension if dimensions are set
    if (config.extensionWidth > 0 && config.extensionDepth > 0) {
      const attachmentSide = config.attachmentSide || 'right';
      const widthPx = config.existingPropertyWidth * scale;
      const depthPx = config.existingPropertyDepth * scale;
      let extX: number;
      let extY: number;
      let extWidthPx: number;
      let extDepthPx: number;
      
      if (config.existingPropertyWidth > 0 && config.existingPropertyDepth > 0 && config.existingPropertyX !== 0 && config.existingPropertyY !== 0) {
        switch (attachmentSide) {
          case 'right':
            extX = config.existingPropertyX + widthPx;
            extY = config.existingPropertyY;
            extWidthPx = config.extensionWidth * scale;
            extDepthPx = config.extensionDepth * scale;
            break;
          case 'left':
            extWidthPx = config.extensionWidth * scale;
            extDepthPx = config.extensionDepth * scale;
            extX = config.existingPropertyX - extDepthPx;
            extY = config.existingPropertyY;
            break;
          case 'back':
            extWidthPx = config.extensionWidth * scale;
            extDepthPx = config.extensionDepth * scale;
            extX = config.existingPropertyX;
            extY = config.existingPropertyY - extDepthPx;
            break;
          case 'front':
            extX = config.existingPropertyX;
            extY = config.existingPropertyY + depthPx;
            extWidthPx = config.extensionWidth * scale;
            extDepthPx = config.extensionDepth * scale;
            break;
          default:
            extX = 200;
            extY = 200;
            extWidthPx = config.extensionWidth * scale;
            extDepthPx = config.extensionDepth * scale;
        }
      } else {
        extX = 200;
        extY = 200;
        extWidthPx = config.extensionWidth * scale;
        extDepthPx = config.extensionDepth * scale;
      }
      
      // Apply snap to grid if enabled
      if (snapToGrid) {
        extX = snapToGridPoint(extX);
        extY = snapToGridPoint(extY);
      }

      // Calculate bounds based on attachment side
      if (attachmentSide === 'right' || attachmentSide === 'left') {
        minX = Math.min(minX, extX);
        minY = Math.min(minY, extY);
        maxX = Math.max(maxX, extX + extDepthPx);
        maxY = Math.max(maxY, extY + extWidthPx);
      } else {
        minX = Math.min(minX, extX);
        minY = Math.min(minY, extY);
        maxX = Math.max(maxX, extX + extWidthPx);
        maxY = Math.max(maxY, extY + extDepthPx);
      }
    }

    // If nothing is placed, reset to default view
    if (minX === Infinity || minY === Infinity) {
      handleResetView();
      return;
    }

    // Add padding around the content
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate zoom to fit
    const zoomX = viewWidth / contentWidth;
    const zoomY = viewHeight / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 2); // Cap at 200% zoom

    // Calculate pan to center
    const newPanX = viewWidth / 2 - centerX * newZoom;
    const newPanY = viewHeight / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [config, scale, handleResetView, snapToGrid, snapToGridPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid (larger grid spacing for better visibility at larger scale)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvasWidth; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw existing property (if placed)
    if (config.existingPropertyWidth > 0 && config.existingPropertyDepth > 0) {
      const widthPx = config.existingPropertyWidth * scale;
      const depthPx = config.existingPropertyDepth * scale;
      
      ctx.fillStyle = '#d1d5db';
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.fillRect(
        config.existingPropertyX,
        config.existingPropertyY,
        widthPx,
        depthPx
      );
      ctx.strokeRect(
        config.existingPropertyX,
        config.existingPropertyY,
        widthPx,
        depthPx
      );

      // Draw wall labels (A, B, C, D) for attachment selection
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wall A (front/bottom)
      ctx.fillText('A', config.existingPropertyX + widthPx / 2, config.existingPropertyY + depthPx + 15);
      // Wall B (right)
      ctx.fillText('B', config.existingPropertyX + widthPx + 15, config.existingPropertyY + depthPx / 2);
      // Wall C (back/top)
      ctx.fillText('C', config.existingPropertyX + widthPx / 2, config.existingPropertyY - 15);
      // Wall D (left)
      ctx.fillText('D', config.existingPropertyX - 15, config.existingPropertyY + depthPx / 2);
      
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `Existing Property (${config.existingPropertyWidth}m × ${config.existingPropertyDepth}m)`,
        config.existingPropertyX + 10,
        config.existingPropertyY + 20
      );
      
      // Draw windows and doors if any
      if (config.existingWindows && config.existingWindows.length > 0) {
        config.existingWindows.forEach((window) => {
          ctx.fillStyle = window.type === 'door' ? '#8b5cf6' : '#3b82f6';
          ctx.fillRect(
            config.existingPropertyX + window.x * scale,
            config.existingPropertyY + window.y * scale,
            window.width * scale,
            window.height * scale
          );
          ctx.strokeStyle = window.type === 'door' ? '#6d28d9' : '#1e40af';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            config.existingPropertyX + window.x * scale,
            config.existingPropertyY + window.y * scale,
            window.width * scale,
            window.height * scale
          );
        });
      }
      
      // Draw roof style indicator if set
      if (config.existingRoofStyle) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px sans-serif';
        ctx.fillText(
          `Roof: ${config.existingRoofStyle}`,
          config.existingPropertyX + 10,
          config.existingPropertyY + depthPx - 10
        );
      }
    }

    // Draw extension (if dimensions set) - position relative to existing property or default position
    if (config.extensionWidth > 0 && config.extensionDepth > 0) {
      // Calculate extension position based on attachment side
      // Width = dimension parallel to attachment wall
      // Depth = projection from existing property outward
      let extX: number;
      let extY: number;
      let extWidthPx: number;
      let extDepthPx: number;
      
      const attachmentSide = config.attachmentSide || 'right'; // Default to right if not set
      const widthPx = config.existingPropertyWidth * scale;
      const depthPx = config.existingPropertyDepth * scale;
      
      if (config.existingPropertyWidth > 0 && config.existingPropertyDepth > 0 && config.existingPropertyX !== 0 && config.existingPropertyY !== 0) {
        // Calculate extension position based on attachment side
        switch (attachmentSide) {
          case 'right':
            // Attach to right side: extension extends to the right
            extX = config.existingPropertyX + widthPx;
            extY = config.existingPropertyY;
            extWidthPx = config.extensionWidth * scale; // Vertical dimension
            extDepthPx = config.extensionDepth * scale; // Horizontal dimension (projection)
            break;
          case 'left':
            // Attach to left side: extension extends to the left
            extWidthPx = config.extensionWidth * scale; // Vertical dimension
            extDepthPx = config.extensionDepth * scale; // Horizontal dimension (projection)
            extX = config.existingPropertyX - extDepthPx;
            extY = config.existingPropertyY;
            break;
          case 'back':
            // Attach to back side: extension extends backward (up)
            extWidthPx = config.extensionWidth * scale; // Horizontal dimension
            extDepthPx = config.extensionDepth * scale; // Vertical dimension (projection)
            extX = config.existingPropertyX;
            extY = config.existingPropertyY - extDepthPx;
            break;
          case 'front':
            // Attach to front side: extension extends forward (down)
            extX = config.existingPropertyX;
            extY = config.existingPropertyY + depthPx;
            extWidthPx = config.extensionWidth * scale; // Horizontal dimension
            extDepthPx = config.extensionDepth * scale; // Vertical dimension (projection)
            break;
          default:
            extX = 200;
            extY = 200;
            extWidthPx = config.extensionWidth * scale;
            extDepthPx = config.extensionDepth * scale;
        }
      } else {
        // Default position if existing property not placed
        extX = 200;
        extY = 200;
        extWidthPx = config.extensionWidth * scale;
        extDepthPx = config.extensionDepth * scale;
      }
      
      // Snap extension to grid if enabled
      if (snapToGrid) {
        extX = snapToGridPoint(extX);
        extY = snapToGridPoint(extY);
      }

      ctx.fillStyle = '#60a5fa';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      // Draw extension rectangle
      ctx.fillRect(extX, extY, extDepthPx, extWidthPx);
      ctx.strokeRect(extX, extY, extDepthPx, extWidthPx);
      
      // Draw attachment indicator line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      switch (attachmentSide) {
        case 'right':
          ctx.moveTo(config.existingPropertyX + widthPx, config.existingPropertyY);
          ctx.lineTo(config.existingPropertyX + widthPx, config.existingPropertyY + depthPx);
          break;
        case 'left':
          ctx.moveTo(config.existingPropertyX, config.existingPropertyY);
          ctx.lineTo(config.existingPropertyX, config.existingPropertyY + depthPx);
          break;
        case 'back':
          ctx.moveTo(config.existingPropertyX, config.existingPropertyY);
          ctx.lineTo(config.existingPropertyX + widthPx, config.existingPropertyY);
          break;
        case 'front':
          ctx.moveTo(config.existingPropertyX, config.existingPropertyY + depthPx);
          ctx.lineTo(config.existingPropertyX + widthPx, config.existingPropertyY + depthPx);
          break;
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `Extension (${config.extensionWidth}m × ${config.extensionDepth}m)`,
        extX + 10,
        extY + 20
      );

      // Dimensions - adjust based on attachment side
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px sans-serif';
      
      // Draw dimensions based on attachment side
      // Width is always parallel to attachment wall, depth is projection
      switch (attachmentSide) {
        case 'right':
        case 'left':
          // Width is vertical, depth is horizontal
          // Width dimension (vertical, on external wall)
          const extWallX = attachmentSide === 'right' ? extX + extDepthPx : extX;
          ctx.beginPath();
          ctx.moveTo(extWallX + (attachmentSide === 'right' ? 20 : -20), extY);
          ctx.lineTo(extWallX + (attachmentSide === 'right' ? 20 : -20), extY + extWidthPx);
          ctx.moveTo(extWallX + (attachmentSide === 'right' ? 15 : -15), extY);
          ctx.lineTo(extWallX + (attachmentSide === 'right' ? 25 : -25), extY);
          ctx.moveTo(extWallX + (attachmentSide === 'right' ? 15 : -15), extY + extWidthPx);
          ctx.lineTo(extWallX + (attachmentSide === 'right' ? 25 : -25), extY + extWidthPx);
          ctx.stroke();
          ctx.save();
          ctx.translate(extWallX + (attachmentSide === 'right' ? 30 : -30), extY + extWidthPx / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(`${config.extensionWidth}m`, 0, 0);
          ctx.restore();
          
          // Depth dimension (horizontal)
          ctx.beginPath();
          ctx.moveTo(extX, extY + extWidthPx + 20);
          ctx.lineTo(extX + extDepthPx, extY + extWidthPx + 20);
          ctx.moveTo(extX, extY + extWidthPx + 15);
          ctx.lineTo(extX, extY + extWidthPx + 25);
          ctx.moveTo(extX + extDepthPx, extY + extWidthPx + 15);
          ctx.lineTo(extX + extDepthPx, extY + extWidthPx + 25);
          ctx.stroke();
          ctx.fillText(`${config.extensionDepth}m`, extX + extDepthPx / 2 - 15, extY + extWidthPx + 35);
          break;
          
        case 'front':
        case 'back':
          // Width is horizontal, depth is vertical
          // Width dimension (horizontal, on external wall)
          const extWallY = attachmentSide === 'front' ? extY + extWidthPx : extY;
          ctx.beginPath();
          ctx.moveTo(extX, extWallY + (attachmentSide === 'front' ? 20 : -20));
          ctx.lineTo(extX + extWidthPx, extWallY + (attachmentSide === 'front' ? 20 : -20));
          ctx.moveTo(extX, extWallY + (attachmentSide === 'front' ? 15 : -15));
          ctx.lineTo(extX, extWallY + (attachmentSide === 'front' ? 25 : -25));
          ctx.moveTo(extX + extWidthPx, extWallY + (attachmentSide === 'front' ? 15 : -15));
          ctx.lineTo(extX + extWidthPx, extWallY + (attachmentSide === 'front' ? 25 : -25));
          ctx.stroke();
          ctx.fillText(`${config.extensionWidth}m`, extX + extWidthPx / 2 - 15, extWallY + (attachmentSide === 'front' ? 35 : -25));
          
          // Depth dimension (vertical)
          const depthWallX = attachmentSide === 'front' ? extX + extWidthPx + 20 : extX - 20;
          ctx.beginPath();
          ctx.moveTo(depthWallX, extY);
          ctx.lineTo(depthWallX, extY + extDepthPx);
          ctx.moveTo(depthWallX - 5, extY);
          ctx.lineTo(depthWallX + 5, extY);
          ctx.moveTo(depthWallX - 5, extY + extDepthPx);
          ctx.lineTo(depthWallX + 5, extY + extDepthPx);
          ctx.stroke();
          ctx.save();
          ctx.translate(depthWallX + (attachmentSide === 'front' ? 10 : -10), extY + extDepthPx / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(`${config.extensionDepth}m`, 0, 0);
          ctx.restore();
          break;
      }
    }

    // Restore transformations
    ctx.restore();
  }, [config, canvasWidth, canvasHeight, scale, zoom, pan, snapToGrid, snapToGridPoint]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(4, prev * 1.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.25, prev / 1.2));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Plan View - Enter Dimensions</h2>
          <p className="text-sm text-muted-foreground">Set the dimensions of your extension and place the existing property</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={onNext} 
            disabled={
              config.existingPropertyWidth <= 0 || 
              config.existingPropertyDepth <= 0 || 
              config.extensionWidth <= 0 || 
              config.extensionDepth <= 0
            }
          >
            Next: Roof Style
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Step 1: Place Existing Property */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 1: Place Existing Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Width (metres)
                <Tooltip content="Width of the existing property from side to side">
                  <span className="ml-1 text-xs text-muted-foreground">(side to side)</span>
                </Tooltip>
              </label>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.existingPropertyWidth || 10}
                  onChange={(e) => onUpdate({ ...config, existingPropertyWidth: parseFloat(e.target.value) || 0 })}
                />
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="0.1"
                  value={config.existingPropertyWidth || 10}
                  onChange={(e) => onUpdate({ ...config, existingPropertyWidth: parseFloat(e.target.value) || 0 })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground text-center">{(config.existingPropertyWidth || 10).toFixed(1)}m</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Depth (metres)
                <Tooltip content="Depth of the existing property from front to back">
                  <span className="ml-1 text-xs text-muted-foreground">(front to back)</span>
                </Tooltip>
              </label>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.existingPropertyDepth || 8}
                  onChange={(e) => onUpdate({ ...config, existingPropertyDepth: parseFloat(e.target.value) || 0 })}
                />
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.1"
                  value={config.existingPropertyDepth || 8}
                  onChange={(e) => onUpdate({ ...config, existingPropertyDepth: parseFloat(e.target.value) || 0 })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-muted-foreground text-center">{(config.existingPropertyDepth || 8).toFixed(1)}m</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Place Existing Property</p>
              <p className="text-xs text-muted-foreground">
                Click the button below, then click on the plan view to place where your existing property is located
              </p>
              <Button
                variant={drawingMode === 'existing' ? 'primary' : 'secondary'}
                onClick={() => setDrawingMode(drawingMode === 'existing' ? null : 'existing')}
                className="w-full"
                disabled={(config.existingPropertyWidth || 0) <= 0 || (config.existingPropertyDepth || 0) <= 0}
              >
                {drawingMode === 'existing' ? 'Click on plan to place' : 'Place Existing Property'}
              </Button>
              {config.existingPropertyX !== 0 && config.existingPropertyY !== 0 && (config.existingPropertyWidth || 0) > 0 && (config.existingPropertyDepth || 0) > 0 && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-xs text-green-700 dark:text-green-300">
                  ✓ Existing property placed
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Attachment Side Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 2: Select Attachment Side</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Which side should the extension attach to?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Click a wall label (A, B, C, D) on the plan view, or select from buttons below
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={config.attachmentSide === 'front' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onUpdate({ ...config, attachmentSide: 'front' })}
                  disabled={(config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0}
                  className="text-xs"
                >
                  Wall A (Front)
                </Button>
                <Button
                  variant={config.attachmentSide === 'right' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onUpdate({ ...config, attachmentSide: 'right' })}
                  disabled={(config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0}
                  className="text-xs"
                >
                  Wall B (Right)
                </Button>
                <Button
                  variant={config.attachmentSide === 'back' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onUpdate({ ...config, attachmentSide: 'back' })}
                  disabled={(config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0}
                  className="text-xs"
                >
                  Wall C (Back)
                </Button>
                <Button
                  variant={config.attachmentSide === 'left' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onUpdate({ ...config, attachmentSide: 'left' })}
                  disabled={(config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0}
                  className="text-xs"
                >
                  Wall D (Left)
                </Button>
              </div>
              {config.attachmentSide && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-xs text-green-700 dark:text-green-300">
                  ✓ Extension will attach to {config.attachmentSide === 'front' ? 'Wall A (Front)' : config.attachmentSide === 'right' ? 'Wall B (Right)' : config.attachmentSide === 'back' ? 'Wall C (Back)' : 'Wall D (Left)'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Extension Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 3: Extension Dimensions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Width (metres)
                <Tooltip content="Width is the measurement from side to side, parallel to the existing property">
                  <span className="ml-1 text-xs text-muted-foreground">(side to side)</span>
                </Tooltip>
              </label>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.extensionWidth}
                  onChange={(e) => onUpdate({ ...config, extensionWidth: parseFloat(e.target.value) || 0 })}
                  disabled={(config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0}
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={config.extensionWidth}
                  onChange={(e) => onUpdate({ ...config, extensionWidth: parseFloat(e.target.value) || 0 })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0}
                />
                <div className="text-xs text-muted-foreground text-center">{config.extensionWidth.toFixed(1)}m</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Depth (metres)
                <Tooltip content="Depth is the measurement from the existing house to the outside edge of the extension external wall">
                  <span className="ml-1 text-xs text-muted-foreground">(projection from house)</span>
                </Tooltip>
              </label>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.extensionDepth}
                  onChange={(e) => onUpdate({ ...config, extensionDepth: parseFloat(e.target.value) || 0 })}
                  disabled={config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0}
                />
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={config.extensionDepth}
                  onChange={(e) => onUpdate({ ...config, extensionDepth: parseFloat(e.target.value) || 0 })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0}
                />
                <div className="text-xs text-muted-foreground text-center">{config.extensionDepth.toFixed(1)}m</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Height (metres)</label>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={config.extensionHeight}
                  onChange={(e) => onUpdate({ ...config, extensionHeight: parseFloat(e.target.value) || 0 })}
                  disabled={config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0}
                />
                <input
                  type="range"
                  min="2.0"
                  max="5.0"
                  step="0.1"
                  value={config.extensionHeight}
                  onChange={(e) => onUpdate({ ...config, extensionHeight: parseFloat(e.target.value) || 0 })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={config.existingPropertyWidth === 0 || config.existingPropertyDepth === 0}
                />
                <div className="text-xs text-muted-foreground text-center">{config.extensionHeight.toFixed(1)}m</div>
              </div>
            </div>
            {((config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0) && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-xs text-yellow-700 dark:text-yellow-300">
                ⚠️ Please set dimensions and place the existing property first
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactive Plan View */}
        <Card className="md:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Plan View</CardTitle>
            <div className="flex items-center gap-2">
              <Tooltip content={snapToGrid ? "Snap to Grid: ON (click to disable)" : "Snap to Grid: OFF (click to enable)"}>
                <Button
                  variant={snapToGrid ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Zoom In (or use mouse wheel)">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Zoom Out (or use mouse wheel)">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Fit to View (show existing property and extension)">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFitToView}
                  className="h-8 w-8 p-0"
                  disabled={config.existingPropertyWidth === 0 && config.extensionWidth === 0}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Reset View">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetView}
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </Tooltip>
              <div className="text-xs text-muted-foreground px-2">
                {Math.round(zoom * 100)}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              ref={containerRef}
              className="border rounded-lg overflow-hidden bg-white relative" 
              style={{ maxHeight: '80vh', cursor: isPanning ? 'grabbing' : drawingMode ? 'crosshair' : 'grab' }}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className={
                  isDraggingProperty 
                    ? 'cursor-grabbing' 
                    : isPanning 
                    ? 'cursor-grabbing' 
                    : drawingMode === 'existing' 
                    ? 'cursor-move' 
                    : 'cursor-grab'
                }
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ display: 'block' }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <div>
                {drawingMode === 'existing' && 'Click and drag on the plan to place the existing property'}
                {!drawingMode && ((config.existingPropertyWidth || 0) === 0 || (config.existingPropertyDepth || 0) === 0 || config.existingPropertyX === 0 || config.existingPropertyY === 0) && 'Step 1: Set dimensions and place the existing property first'}
                {!drawingMode && (config.existingPropertyWidth || 0) > 0 && (config.existingPropertyDepth || 0) > 0 && config.existingPropertyX !== 0 && config.existingPropertyY !== 0 && 'Step 2: Enter extension dimensions to see the extension • Drag existing property to reposition'}
              </div>
              <div className="text-xs">
                Use mouse wheel to zoom • Ctrl/Cmd + drag to pan
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

