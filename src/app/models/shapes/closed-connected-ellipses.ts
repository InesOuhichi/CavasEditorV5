import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class ClosedConnectedEllipses extends BaseShape {
    
    private ellipses: fabric.Ellipse[] = [];
    private lines: fabric.Line[] = [];
    private rx: number = 30;
    private ry: number = 20;
    private strokeColor: string = 'black';
    private fillColor: string = 'rgba(23, 195, 66, 0.3)';
    private isDrawing: boolean = true;
    private strokeWidth: number = 2; 



    constructor(canvas: fabric.Canvas, x: number, y: number) {
        super(canvas,x,y);
        this.addEllipse(x, y);
      }

    override createShape(x: number | any[], y: number): void {
    throw new Error('Method not implemented.');

    }

    updateShape(x: number, y: number): void {
    if (this.isDrawing) {
        this.addEllipse(x, y);
    }
    }

    private addEllipse(x: number, y: number): void {
        console.log('Calling add ellipse method at:', x, y);
        const ellipse = new fabric.Ellipse({
          left: x,
          top: y,
          rx: this.rx,
          ry:this.ry,
          fill: this.fillColor,
          stroke: this.strokeColor,
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          hasControls: false,
          hasBorders: false,
        });
        this.ellipses.push(ellipse);
        this.canvas.add(ellipse);
    
        if (this.ellipses.length > 1) {
          console.log('Connecting ellipse', this.ellipses.length - 1, 'to', this.ellipses.length - 2);
          const prevEllipse = this.ellipses[this.ellipses.length - 2];
          this.addConnectingLine(prevEllipse, ellipse);
        }
    
        this.canvas.requestRenderAll();
      }


      private addConnectingLine(startEllipse: fabric.Ellipse, endEllipse: fabric.Ellipse): void {
        console.log('Adding connecting line');

        const startX = startEllipse.left!;
        const startY = startEllipse.top!;
        const endX = endEllipse.left!;
        const endY = endEllipse.top!;

        console.log('Ellipse positions:', { startX, startY, endX, endY });

        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        console.log('Distance:', distance, 'dx:', dx, 'dy:', dy);
        if (distance === 0) {
            console.log('Distance is 0, skipping line creation');
            return;
        }

        const unitX = dx / distance;
        const unitY = dy / distance;

        const startEdgeX = startX + unitX * this.rx;
        const startEdgeY = startY + unitY * this.ry;

        const endEdgeX = endX - unitX * this.rx;
        const endEdgeY = endY - unitY * this.ry;

        console.log('Line coordinates:', { startEdgeX, startEdgeY, endEdgeX, endEdgeY });

        const line = new fabric.Line([startEdgeX, startEdgeY, endEdgeX, endEdgeY], {
            stroke: this.strokeColor || 'black',
            strokeWidth: 2,
            selectable: false,
            hasControls: false,
            hasBorders: false,
        });

        console.log('Line properties:', {
            stroke: line.stroke,
            strokeWidth: line.strokeWidth,
            x1: line.x1,
            y1: line.y1,
            x2: line.x2,
            y2: line.y2,
        });

        this.lines.push(line);
        this.canvas.add(line);
        this.canvas.requestRenderAll();
      }

      private updateLines(): void {
        this.lines.forEach((line, index) => {
          // For the closing line (last line), connect the last and first ellipss
          const isClosingLine = index === this.lines.length - 1 && this.ellipses.length > 2;
          const startEllipse = isClosingLine ? this.ellipses[this.ellipses.length - 1] : this.ellipses[index];
          const endEllipse = isClosingLine ? this.ellipses[0] : this.ellipses[index + 1];
    
          if (startEllipse && endEllipse) {
            const startX = startEllipse.left!;
            const startY = startEllipse.top!;
            const endX = endEllipse.left!;
            const endY = endEllipse.top!;
    
            const dx = endX - startX;
            const dy = endY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance === 0) {
              line.set({ x1: startX, y1: startY, x2: endX, y2: endY });
            } else {
              const unitX = dx / distance;
              const unitY = dy / distance;
              const startPointX = startX + unitX * this.rx;
              const startPointY = startY + unitY * this.ry;
              const endPointX = endX - unitX * this.rx;
              const endPointY = endY - unitY * this.ry;
    
              line.set({ x1: startPointX, y1: startPointY, x2: endPointX, y2: endPointY });
            }
            line.setCoords();
          }
        });
        this.canvas.requestRenderAll();
      }


      finishDrawing(): void {
        if (!this.isDrawing) return;
        console.log('Finishing ClosedConnectedellipses with', this.ellipses.length, 'ellipses and', this.lines.length, 'lines');
        this.isDrawing = false;
    
        if (this.shape) {
          this.canvas.remove(this.shape);
        }
        if (this.ellipses.length > 0) {
            const lastEllipse = this.ellipses.pop(); // Remove the last ellipse
            if (lastEllipse) {
              this.canvas.remove(lastEllipse); // Remove it from the canvas
            }
           
          }
    
        // Connect the first and last ellipses if there are at least 2 ellipses
        if (this.ellipses.length >= 2) {
          const firstEllipse = this.ellipses[0];
          const lastEllipse = this.ellipses[this.ellipses.length - 1];
          this.addConnectingLine(lastEllipse, firstEllipse);
        }
    
        const objects = [...this.ellipses, ...this.lines];
        if (objects.length === 0) return;
    
        let minLeft = Infinity;
        let minTop = Infinity;
    
        this.ellipses.forEach(ellipse => {
          const left = ellipse.left! - this.rx;
          const top = ellipse.top! - this.ry;
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
          if (obj instanceof fabric.Ellipse) {
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
    
        this.ellipses.forEach(ellipse => this.canvas.remove(ellipse));
        this.lines.forEach(line => this.canvas.remove(line));
        this.ellipses = []; // Clear arrays to prevent reuse
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
          this.ellipses.forEach(ellipse => ellipse.setCoords());
          this.lines.forEach(line => line.setCoords());
        }
      }


      setRx(rx: number): void {
        this.rx = rx;
        if (this.shape) {
          this.ellipses.forEach(ellipse => ellipse.set('rx', rx));
          this.updateLines();
          this.shape.setCoords();
        } else {
          this.ellipses.forEach(ellipse => ellipse.set('rx', rx));
        }
        this.canvas.renderAll();
      }
    
      setRy(ry: number): void {
        this.ry = ry;
        if (this.shape) {
          this.ellipses.forEach(ellipse => ellipse.set('ry', ry));
          this.updateLines();
          this.shape.setCoords();
        } else {
          this.ellipses.forEach(ellipse => ellipse.set('ry', ry));
        }
        this.canvas.renderAll();
      }
    
      setFillColor(color: string): void {
        this.fillColor = color;
        if (this.shape) {
          this.ellipses.forEach(ellipse => ellipse.set('fill', color));
          this.shape.setCoords();
        } else {
          this.ellipses.forEach(ellipse => ellipse.set('fill', color));
        }
        this.canvas.renderAll();
      }
    
      setStrokeColor(color: string): void {
        this.strokeColor = color;
        if (this.shape) {
          this.ellipses.forEach(ellipse => ellipse.set('stroke', color));
          this.lines.forEach(line => line.set('stroke', color));
          this.shape.setCoords();
        } else {
          this.ellipses.forEach(ellipse => ellipse.set('stroke', color));
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
          objectLeft: this.shape?.left ?? this.ellipses[0]?.left,
          objectTop: this.shape?.top ?? this.ellipses[0]?.top,
          objectAngle: this.shape?.angle ?? 0,
          rx: this.rx,
          ry: this.ry,
          fillColor: this.fillColor,
          strokeColor: this.strokeColor,
          lineThickness: this.lines.length > 0 ? this.lines[0].strokeWidth : 2,
          ellipsePositions: this.ellipses.map(e => ({ x: e.left, y: e.top })),
        };
      }
    
      override updateFromProperties(properties: any): void {
        if (properties.objectLeft !== undefined && this.shape) this.shape.set('left', properties.objectLeft);
        if (properties.objectTop !== undefined && this.shape) this.shape.set('top', properties.objectTop);
        if (properties.objectAngle !== undefined && this.shape) this.shape.set('angle', properties.objectAngle);
    
        if (properties.rx !== undefined) this.setRx(properties.rx);
        if (properties.ry !== undefined) this.setRy(properties.ry);
        if (properties.fillColor !== undefined) this.setFillColor(properties.fillColor);
        if (properties.strokeColor !== undefined) this.setStrokeColor(properties.strokeColor);
        if (properties.lineThickness !== undefined) this.setLineThickness(properties.lineThickness);
    
        if (this.shape) this.shape.setCoords();
        this.canvas.requestRenderAll();
      }
    
}




