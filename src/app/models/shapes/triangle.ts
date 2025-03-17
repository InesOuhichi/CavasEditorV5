import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class Triangle extends BaseShape {
  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    this.shape = new fabric.Triangle({
      left: x,
      top: y,
      width: 0,
      height: 0,
      fill: 'rgba(200,0,0,0.5)',
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      data: { modelId: this.id, type: 'triangle' },
    });
  }

  updateShape(x: number, y: number): void {
    const triangle = this.shape as fabric.Triangle;
    triangle.set({
      width: Math.abs(x - triangle.left!),
      height: Math.abs(y - triangle.top!),
    });
  }

  updateFromProperties(properties: any): void {
    const triangle = this.shape as fabric.Triangle;
    triangle.set({
      left: properties.objectLeft ?? triangle.left,
      top: properties.objectTop ?? triangle.top,
      width: properties.rectWidth !== undefined ? properties.rectWidth / triangle.scaleX! : triangle.width,
      height: properties.rectHeight !== undefined ? properties.rectHeight / triangle.scaleY! : triangle.height,
      scaleX: properties.objectScaleX ?? triangle.scaleX,
      scaleY: properties.objectScaleY ?? triangle.scaleY,
      angle: properties.objectAngle ?? triangle.angle,
      fill: properties.fillColor ?? triangle.fill,
      stroke: properties.strokeColor ?? triangle.stroke,
    });
    triangle.setCoords();
    this.canvas.requestRenderAll();
  }
}