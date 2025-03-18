/*This component displays and allows modification of the properties of the currently selected object on the canvas.*/
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CanvasEditorService } from '../canvas-editor.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { fabric } from 'fabric'; 
import { Ellipse } from '../../models/shapes/ellipse';
import { BaseShape } from '../../models/shapes/base-shape';
import { Triangle } from '../../models/shapes/triangle';
import { Rectangle } from '../../models/shapes/rectangle';
import { Polygon } from '../../models/shapes/polygon';
import { Line } from '../../models/shapes/line';
import { Circle } from '../../models/shapes/circle';
import { Text } from '../../models/shapes/text';
import { ConnectedCircles } from '../../models/shapes/connected-circles';
import { ClosedConnectedEllipses } from '../../models/shapes/closed-connected-ellipses';
import { ClosedConnectedCircles } from '../../models/shapes/closed-connected-circles';
@Component({
  selector: 'app-properties-sidebar',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './properties-sidebar.component.html',
  styleUrl: './properties-sidebar.component.css'
})
export class PropertiesSidebarComponent {
  selectedObject: BaseShape | null = null;
  objectLeft: number = 0;
  objectTop: number = 0;
  objectScaleX: number = 1;
  objectScaleY: number = 1;
  objectAngle: number = 0;
  fillColor: string = '#000000';
  strokeColor: string = '#000000';
  strokeWidth: number = 1;
  circleRadius: number = 0;
  ellipseRx: number = 0;
  ellipseRy: number = 0;
  rectWidth: number = 0;
  rectHeight: number = 0;
  lineX1: number = 0;
  lineY1: number = 0;
  lineX2: number = 0;
  lineY2: number = 0;
  text: string = '';
  fontFamily: string = 'Arial';
  fontSize: number = 20;
  fontWeight: string = 'normal';
  textAlign: string = 'left';
  textTransform: string = 'none';

  //Hatch Properties
  hatchColor: string = '#000000';
  hatchThickness: number = 1;
  points: { x: number; y: number }[] = [];

  constructor(private canvasEditorService: CanvasEditorService) {}
   rgbaToHex(rgba: string): string {
    const rgbaMatch = rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d\.]+))?\)$/);
    if (!rgbaMatch) return '#000000';
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    const toHex = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0');
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a === 1 ? hex : `${hex}${toHex(a * 255).slice(0, 2)}`; // Optional alpha in hex
  }

  ngOnInit(): void {
    this.canvasEditorService.selectedObject$.subscribe((obj) => {
      this.selectedObject = obj;
      if (obj) {
        this.updateProperties();
      } else {
        this.clearProperties();
      }
    });
  
  }
 
  isCircle(): boolean {
    return this.selectedObject instanceof Circle;
  }

  isRectangle(): boolean {
    return this.selectedObject instanceof Rectangle;
  }
  istriangle(): boolean {
    return this.selectedObject instanceof Triangle;
  }

  isLine(): boolean {
    return this.selectedObject instanceof Line;
  }

  isEllipse(): boolean {
    return this.selectedObject instanceof Ellipse;
  }

  isText(): boolean {
    return this.selectedObject instanceof Text;
  }

  isPolygon(): boolean {
    return this.selectedObject instanceof Polygon;
  }
  isConnectedCircles(): boolean {
    return this.selectedObject instanceof ConnectedCircles;
  }
  isClosedConnectedCircles(): boolean {
    return this.selectedObject instanceof ClosedConnectedCircles;
  }
  isClosedConnectedEllipses(): boolean {
    return this.selectedObject instanceof ClosedConnectedEllipses;
  }
    //Updates the properties displayed in the sidebar based on the selected object.

  updateProperties(): void {
    if (!this.selectedObject) {
      this.clearProperties();
      return;
    }
    const shape = this.selectedObject.getShape();

  
    this.objectLeft = Number((shape.left || 0).toFixed(0));
    this.objectTop = Number((shape.top || 0).toFixed(0));
    this.objectAngle = Number((shape.angle || 0).toFixed(0));
    this.fillColor = shape.fill as string ;
    this.strokeColor = shape.stroke as string ;
    this.strokeWidth = Number((shape.strokeWidth || 1).toFixed(0));

    if (this.selectedObject instanceof Polygon) {
      const props = this.selectedObject.getProperties();
      this.hatchColor = props.hatchColor || '#000000';
      this.hatchThickness = props.hatchThickness || 1;
    }
  
    if (this.selectedObject instanceof Circle) {
      const circle = shape as fabric.Circle;

      this.circleRadius = Number((circle.radius! * (circle.scaleX || 1)).toFixed(0));
    } else if (this.selectedObject instanceof Rectangle) {
      const rect = shape as fabric.Rect;
      
      this.rectWidth = Number((rect.width! * (rect.scaleX || 1)).toFixed(0)); 
      this.rectHeight = Number((rect.height! * (rect.scaleY || 1)).toFixed(0)); 
    } else if (this.selectedObject instanceof Ellipse) {
      const ellipse = shape as fabric.Ellipse;
      this.ellipseRx = Number((ellipse.rx! * (ellipse.scaleX || 1)).toFixed(0)); 
      this.ellipseRy = Number((ellipse.ry! * (ellipse.scaleY || 1)).toFixed(0));
    } else if (this.selectedObject instanceof Line) {
      const line = shape as fabric.Line;
      this.lineX1 = Number((line.x1! * (line.scaleX || 1)).toFixed(0));
      this.lineY1 = Number((line.y1! * (line.scaleY || 1)).toFixed(0));
      this.lineX2 = Number((line.x2! * (line.scaleX || 1)).toFixed(0));
      this.lineY2 = Number((line.y2! * (line.scaleY || 1)).toFixed(0));
    } else if (this.selectedObject instanceof Text) {
      const text = shape as fabric.IText;
      this.text = text.text || '';
      this.fontFamily = text.fontFamily || 'Arial';
      this.fontSize = Number((text.fontSize || 20).toFixed(0));
      //this.fontWeight = text.fontWeight || 'normal';
      this.textAlign = text.textAlign || 'left';
    } else if (this.selectedObject instanceof Triangle) {
      const triangle = shape as fabric.Triangle;
      this.rectWidth = Number((triangle.width! * (triangle.scaleX || 1)).toFixed(0));
      this.rectHeight = Number((triangle.height! * (triangle.scaleY || 1)).toFixed(0));
    }
      else if (this.selectedObject instanceof ConnectedCircles||this.selectedObject instanceof ClosedConnectedCircles) {
        const props = this.selectedObject.getProperties();
        this.circleRadius = props.radius || 20;
        this.fillColor = props.fillColor || '#000000';
      this.strokeColor = props.strokeColor || '#000000';
      this.strokeWidth = props.lineThickness || 2;
       }
       else if (this.selectedObject instanceof ClosedConnectedEllipses) {
        console.log('connected circles properties',this.selectedObject instanceof ClosedConnectedEllipses)
        const props = this.selectedObject.getProperties();
       this.ellipseRx=props.rx;
       this.ellipseRy=props.ry;
       }
  }


  //Applies the changes made in the properties sidebar to the selected object.
  applyPropertyChanges(): void {
    if (!this.selectedObject) return;
    const canvas = this.canvasEditorService.getCanvas();
    if (!canvas) return;

    const properties: any = {
      objectLeft: this.objectLeft,
      objectTop: this.objectTop,
      
      objectAngle: this.objectAngle,
      fillColor:this.fillColor,
      strokeColor:this.strokeColor,
      strokeWidth: this.strokeWidth,
     
    };

    const shape = this.selectedObject.getShape();
    console.log('Current shape properties:', shape);
  
    switch (shape.type) {
      
      case 'circle':
        properties.circleRadius = this.circleRadius /shape.scaleX!;
        break;
      case 'ellipse':
        properties.ellipseRx = this.ellipseRx/shape.scaleX!;
        properties.ellipseRy = this.ellipseRy/shape.scaleY!;
        break;
      case 'rect':
      case 'triangle':
        properties.rectWidth = this.rectWidth/shape.scaleX!;
        properties.rectHeight = this.rectHeight/shape.scaleY!;
        break;
      case 'line':
        properties.lineX1 = this.lineX1/shape.scaleX!;
        properties.lineY1 = this.lineY1/shape.scaleY!;
        properties.lineX2 = this.lineX2/shape.scaleX!;
        properties.lineY2 = this.lineY2/shape.scaleY!;
        break;
      case 'path':
        if (shape.data?.type === 'curvedLine') {
          properties.startX = this.lineX1/shape.scaleX!;
          properties.startY = this.lineY1/shape.scaleY!;
          properties.endX = this.lineX2/shape.scaleX!;
          properties.endY = this.lineY2/shape.scaleY!;
        }
        break;
      case 'i-text':
        properties.text = this.text;
        properties.fontFamily = this.fontFamily;
        properties.fontSize = this.fontSize;
        properties.fontWeight = this.fontWeight;
        properties.textAlign = this.textAlign;
        properties.textTransform = this.textTransform;
        break;

        
      case 'polygon':
        properties.hatchColor = this.hatchColor;
        properties.hatchThickness = this.hatchThickness;
        break;

      case 'connectedCircles':
        const cc = this.selectedObject as ConnectedCircles;
        const currentProps = cc.getProperties();
        console.log('ConnectedCircles current properties:', currentProps);
        if (this.circleRadius !== cc.getProperties().radius) properties.radius = this.circleRadius;
     
        break

      case 'closedConnectedCircles':
        const ccc = this.selectedObject as ClosedConnectedCircles;
        if (this.circleRadius !== ccc.getProperties().radius) properties.radius = this.circleRadius;        
        break  

      case 'closedConnectedEllipses':
        const ce = this.selectedObject as ClosedConnectedEllipses;
        if (this.ellipseRx !== ce.getProperties().rx) properties.rx = this.ellipseRx;
        if (this.ellipseRy !== ce.getProperties().ry) properties.ry = this.ellipseRy;
        break  
    }

    this.canvasEditorService.applyPropertyChanges(this.selectedObject, properties, canvas);
    
    canvas.renderAll();
  }

  private clearProperties(): void {
    this.objectLeft = 0;
    this.objectTop = 0;
    
    this.objectAngle = 0;
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
    this.strokeWidth = 1;
    this.circleRadius = 0;
    this.ellipseRx = 0;
    this.ellipseRy = 0;
    this.rectWidth = 0;
    this.rectHeight = 0;
    this.lineX1 = 0;
    this.lineY1 = 0;
    this.lineX2 = 0;
    this.lineY2 = 0;
    this.text = '';
    this.fontFamily = 'Arial';
    this.fontSize = 20;
    this.fontWeight = 'normal';
    this.textAlign = 'left';
    this.textTransform = 'none';
  }
}


 