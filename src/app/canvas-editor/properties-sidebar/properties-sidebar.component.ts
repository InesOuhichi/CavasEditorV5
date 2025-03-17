/*This component displays and allows modification of the properties of the currently selected object on the canvas.*/
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CanvasEditorService } from '../canvas-editor.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { fabric } from 'fabric'; // Import Fabric.js
import { Ellipse } from '../../models/shapes/ellipse';
import { CurvedLine } from '../../models/shapes/curved-line';
import { AngleIndicator } from '../../models/shapes/angleIndicator';
import { BaseShape } from '../../models/shapes/base-shape';
import { Triangle } from '../../models/shapes/triangle';
import { Rectangle } from '../../models/shapes/rectangle';
import { Polygon } from '../../models/shapes/polygon';
import { Line } from '../../models/shapes/line';
import { Circle } from '../../models/shapes/circle';
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

    }
  );
  }

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
  }


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
    switch (shape.type) {
      case 'polygon':
        properties.hatchColor = this.hatchColor;
        properties.hatchThickness = this.hatchThickness;

        break;
      case 'circle':
        properties.circleRadius = this.circleRadius;
        break;
      case 'ellipse':
        properties.ellipseRx = this.ellipseRx;
        properties.ellipseRy = this.ellipseRy;
        break;
      case 'rect':
      case 'triangle':
        properties.rectWidth = this.rectWidth;
        properties.rectHeight = this.rectHeight;
        break;
      case 'line':
        properties.lineX1 = this.lineX1;
        properties.lineY1 = this.lineY1;
        properties.lineX2 = this.lineX2;
        properties.lineY2 = this.lineY2;
        break;
      case 'path':
        if (shape.data?.type === 'curvedLine') {
          properties.startX = this.lineX1;
          properties.startY = this.lineY1;
          properties.endX = this.lineX2;
          properties.endY = this.lineY2;
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
    }

    this.canvasEditorService.applyPropertyChanges(this.selectedObject, properties, canvas);
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


 