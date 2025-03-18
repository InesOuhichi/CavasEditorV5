// src/app/models/shapes/closed-connected-circles.ts
import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class ClosedConnectedCircles extends BaseShape {
 
  private circles: fabric.Circle[] = [];
  private lines: fabric.Line[] = [];
  private radius: number = 20;
  private strokeColor: string = 'black';
  private fillColor: string = 'rgba(161, 23, 195, 0.3)';
  private strokeWidth: number = 2; 

  private isDrawing: boolean = true;

  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas,x,y);
    this.addCircle(x, y);
  }


  override createShape(x: number | any[], y: number): void {
    throw new Error('Method not implemented.');

    }
  updateShape(x: number, y: number): void {
    if (this.isDrawing) {
      this.addCircle(x, y);
    }
  }

  private addCircle(x: number, y: number): void {
    console.log('Calling add circle method at:', x, y);
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: this.radius,
      fill: this.fillColor,
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });
    this.circles.push(circle);
    this.canvas.add(circle);

    if (this.circles.length > 1) {
      console.log('Connecting circle', this.circles.length - 1, 'to', this.circles.length - 2);
      const prevCircle = this.circles[this.circles.length - 2];
      this.addConnectingLine(prevCircle, circle);
    }

    this.canvas.requestRenderAll();
  }

  private addConnectingLine(startCircle: fabric.Circle, endCircle: fabric.Circle): void {
    console.log('Adding connecting line');
    const startX = startCircle.left!;
    const startY = startCircle.top!;
    const endX = endCircle.left!;
    const endY = endCircle.top!;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const unitX = dx / distance;
    const unitY = dy / distance;
    const startPointX = startX + unitX * this.radius;
    const startPointY = startY + unitY * this.radius;
    const endPointX = endX - unitX * this.radius;
    const endPointY = endY - unitY * this.radius;

    const line = new fabric.Line([startPointX, startPointY, endPointX, endPointY], {
      stroke: this.strokeColor,
      strokeWidth: 2,
      selectable: false,
      hasControls: false,
      hasBorders: false,
    });

    this.lines.push(line);
    this.canvas.add(line);
  }

  private updateLines(): void {
    this.lines.forEach((line, index) => {
      // For the closing line (last line), connect the last and first circles
      const isClosingLine = index === this.lines.length - 1 && this.circles.length > 2;
      const startCircle = isClosingLine ? this.circles[this.circles.length - 1] : this.circles[index];
      const endCircle = isClosingLine ? this.circles[0] : this.circles[index + 1];

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

          line.set({ x1: startPointX, y1: startPointY, x2: endPointX, y2: endPointY });
        }
        line.setCoords();
      }
    });
    this.canvas.requestRenderAll();
  }

  finishDrawing(): void {
    if (!this.isDrawing) return;
    console.log('Finishing ClosedConnectedCircles with', this.circles.length, 'circles and', this.lines.length, 'lines');
    this.isDrawing = false;

    if (this.shape) {
      this.canvas.remove(this.shape);
    }
    if (this.circles.length > 0) {
        const lastCircle = this.circles.pop(); // Remove the last circle
        if (lastCircle) {
          this.canvas.remove(lastCircle); // Remove it from the canvas
        }
       
      }

    // Connect the first and last circles if there are at least 2 circles
    if (this.circles.length >= 2) {
      const firstCircle = this.circles[0];
      const lastCircle = this.circles[this.circles.length - 1];
      this.addConnectingLine(lastCircle, firstCircle);
    }

    const objects = [...this.circles, ...this.lines];
    if (objects.length === 0) return;

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

    this.shape = new fabric.Group(objects, {
      selectable: true,
      hasControls: true,
      hasBorders: true,
      left: minLeft,
      top: minTop,
      originX: 'left',
      originY: 'top',
      data: { modelId: this.id },
    });

    this.circles.forEach(circle => this.canvas.remove(circle));
    this.lines.forEach(line => this.canvas.remove(line));
    this.circles = []; // Clear arrays to prevent reuse
    this.lines = [];


    this.canvas.add(this.shape);
    this.canvas.setActiveObject(this.shape);
    this.canvas.renderAll();
  }

  override addToCanvas(): void {
    if (!this.isDrawing && this.shape) {
      this.canvas.add(this.shape);
    }
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
    if (this.shape) {
      this.circles.forEach(circle => circle.set('radius', radius));
      this.updateLines();
      this.shape.setCoords();
    } else {
      this.circles.forEach(circle => circle.set('radius', radius));
    }
    this.canvas.renderAll();
  }

  setFillColor(color: string): void {
    this.fillColor = color;
    if (this.shape) {
      this.circles.forEach(circle => circle.set('fill', color));
      this.shape.setCoords();
    } else {
      this.circles.forEach(circle => circle.set('fill', color));
    }
    this.canvas.renderAll();
  }

  setStrokeColor(color: string): void {
    this.strokeColor = color;
    if (this.shape) {
      this.circles.forEach(circle => circle.set('stroke', color));
      this.lines.forEach(line => line.set('stroke', color));
      this.shape.setCoords();
    } else {
      this.circles.forEach(circle => circle.set('stroke', color));
      this.lines.forEach(line => line.set('stroke', color));
    }
    this.canvas.renderAll();
  }

  setLineThickness(thickness: number): void {
    if (this.shape) {
      this.lines.forEach(line => line.set('strokeWidth', thickness));
      this.shape.setCoords();
    } else {
      this.lines.forEach(line => line.set('strokeWidth', thickness));
    }
    this.canvas.renderAll();
  }

  getProperties(): any {
    return {
      objectLeft: this.shape?.left ?? this.circles[0]?.left,
      objectTop: this.shape?.top ?? this.circles[0]?.top,
      objectAngle: this.shape?.angle ?? 0,
      radius: this.radius,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      lineThickness: this.lines.length > 0 ? this.lines[0].strokeWidth : 2,
      circlePositions: this.circles.map(c => ({ x: c.left, y: c.top })),
    };
  }

  override updateFromProperties(properties: any): void {
    if (properties.objectLeft !== undefined && this.shape) this.shape.set('left', properties.objectLeft);
    if (properties.objectTop !== undefined && this.shape) this.shape.set('top', properties.objectTop);
    if (properties.objectAngle !== undefined && this.shape) this.shape.set('angle', properties.objectAngle);

    if (properties.radius !== undefined) this.setRadius(properties.radius);
    if (properties.fillColor !== undefined) this.setFillColor(properties.fillColor);
    if (properties.strokeColor !== undefined) this.setStrokeColor(properties.strokeColor);
    if (properties.lineThickness !== undefined) this.setLineThickness(properties.lineThickness);

    if (this.shape) this.shape.setCoords();
    this.canvas.requestRenderAll();
  }
}