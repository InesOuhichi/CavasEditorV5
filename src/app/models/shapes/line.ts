import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class Line extends BaseShape {
  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    this.shape = new fabric.Line([x, y, x, y], {
      stroke: 'rgba(0,0,0,0.5)',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      left: x,
      top: y,
      data: { modelId: this.id, type: 'line' },
    });
  }

  updateShape(x: number, y: number): void {
    const line = this.shape as fabric.Line;
    line.set({ x2: x, y2: y });
  }

  updateFromProperties(properties: any): void {
    const line = this.shape as fabric.Line;
    line.set({
      x1: properties.lineX1 !== undefined ? properties.lineX1 / line.scaleX! : line.x1,
      y1: properties.lineY1 !== undefined ? properties.lineY1 / line.scaleY! : line.y1,
      x2: properties.lineX2 !== undefined ? properties.lineX2 / line.scaleX! : line.x2,
      y2: properties.lineY2 !== undefined ? properties.lineY2 / line.scaleY! : line.y2,
      left: properties.objectLeft ?? line.left,
      top: properties.objectTop ?? line.top,
      scaleX: properties.objectScaleX ?? line.scaleX,
      scaleY: properties.objectScaleY ?? line.scaleY,
      angle: properties.objectAngle ?? line.angle,
      stroke: properties.strokeColor ?? line.stroke,
      strokeWidth: properties.strokeWidth || this.shape.strokeWidth,
    });
    line.setCoords();
    this.canvas.requestRenderAll();
  }
}