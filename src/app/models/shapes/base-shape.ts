import { fabric } from 'fabric';

export abstract class BaseShape {
  protected shape!: fabric.Object;
  public id: string;
 

  constructor(protected canvas: fabric.Canvas, x: number, y: number) {
    this.id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Removed: this.shape = null as any; and this.shape.data assignment
    // Subclass will initialize this.shape in createShape
    
  }

  abstract createShape(x: number | any[], y: number): void;
  abstract updateShape(x: number, y: number): void;
  abstract updateFromProperties(properties: any): void;

  getShape(): fabric.Object {
    return this.shape;
  }

  addToCanvas(): void {
    if (!this.shape) {
      throw new Error('Shape not initialized. Call createShape first.');
    }
    this.shape.data = { ...this.shape.data, modelId: this.id }; // Set data here
    this.canvas.add(this.shape);
  }

  setCoords(): void {
    this.shape.setCoords();
  }

  getId(): string {
    return this.id;
  }
}