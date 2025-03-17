import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class Rectangle extends BaseShape {
  private gradientColor1: string = '#000000';
  private gradientColor2: string = '#000000';
  private gradientX1: number = -1;
  private gradientY1: number = 0;
  private gradientX2: number = 1;
  private gradientY2: number = 0;
  private gradientOpacity1: number = 1;
  private gradientOpacity2: number = 1;

  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    this.shape = new fabric.Rect({
      left: x,
      top: y,
      width: 0,
      height: 0,
      fill: 'rgba(0,0,200,0.5)',
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      data: { modelId: this.id, type: 'rect' },
    });
    console.log('Rectangle created with fill:', this.shape.fill, 'stroke:', this.shape.stroke);
  }

  updateShape(x: number, y: number): void {
    const rect = this.shape as fabric.Rect;
    rect.set({
      width: Math.abs(x - rect.left!),
      height: Math.abs(y - rect.top!),
    });
  }

  updateFromProperties(properties: any): void {
    const rect = this.shape as fabric.Rect;
    rect.set({
      left: properties.objectLeft ?? rect.left,
      top: properties.objectTop ?? rect.top,
      width: properties.rectWidth !== undefined ? properties.rectWidth  : {},
      height: properties.rectHeight !== undefined ? properties.rectHeight  : {},
      angle: properties.objectAngle ?? rect.angle,
      fill: properties.fillColor ?? rect.fill,

      stroke: properties.strokeColor ?? rect.stroke,
      // Only update width/height if explicitly provided (e.g., from sidebar)
   // ...(properties.rectWidth !== undefined ? { width: properties.rectWidth / (rect.scaleX || 1) } : {}),
    //...(properties.rectHeight !== undefined ? { height: properties.rectHeight / (rect.scaleY || 1) } : {}),
    });

    if (properties.fillType === 'gradient' && properties.gradientStops) {
      const gradient = new fabric.Gradient({
        type: properties.gradientType || 'linear',
        gradientUnits: 'objectBoundingBox',
        coords: {
          x1: (properties.gradientX1 ?? this.gradientX1) * rect.width! * 2,
          y1: (properties.gradientY1 ?? this.gradientY1) * rect.height! * 2,
          x2: (properties.gradientX2 ?? this.gradientX2) * rect.width! * 2,
          y2: (properties.gradientY2 ?? this.gradientY2) * rect.height! * 2,
        },
        colorStops: properties.gradientStops.map((stop: { offset: number; color: string; opacity: number }) => ({
          offset: stop.offset,
          color: this.hexToRgba(stop.color, stop.opacity),
        })),
      });
      rect.set('fill', gradient);
      this.gradientColor1 = properties.gradientStops[0]?.color || this.gradientColor1;
      this.gradientColor2 = properties.gradientStops[1]?.color || this.gradientColor2;
      this.gradientX1 = properties.gradientX1 ?? this.gradientX1;
      this.gradientY1 = properties.gradientY1 ?? this.gradientY1;
      this.gradientX2 = properties.gradientX2 ?? this.gradientX2;
      this.gradientY2 = properties.gradientY2 ?? this.gradientY2;
      this.gradientOpacity1 = properties.gradientStops[0]?.opacity || this.gradientOpacity1;
      this.gradientOpacity2 = properties.gradientStops[1]?.opacity || this.gradientOpacity2;
    } else {
      rect.set('fill', properties.fillColor ?? rect.fill);
    }
    rect.setCoords();
    this.canvas.requestRenderAll();
  }

  private hexToRgba(hex: string, opacity: number): string {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(opacity, 0), 1)})`;
    }
    return hex;
  }
}