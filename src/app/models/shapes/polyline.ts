import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class Polyline extends BaseShape {
 
  override updateFromProperties(properties: any): void {
    throw new Error('Method not implemented.');
  }
  private points: fabric.Point[] = [];
  private isFinished = false;

  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.points.push(new fabric.Point(x, y));
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    this.shape = new fabric.Polyline(this.points, {
      stroke: 'black',
      strokeWidth: 1,
      fill: '',
      originX: 'left',
      originY: 'top',
      selectable: false,
    });
  }

  updateShape(x: number, y: number): void {
    const polyline = this.shape as fabric.Polyline;
    if (this.points.length > 0) {
      this.points[this.points.length - 1] = new fabric.Point(x, y); // Update last point
      polyline.set({ points: [...this.points] });
      this.canvas.renderAll();
    }
  }

  addPoint(x: number, y: number): void {
    this.points.push(new fabric.Point(x, y));
    const polyline = this.shape as fabric.Polyline;
    polyline.set({ points: [...this.points] });
    this.canvas.renderAll();
  }

  finalizePolyline(): void {
    const polyline = this.shape as fabric.Polyline;
    polyline.set({
      selectable: true,
      evented: true,
    });
    this.canvas.renderAll();
  }

  override getShape(): fabric.Object {
    return this.shape as fabric.Polyline;
  }
}