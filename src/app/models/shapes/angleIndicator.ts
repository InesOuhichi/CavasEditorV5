import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class AngleIndicator extends BaseShape {

  override updateFromProperties(properties: any): void {
    throw new Error('Method not implemented.');
  }
  private startX: number; 
  private startY: number; 
  private end1X: number = 0;
  private end1Y: number = 0; 
  private end2X: number = 0; 
  private end2Y: number = 0; 
  private line1!: fabric.Line; 
  private line2!: fabric.Line; 
  private arc!: fabric.Circle; 
  private angleText!: fabric.Text;
  private endPointControl1!: fabric.Circle; 
  private endPointControl2!: fabric.Circle; 
  private angle: number = 0; 

  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    this.startX = x; 
    this.startY = y;
    this.createShape(x, y);
  }

  // Initializes the angle indicator components
  createShape(x: number, y: number): void {
    this.shape = new fabric.Group([], {
      left: this.startX,
      top: this.startY,
      originX: 'left',
      originY: 'top',
      selectable: true,
      evented: true,
      objectCaching: false,
      subTargetCheck: true, 
      data: { type: 'angleIndicator' },
    });

    this.line1 = new fabric.Line([this.startX, this.startY, this.end1X, this.end1Y], {
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    this.line2 = new fabric.Line([this.startX, this.startY, this.end2X, this.end2Y], {
      stroke: 'black',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });

    this.arc = new fabric.Circle({
      left: this.startX,
      top: this.startY,
      radius: 30, 
      startAngle: 0,
      endAngle: 0,
      stroke: 'blue',
      strokeWidth: 2,
      fill: '',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    this.angleText = new fabric.Text('0°', {
      left: this.startX,
      top: this.startY,
      fontSize: 16,
      fill: 'black',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });

    this.endPointControl1 = new fabric.Circle({
      left: this.end1X,
      top: this.end1Y,
      radius: 2,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasBorders: false,
      hasControls: false,
      objectCaching: false,
    });

    this.endPointControl2 = new fabric.Circle({
      left: this.end2X,
      top: this.end2Y,
      radius: 2,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasBorders: false,
      hasControls: false,
      objectCaching: false,
    });

    // Add components to the group
    const group = this.shape as fabric.Group;
    group.addWithUpdate(this.line1);
    group.addWithUpdate(this.line2);
    //group.addWithUpdate(this.arc);
    group.addWithUpdate(this.angleText);
    group.addWithUpdate(this.endPointControl1);
    group.addWithUpdate(this.endPointControl2);

    this.endPointControl1.on('moving', () => {
      if (this.endPointControl1) {
        this.end1X = this.endPointControl1.left!;
        this.end1Y = this.endPointControl1.top!;
        this.updateAngle();
        this.canvas.requestRenderAll();
      }
    });

    this.endPointControl2.on('moving', () => {
      if (this.endPointControl2) {
        this.end2X = this.endPointControl2.left!;
        this.end2Y = this.endPointControl2.top!;
        this.updateAngle();
        this.canvas.requestRenderAll();
      }
    });

    this.shape.on('moving', (options) => {
      const deltaX = (options.e as any)?.movementX || 0;
      const deltaY = (options.e as any)?.movementY || 0;
      this.startX += deltaX;
      this.startY += deltaY;
      this.end1X += deltaX;
      this.end1Y += deltaY;
      this.end2X += deltaX;
      this.end2Y += deltaY;
      this.updateAngle();
      this.canvas.requestRenderAll();
    });
  }

  updateShape(x: number, y: number): void {
    this.end1X = x;
    this.end1Y = y;

    // Set initial control point position 
    const dx = this.end1X - this.startX;
    const dy = this.end1Y - this.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      this.end2X = this.startX - dy * 0.5;
      this.end2Y = this.startY + dx * 0.5;
    }

    this.updateAngle();
    this.canvas.requestRenderAll();
  }

  override addToCanvas(): void {
    super.addToCanvas();
    this.canvas.add(this.endPointControl1);
    this.canvas.add(this.endPointControl2);
    this.endPointControl1.bringToFront();
    this.endPointControl2.bringToFront();
  }

  private updateAngle(): void {
    // Update line coordinates
    this.line1.set({ x1: this.startX, y1: this.startY, x2: this.end1X, y2: this.end1Y });
    this.line2.set({ x1: this.startX, y1: this.startY, x2: this.end2X, y2: this.end2Y });

    // Calculate vectors
    const vec1 = { x: this.end1X - this.startX, y: this.end1Y - this.startY };
    const vec2 = { x: this.end2X - this.startX, y: this.end2Y - this.startY };

    // Calculate angle in radians
    const dot = vec1.x * vec2.x + vec1.y * vec2.y;
    const det = vec1.x * vec2.y - vec1.y * vec2.x;
    this.angle = Math.atan2(det, dot) * (180 / Math.PI); 

    this.angle = (this.angle < 0 ? this.angle + 360 : this.angle).toFixed(1) as any;

    // Update arc
    const startAngle = Math.atan2(vec1.y, vec1.x);
    const endAngle = Math.atan2(vec2.y, vec2.x);
    const clockwise = det < 0; 
    this.arc.set({
      left: this.startX,
      top: this.startY,
      startAngle: startAngle,
      endAngle: endAngle,
      angle: clockwise ? -this.angle : this.angle, 
    });

    // Update text position (place it along the arc)
    const textOffset = 40; 
    const midAngle = (startAngle + endAngle) / 2;
    this.angleText.set({
      text: `${this.angle}°`,
      left: this.startX + textOffset * Math.cos(midAngle),
      top: this.startY + textOffset * Math.sin(midAngle),
    });

    this.endPointControl1.set({ left: this.end1X, top: this.end1Y });
    this.endPointControl2.set({ left: this.end2X, top: this.end2Y });

    const group = this.shape as fabric.Group;
    group.set({
      left: Math.min(this.startX, this.end1X, this.end2X, this.angleText.left! - textOffset),
      top: Math.min(this.startY, this.end1Y, this.end2Y, this.angleText.top! - textOffset),
      width: Math.max(this.startX, this.end1X, this.end2X, this.angleText.left! + textOffset) - group.left!,
      height: Math.max(this.startY, this.end1Y, this.end2Y, this.angleText.top! + textOffset) - group.top!,
    });

    group.setCoords();
    this.line1.setCoords();
    this.line2.setCoords();
    this.arc.setCoords();
    this.angleText.setCoords();
    this.endPointControl1.setCoords();
    this.endPointControl2.setCoords();
  }

  // Getters and setters for properties (for properties sidebar integration)
  getStartPoint(): { x: number; y: number } {
    return { x: this.startX, y: this.startY };
  }

  getEndPoint1(): { x: number; y: number } {
    return { x: this.end1X, y: this.end1Y };
  }

  getEndPoint2(): { x: number; y: number } {
    return { x: this.end2X, y: this.end2Y };
  }

  setStartPoint(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.updateAngle();
    this.canvas.requestRenderAll();
  }

  setEndPoint1(x: number, y: number): void {
    this.end1X = x;
    this.end1Y = y;
    this.updateAngle();
    this.canvas.requestRenderAll();
  }

  setEndPoint2(x: number, y: number): void {
    this.end2X = x;
    this.end2Y = y;
    this.updateAngle();
    this.canvas.requestRenderAll();
  }

  getAngle(): number {
    return this.angle;
  }
}