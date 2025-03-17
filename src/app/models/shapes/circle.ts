import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class Circle extends BaseShape {
  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    this.shape = new fabric.Circle({
      left: x,
      top: y,
      radius: 0,
      fill: 'rgba(0,200,0,0.5)',
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      data: { modelId: this.id, type: 'circle' },
    });
  }

  updateShape(x: number, y: number): void {
    const circle = this.shape as fabric.Circle;
    const radius = Math.sqrt(Math.pow(x - circle.left!, 2) + Math.pow(y - circle.top!, 2));
    circle.set({ radius });
  }

  updateFromProperties(properties: any): void {
    const circle = this.shape as fabric.Circle;
    circle.set({
      left: properties.objectLeft ?? circle.left,
      top: properties.objectTop ?? circle.top,
      radius: properties.circleRadius !== undefined ? properties.circleRadius:{},
      angle: properties.objectAngle ?? circle.angle,
      fill: properties.fillColor ?? circle.fill,
      stroke: properties.strokeColor ?? circle.stroke,
    });
    circle.setCoords();
    this.canvas.requestRenderAll();
  }
}