// src/app/models/shapes/connected-circles.ts
import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class ConnectedCircles extends BaseShape {

  override updateFromProperties(properties: any): void {
      throw new Error('Method not implemented.');
  }
  private circles: fabric.Circle[] = [];
  private lines: fabric.Line[] = [];
  private radius: number = 20;
  private strokeColor: string = 'black';
  private fillColor: string = 'rgba(195, 23, 23, 0.3)';
  private isDrawing: boolean = true; 

  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas, x, y);
    console.log('Initial click coordinates:', x, y);
    this.addCircle(x, y);
  }

  createShape(x: number, y: number): void {
    if (this.isDrawing) {
      this.addCircle(x, y);
    }
  }

  updateShape(x: number, y: number): void {
    if (this.isDrawing) {
      this.addCircle(x, y);
    }
  }

  private addCircle(x: number, y: number): void {
    console.log('Adding circle at:', x, y);
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: this.radius,
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      selectable: false, 
      hasControls: false,
      hasBorders: false,
    });

    this.circles.push(circle);
    this.canvas.add(circle); 

    // Connect the new circle to the previous one with a line
    if (this.circles.length > 1) {
      const prevCircle = this.circles[this.circles.length - 2];
      this.addConnectingLine(prevCircle, circle);
    }

    this.canvas.renderAll();
  }

  private addConnectingLine(startCircle: fabric.Circle, endCircle: fabric.Circle): void {
   // Get the centers of the circles
   const startX = startCircle.left!;
   const startY = startCircle.top!;
   const endX = endCircle.left!;
   const endY = endCircle.top!;

   const dx = endX - startX;
   const dy = endY - startY;
   const distance = Math.sqrt(dx * dx + dy * dy); // Distance between centers

   if (distance === 0) {
     return; // Skip line creation if circles overlap completely
   }

   // Normalize the direction vector
   const unitX = dx / distance;
   const unitY = dy / distance;

   // Calculate the perimeter points (extend by radius from each center)
   const startPointX = startX + unitX * this.radius;
   const startPointY = startY + unitY * this.radius;
   const endPointX = endX - unitX * this.radius; 
   const endPointY = endY - unitY * this.radius;

   const line = new fabric.Line(
     [startPointX, startPointY, endPointX, endPointY],
      {
        stroke: this.strokeColor,
        strokeWidth: 2,
        selectable: false, 
        hasControls: false,
        hasBorders: false,
      }
    );

    this.lines.push(line);
    this.canvas.add(line); 
    this.canvas.renderAll();
  }

  private updateLines(): void {
    this.lines.forEach((line, index) => {
      const startCircle = this.circles[index];
      const endCircle = this.circles[index + 1];
      if (startCircle && endCircle) {
        const startX = startCircle.left!;
        const startY = startCircle.top!;
        const endX = endCircle.left!;
        const endY = endCircle.top!;

        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
          line.set({ x1: startX, y1: startY, x2: endX, y2: endY });
        } else {
          const unitX = dx / distance;
          const unitY = dy / distance;
          const startPointX = startX + unitX * this.radius;
          const startPointY = startY + unitY * this.radius;
          const endPointX = endX - unitX * this.radius;
          const endPointY = endY - unitY * this.radius;

          line.set({
            x1: startPointX,
            y1: startPointY,
            x2: endPointX,
            y2: endPointY,
          });
        }
        line.setCoords();
      }
    });
    this.canvas.renderAll();
  }

  // Call this method when drawing is finished (e.g., on double-click)
   finishDrawing(): void {
    this.isDrawing = false; 

    if (this.shape) {
      this.canvas.remove(this.shape);
    }

    const objects = [...this.circles, ...this.lines];
    if (objects.length === 0) return;

    // Calculate the bounding box manually
    let minLeft = Infinity;
    let minTop = Infinity;

    this.circles.forEach(circle => {
      const left = circle.left! - this.radius;
      const top = circle.top! - this.radius;
      minLeft = Math.min(minLeft, left);
      minTop = Math.min(minTop, top);
    });

    this.lines.forEach(line => {
      minLeft = Math.min(minLeft, line.x1!, line.x2!);
      minTop = Math.min(minTop, line.y1!, line.y2!);
    });

    if (this.circles.length === 0) {
      minLeft = 0;
      minTop = 0;
    }

    // Adjust object positions relative to the bounding box
    const offsetX = minLeft;
    const offsetY = minTop;

    objects.forEach(obj => {
      if (obj instanceof fabric.Circle) {
        obj.set({
          left: obj.left! - offsetX,
          top: obj.top! - offsetY,
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });
      } else if (obj instanceof fabric.Line) {
        obj.set({
          x1: obj.x1! - offsetX,
          y1: obj.y1! - offsetY,
          x2: obj.x2! - offsetX,
          y2: obj.y2! - offsetY,
          selectable: true, 
          hasControls: true,
          hasBorders: true,
        });
      }
    });

    // Create the group
    this.shape = new fabric.Group(objects, {
      selectable: true,
      hasControls: true,
      hasBorders: true,
      left: minLeft,
      top: minTop,
      originX: 'left',
      originY: 'top',
    });

    // Remove individual objects from the canvas
    this.circles.forEach(circle => this.canvas.remove(circle));
    this.lines.forEach(line => this.canvas.remove(line));

    // Add the group to the canvas
    this.canvas.add(this.shape);
    this.canvas.setActiveObject(this.shape);
    this.updateLines();
    this.canvas.renderAll();
  }

  override addToCanvas(): void {
  }

  override setCoords(): void {
    if (this.shape) {
      this.shape.setCoords();
      this.updateLines();
    } else {
      this.circles.forEach(circle => circle.setCoords());
      this.lines.forEach(line => line.setCoords());
    }
  }

  setRadius(radius: number): void {
    this.radius = radius;
    this.circles.forEach(circle => circle.set('radius', radius));
    if (this.shape) {
      this.finishDrawing();
    }
    this.canvas.renderAll();
  }

  setFillColor(color: string): void {
    this.fillColor = color;
    this.circles.forEach(circle => circle.set('fill', color));
    if (this.shape) {
      this.finishDrawing();
    }
    this.canvas.renderAll();
  }

  setStrokeColor(color: string): void {
    this.strokeColor = color;
    this.circles.forEach(circle => circle.set('stroke', color));
    this.lines.forEach(line => line.set('stroke', color));
    if (this.shape) {
      this.finishDrawing();
    }
    this.canvas.renderAll();
  }
}