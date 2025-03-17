import { BaseShape } from "./base-shape";
import { fabric } from 'fabric';

export class CurvedLine extends BaseShape {
  private startX: number;
  private startY: number;
  private controlX: number = 0;
  private controlY: number = 0;
  private endX: number = 0;
  private endY: number = 0;
  private controlPoint: fabric.Circle | null = null;

  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.startX = x;
    this.startY = y;
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    const pathData = `M ${this.startX} ${this.startY} Q ${this.controlX} ${this.controlY} ${this.endX} ${this.endY}`;
    this.shape = new fabric.Path(pathData, {
      stroke: 'rgba(0,0,0,0.5)',
      strokeWidth: 2,
      fill: '',
      originX: 'left',
      originY: 'top',
      selectable: true,
      evented: true,
      objectCaching: false,
      data: { modelId: this.id, type: 'curvedLine' },
    });

    this.controlPoint = new fabric.Circle({
      left: this.getPointOnCurve(0.5).x,
      top: this.getPointOnCurve(0.5).y,
      radius: 3,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasBorders: false,
      hasControls: false,
      objectCaching: false,
      lockScalingX: true,
      lockScalingY: true,
    });

    this.controlPoint.on('moving', () => {
      if (this.controlPoint) {
        this.controlX = this.controlPoint.left!;
        this.controlY = this.controlPoint.top!;
        this.updateBezierControlFromMidpoint(this.controlX, this.controlY);
        this.updatePath();
      }
    });

    this.shape.on('moving', (options) => {
      const deltaX = (options.e as any)?.movementX || 0;
      const deltaY = (options.e as any)?.movementY || 0;
      this.startX += deltaX;
      this.startY += deltaY;
      this.controlX += deltaX;
      this.controlY += deltaY;
      this.endX += deltaX;
      this.endY += deltaY;
      this.updatePath();
    });

    this.canvas.add(this.controlPoint);
    this.controlPoint.bringToFront();
  }

  updateShape(x: number, y: number): void {
    this.endX = x;
    this.endY = y;
    const midX = (this.startX + this.endX) / 2;
    const midY = (this.startY + this.endY) / 2;
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const offset = distance * 0.5;
    this.controlX = midX;
    this.controlY = midY + (dy >= 0 ? offset : -offset);
    this.updatePath();
    if (this.controlPoint) {
      const midPoint = this.getPointOnCurve(0.5);
      this.controlPoint.set({ left: midPoint.x, top: midPoint.y });
      this.controlPoint.setCoords();
    }
    this.canvas.requestRenderAll();
  }

  updateFromProperties(properties: any): void {
    this.startX = properties.startX ?? this.startX;
    this.startY = properties.startY ?? this.startY;
    this.endX = properties.endX ?? this.endX;
    this.endY = properties.endY ?? this.endY;
    this.controlX = properties.controlX ?? this.controlX;
    this.controlY = properties.controlY ?? this.controlY;
    this.shape.set({
      stroke: properties.strokeColor ?? this.shape.stroke,
      strokeWidth: properties.strokeWidth ?? this.shape.strokeWidth,
      left: this.startX,
      top: this.startY,
    });
    this.updatePath();
    if (this.controlPoint) {
      const midPoint = this.getPointOnCurve(0.5);
      this.controlPoint.set({ left: midPoint.x, top: midPoint.y });
      this.controlPoint.setCoords();
    }
    this.shape.setCoords();
    this.canvas.requestRenderAll();
  }

  // Rest of the methods (getPointOnCurve, updatePath, etc.) remain unchanged
  private updatePath(): void {
    const pathData = `M ${this.startX} ${this.startY} Q ${this.controlX} ${this.controlY} ${this.endX} ${this.endY}`;
    const path = this.shape as fabric.Path;
    this.canvas.remove(this.shape);
    this.shape = new fabric.Path(pathData, {
      stroke: path.stroke,
      strokeWidth: path.strokeWidth,
      fill: path.fill,
      originX: 'left',
      originY: 'top',
      selectable: true,
      evented: true,
      objectCaching: false,
      data: { modelId: this.id, type: 'curvedLine' },
    });
    this.shape.on('moving', (options) => {
      const deltaX = (options.e as any)?.movementX || 0;
      const deltaY = (options.e as any)?.movementY || 0;
      this.startX += deltaX;
      this.startY += deltaY;
      this.controlX += deltaX;
      this.controlY += deltaY;
      this.endX += deltaX;
      this.endY += deltaY;
      this.updatePath();
    });
    this.canvas.add(this.shape);
    this.shape.setCoords();
    if (this.controlPoint) {
      this.updateMidControlPoint();
      this.canvas.add(this.controlPoint);
      this.controlPoint.bringToFront();
    }
  }

  private getPointOnCurve(t: number): { x: number; y: number } {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const x = mt2 * this.startX + 2 * mt * t * this.controlX + t2 * this.endX;
    const y = mt2 * this.startY + 2 * mt * t * this.controlY + t2 * this.endY;
    return { x, y };
  }

  private updateBezierControlFromMidpoint(midX: number, midY: number): void {
    this.controlX = (midX - 0.25 * this.startX - 0.25 * this.endX) / 0.5;
    this.controlY = (midY - 0.25 * this.startY - 0.25 * this.endY) / 0.5;
  }

  private updateMidControlPoint(): void {
    if (this.controlPoint) {
      const midPoint = this.getPointOnCurve(0.5);
      this.controlPoint.set({ left: midPoint.x, top: midPoint.y });
      this.controlPoint.setCoords();
      this.canvas.requestRenderAll();
    }
  }
}