import { fabric } from 'fabric';
import { BaseShape } from './base-shape';


export class Polygon extends BaseShape {
  private points: fabric.Point[] = [];
  private isClosed: boolean = false;
  private hatchColor: string = '#000000';
  private hatchThickness: number = 1;

  private vertexPoints: fabric.Circle[] = [];
  private edgeMidPoints: fabric.Circle[] = [];
  private controlsVisible: boolean = false;


  constructor(canvas: fabric.Canvas, x: number, y: number) {
    super(canvas,x,y);
    this.points.push(new fabric.Point(x, y));
    this.createShape();
    this.shape.set({ data: { modelId: this.id } });
  }

  // Override abstract methods from BaseShape
  override addToCanvas(): void {
    this.canvas.add(this.shape);
    this.shape.set({ selectable: false, evented: false }); 
    this.canvas.requestRenderAll();
  }

  getProperties(): any {
    return {
      left: this.shape.left,
      top: this.shape.top,
      angle: this.shape.angle,
      fillColor: this.shape.fill instanceof fabric.Pattern ? this.hatchColor : this.shape.fill,
      strokeColor: this.shape.stroke,
      strokeWidth: this.shape.strokeWidth,
      hatchColor: this.hatchColor,
      hatchThickness: this.hatchThickness,
      points: this.points.map(p => ({ x: p.x, y: p.y })),
    };
  }

  updateFromProperties(properties: any): void {
    if (!this.shape) return;

    this.shape.set({
      left: properties.objectLeft || this.shape.left,
      top: properties.objectTop || this.shape.top,
      angle: properties.objectAngle || this.shape.angle,
      stroke: properties.strokeColor || this.shape.stroke,
      strokeWidth: properties.strokeWidth || this.shape.strokeWidth,
    });

    if (properties.hatchColor || properties.hatchThickness) {
      this.hatchColor = properties.hatchColor || this.hatchColor;
      this.hatchThickness = properties.hatchThickness || this.hatchThickness;
      this.applyHatchPattern();
    }

    if (properties.points && Array.isArray(properties.points)) {
      this.points = properties.points.map((p: { x: number; y: number }) => new fabric.Point(p.x, p.y));
      if (this.isClosed) {
        this.shape = new fabric.Polygon(this.points, this.shape.toObject());
      } else {
        this.shape = new fabric.Polyline(this.points, this.shape.toObject());
      }
      this.shape.set({ data: { modelId: this.id } });
    }

    this.shape.setCoords();
    this.canvas.requestRenderAll();
  }

  // Shape creation and updates
   createShape(): void {
    this.shape = new fabric.Polyline(this.points, {
      fill: '',
      stroke: 'black',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      objectCaching: false,
    });
    this.applyHatchPattern();
  }

  updateShape(x: number, y: number): void {
    if (this.isClosed) return;

    const polyline = this.shape as fabric.Polyline;
    this.points[this.points.length - 1] = new fabric.Point(x, y);
    polyline.set({ points: [...this.points] });
    polyline.setCoords();
    this.applyHatchPattern();
    this.canvas.requestRenderAll();
  }

  addPoint(x: number, y: number): void {
    if (this.isClosed) return;
    this.points.push(new fabric.Point(x, y));
    const polyline = this.shape as fabric.Polyline;
    polyline.set({ points: [...this.points] });
    polyline.setCoords();
    this.canvas.requestRenderAll();
  }

  closePolygon(): void {
    if (this.isClosed || this.points.length < 3) return;

    this.isClosed = true; // Ensure this is set
    console.log('Closing polygon, isClosed:', this.isClosed); // Debug log
    const polygon = new fabric.Polygon(this.points, {
      fill: '',
      stroke: 'black',
      strokeWidth: 1,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      data: { modelId: this.id },
    });

    this.canvas.remove(this.shape);
    this.shape = polygon;
    this.shape.set({ data: { modelId: this.id } });
    console.log('Polygon modelId after closing:', this.shape.data?.modelId); 

    this.canvas.add(this.shape);
    this.canvas.setActiveObject(this.shape);
    this.applyHatchPattern();
    this.canvas.requestRenderAll(); 

    this.shape.on('mousedblclick', () => this.toggleControlPoints());
   
    this.canvas.requestRenderAll();


  }

  // Hatch pattern methods
  private applyHatchPattern(): void {
    const patternCanvas = document.createElement('canvas');
    const ctx = patternCanvas.getContext('2d')!;
    patternCanvas.width = 20;
    patternCanvas.height = 20;

    ctx.strokeStyle = this.hatchColor;
    ctx.lineWidth = this.hatchThickness;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 20);
    ctx.stroke();

    const pattern = new fabric.Pattern({
      source: patternCanvas as any,
      repeat: 'repeat',
    });
    this.shape.set('fill', pattern);
    this.shape.set({ selectable: true, evented: true }); // Reinforce selectability
    this.shape.setCoords();
    this.canvas.requestRenderAll();
  }

  setHatchColor(color: string): void {
    this.hatchColor = color;
    this.applyHatchPattern();
  }

  setHatchThickness(thickness: number): void {
    this.hatchThickness = thickness;
    this.applyHatchPattern();
  }

  // Control point methods
  private toggleControlPoints(): void {
    if (!this.isClosed) return;
    this.controlsVisible ? this.hideControlPoints() : this.showControlPoints();
    this.controlsVisible = !this.controlsVisible;
  }

  private showControlPoints(): void {
    const polygon = this.shape as fabric.Polygon;
    if (!polygon.points) return;

    this.hideControlPoints();

    this.points.forEach((point, index) => {
      const vertex = new fabric.Circle({
        left: point.x,
        top: point.y,
        radius: 5,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasBorders: false,
        hasControls: false,
        lockScalingX: true,
        lockScalingY: true,
        data: { index },
      });
      vertex.on('moving', () => this.updateVertex(index, vertex.left!, vertex.top!));
      this.canvas.add(vertex);
      this.vertexPoints.push(vertex);
    });

    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % this.points.length];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const midPoint = new fabric.Circle({
        left: midX,
        top: midY,
        radius: 5,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasBorders: false,
        hasControls: false,
        lockScalingX: true,
        lockScalingY: true,
        data: { edgeIndex: i },
      });
      midPoint.on('moving', () => this.updateEdgeMidpoint(i, midPoint.left!, midPoint.top!));
      this.canvas.add(midPoint);
      this.edgeMidPoints.push(midPoint);
    }

    this.vertexPoints.forEach(point => point.bringToFront());
    this.edgeMidPoints.forEach(point => point.bringToFront());
    this.canvas.requestRenderAll();
  }

  private hideControlPoints(): void {
    this.vertexPoints.forEach(point => this.canvas.remove(point));
    this.edgeMidPoints.forEach(point => this.canvas.remove(point));
    this.vertexPoints = [];
    this.edgeMidPoints = [];
    this.canvas.requestRenderAll();
  }

  private updateVertex(index: number, x: number, y: number): void {
    const polygon = this.shape as fabric.Polygon;
    if (!polygon.points) return;

    this.points[index].x = x;
    this.points[index].y = y;
    polygon.set({ points: [...this.points] });
    polygon.setCoords();

    this.vertexPoints[index].set({ left: x, top: y });
    this.vertexPoints[index].setCoords();

    this.updateAdjacentMidpoints(index);
    this.applyHatchPattern();
    this.canvas.requestRenderAll();
  }

  private updateEdgeMidpoint(edgeIndex: number, x: number, y: number): void {
    const polygon = this.shape as fabric.Polygon;
    if (!polygon.points) return;

    this.points.splice(edgeIndex + 1, 0, new fabric.Point(x, y));
    polygon.set({ points: [...this.points] });
    polygon.setCoords();

    this.hideControlPoints();
    this.showControlPoints();
    this.applyHatchPattern();
    this.canvas.requestRenderAll();
  }

  private updateAdjacentMidpoints(vertexIndex: number): void {
    const prevIndex = (vertexIndex - 1 + this.points.length) % this.points.length;
    const nextIndex = (vertexIndex + 1) % this.points.length;

    const prevMidX = (this.points[prevIndex].x + this.points[vertexIndex].x) / 2;
    const prevMidY = (this.points[prevIndex].y + this.points[vertexIndex].y) / 2;
    const prevMidPoint = this.edgeMidPoints[prevIndex];
    if (prevMidPoint) {
      prevMidPoint.set({ left: prevMidX, top: prevMidY });
      prevMidPoint.setCoords();
    }

    const nextMidX = (this.points[vertexIndex].x + this.points[nextIndex].x) / 2;
    const nextMidY = (this.points[vertexIndex].y + this.points[nextIndex].y) / 2;
    const nextMidPoint = this.edgeMidPoints[vertexIndex];
    if (nextMidPoint) {
      nextMidPoint.set({ left: nextMidX, top: nextMidY });
      nextMidPoint.setCoords();
    }
  }
}







