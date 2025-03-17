/** The CanvasEditorService acts as the central data and logic hub for the entire canvas editor. It manages the canvas instance, selected object, shape drawing, history, and property modifications. */
import { ElementRef, Injectable } from '@angular/core';
import  {fabric} from 'fabric'
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseShape } from '../models/shapes/base-shape';
import { Rectangle } from '../models/shapes/rectangle';
import { Circle } from '../models/shapes/circle';
import { Triangle } from '../models/shapes/triangle';
import { Line } from '../models/shapes/line';
import { Ellipse } from '../models/shapes/ellipse';
import { Text } from '../models/shapes/text';
import { fabricGif } from '../utils/fabricGif';
import {  cloneControl, deleteControl } from './New-control';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Polygon } from '../models/shapes/polygon';
import { Polyline } from '../models/shapes/polyline';
import { CurvedLine } from '../models/shapes/curved-line';
import { AngleIndicator } from '../models/shapes/angleIndicator';
import { ConnectedCircles } from '../models/shapes/connected-circles';
//import { AngleIndicator } from '../models/shapes/angleIndicator';

@Injectable({
  providedIn: 'root'
})
export class CanvasEditorService {
  private selectedObject = new BehaviorSubject<fabric.Object | null>(null);//Subject that holds the currently selected Fabric.js object.
  private canvasSubject = new BehaviorSubject<fabric.Canvas | null>(null);// Subject that holds the Fabric.js canvas instance.
  private isGrouped = new BehaviorSubject<boolean>(false);//Indicates if the selected objects are grouped.


  

  canvas$ = this.canvasSubject.asObservable();//Observable that emits the Fabric.js canvas instance.
  isGrouped$ = this.isGrouped.asObservable();
 
   isPenToolActive: boolean = false; // Track pen tool state


  private shapes: BaseShape[] = [];
   selectedObjectSubject = new BehaviorSubject<BaseShape | null>(null);
  selectedObject$: Observable<BaseShape | null> = this.selectedObjectSubject.asObservable();
  private selectedShapeType: string | null = null;
  private history: string[] = [];
  private historyIndex: number = -1;




  //Drawing State
   isDrawing = false;//Flag indicating whether the user is currently drawing a shape.
 
  currentShape: BaseShape | null = null;// The current shape being drawn.
  currentShapeBasic:fabric.Object | null = null

  
  private perspectiveAngle: number = 0;//Angle for perspective correction.


   

  getCanvasConfig() {
    return {
      width: 800,
      height: 600,
      backgroundColor: '#f0f0f0',
      selection: true,
      preserveObjectStacking: true,
    };
  }
  //Gets the Fabric.js canvas instance.
  getCanvas(): fabric.Canvas | undefined {
    return this.canvasSubject.value || undefined;
  }


  //Sets the Fabric.js canvas instance.
  setCanvas(canvas: fabric.Canvas): void {
    this.canvasSubject.next(canvas);
  }



 setSelectedShapeType(type: string | null): void {
    this.selectedShapeType = type;
    if (!type) {
      this.isDrawing = false; 
    }
  }

  getSelectedShapeType(): string | null {
    return this.selectedShapeType;
  }
  
  addShape(shape: BaseShape): void {
    const canvas=this.getCanvas()
    this.shapes.push(shape);
    shape.addToCanvas();
    console.log('Shapes after adding:', this.shapes); 
    this.pushState(canvas!);
  }

 
  getShapeByFabricObject(fabricObj: fabric.Object): BaseShape | undefined {
    return this.shapes.find(shape => shape.getId() === fabricObj.data?.modelId);
  
  }

  

  setSelectedObject(shape: BaseShape | null): void {
    this.selectedObjectSubject.next(shape);
    const canvas=this.getCanvas()

    if (shape) {
     canvas!.setActiveObject(shape.getShape());
    } else {
      canvas!.discardActiveObject();
    }
    canvas!.renderAll();
  }

  

  onSelection(e: fabric.IEvent, canvas: fabric.Canvas): void {
    console.log('Selection event:', e.selected); 
    console.log('Shapes during selection:', this.shapes);
    if (e.selected && e.selected.length > 0) {

      if (e.selected.length > 1) {

        const selection = new fabric.ActiveSelection(e.selected, { canvas });
        console.log('selection',selection)
        selection.set({ 
          hasControls: false, 
          hasBorders: false 
        });
        selection.forEachObject((obj:fabric.Object)=>{
          if ((obj as any).originalStrokeWidth === undefined) {
            (obj as any).originalStrokeWidth = obj.strokeWidth || 0;
          }
          obj.set('strokeWidth', 1);
        })
        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
        this.isGrouped.next(true);

      } 
      else 
      {/*if i do 
        this.getShapeByFabricObject(e.selected[0]);
        this.isGrouped.next(false);
        i can group and ungroup but the properties sidebar disappear once i select one of the object on the canvas
        */
        const selectedShape = this.getShapeByFabricObject(e.selected[0]);
        console.log('on selectionSelected shape:', selectedShape); 
        this.setSelectedObject(selectedShape || null);
        this.isGrouped.next(false);
      }
    } else {
      console.log('No selection, clearing selected object');
      this.setSelectedObject(null);
      this.isGrouped.next(false);

    }
    canvas.requestRenderAll();
  }



  deleteShape(fabricObj: fabric.Object): void {
    const shape = this.getShapeByFabricObject(fabricObj);
    const canvas=this.getCanvas()

    if (shape) {
      this.shapes = this.shapes.filter(s => s.getId() !== shape.getId());
      canvas!.remove(fabricObj);
      this.setSelectedObject(null);
      this.pushState(canvas!);
    }
  }
 
  
  pushState(canvas: fabric.Canvas): void {
    const json = canvas.toJSON(['data']);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(json));
    this.historyIndex++;
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadState(this.history[this.historyIndex]);
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadState(this.history[this.historyIndex]);
    }
  }

  private loadState(state: string): void {
    const canvas = this.getCanvas();
    if (!canvas) return;
  
    const shapeMap = new Map<string, BaseShape>();
    this.shapes.forEach(shape => shapeMap.set(shape.getId(), shape));
  
    canvas.clear();
    canvas.loadFromJSON(state, () => {
      const newShapes: BaseShape[] = [];
      canvas.getObjects().forEach(obj => {
        const modelId = obj.data?.modelId;
        if (modelId) {
          const shape = shapeMap.get(modelId);
          if (shape) {
            shape['shape'] = obj; 
            newShapes.push(shape);
          } else {
            console.warn('Shape with modelId not found in shapeMap:', modelId);
          }
        }
      });
      this.shapes = newShapes; 
      console.log('Shapes after loadState:', this.shapes);
      canvas.renderAll();
      this.setSelectedObject(null);
    });
  }
  

  

  startDrawing(x: number, y: number, shapeType: string, canvas: fabric.Canvas): void {
    this.isDrawing = true;

    let shape: BaseShape;
    if (shapeType === null) {
      return; 
    }
    
    if (shapeType === 'polygon' && this.currentShape instanceof Polygon && !this.currentShape['isClosed']) {
      this.currentShape.addPoint(x, y);
      return;
    }
    switch (shapeType) {
      case 'polygon':
        shape=new Polygon(canvas,x,y)
        break;
      case 'rect':
        shape = new Rectangle(canvas, x, y);
        break;
      case 'circle':
        shape = new Circle(canvas, x, y);
        break;
      case 'ellipse':
        shape = new Ellipse(canvas, x, y);
        break;
      case 'line':
        shape = new Line(canvas, x, y);
        break;
      
      case 'text':
        shape = new Text(canvas, x, y, { fontSize: 20, fontFamily: 'Arial', fillColor: '#000000' });
        break;
      case 'triangle':
        shape = new Triangle(canvas, x, y);
        break;

        case 'connectedCircles':
          if (!this.currentShape) {
            this.currentShape = new ConnectedCircles(canvas, x, y);
            this.currentShape.addToCanvas();
          } else {
            this.currentShape.updateShape(x, y);
          }
          return;  
      
      default:
        return;
      
    }
    this.currentShape=shape,
    this.applyPerspectiveToShape(this.currentShape.getShape());
     


    this.addShape(shape);
    if (shapeType !== 'polygon') {
      this.setSelectedObject(shape); 
    } 

    canvas.renderAll();

  }



  draw(x: number, y: number, canvas: fabric.Canvas): void {
    const selectedShape = this.currentShape;
    if (!this.isDrawing || !this.currentShape||this.getSelectedShapeType() === 'connectedCircles' ) return;
    if (selectedShape) {
      selectedShape.updateShape(x, y);
      canvas.renderAll();
    }
  }

  endDrawing(x: number, y: number, canvas: fabric.Canvas): void {
    if (!this.isDrawing || !this.currentShape) return;
  this.isDrawing = false;

  if (this.currentShape instanceof Polygon && !this.currentShape['isClosed']) {
    this.currentShape.addPoint(x, y); 
  } else {
    this.currentShape.setCoords();
    this.setSelectedObject(this.currentShape);
    this.pushState(canvas);
    this.currentShape = null;
    this.setSelectedShapeType(null);
  }
     
  }
    
  //Completes and closes a polygon.
  closePolygonDrawing(canvas: fabric.Canvas): void {
    if (this.currentShape instanceof Polygon && !this.currentShape['isClosed']) {
      console.log('Shapes before closing:', this.shapes);
      this.currentShape.closePolygon();
      console.log('Shapes after closing:', this.shapes); 

      // Ensure the shape is still in the shapes array
      if (!this.shapes.includes(this.currentShape)) {
        this.shapes.push(this.currentShape);
      }

   
      canvas.selection = true; 
      this.setSelectedObject(this.currentShape);
      canvas.setActiveObject(this.currentShape.getShape()); 
      this.pushState(canvas);
      this.currentShape = null;
      this.setSelectedShapeType(null);
      this.isDrawing = false;
      canvas.renderAll();
    
  }}

  finishDrawing(canvas: fabric.Canvas): void {
    console.log('finish drawing method called')
    if (this.currentShape) {
      if (this.currentShape instanceof ConnectedCircles) {
        console.log('current shape',this.currentShape)
        this.currentShape.finishDrawing();
      }
      this.currentShape.setCoords();
      canvas.setActiveObject(this.currentShape.getShape());
      this.setSelectedObject(this.currentShape);
    }
    this.isDrawing = false;
    this.currentShape = null;
    this.setSelectedShapeType(null);
    canvas.defaultCursor = 'default';
    canvas.selection = true;
    this.pushState(canvas);
  }
 


  applyPropertyChanges(shape: BaseShape, properties: any, canvas: fabric.Canvas): void {
    shape.updateFromProperties(properties);
    //shape.setCoords();
    this.setSelectedObject(shape);
    this.pushState(canvas);
  }

  groupObjects(canvas: fabric.Canvas): void {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObject();
    if (!activeObjects || activeObjects.type !== 'activeSelection') return;

    const objects = (activeObjects as fabric.ActiveSelection).getObjects();
    if (objects.length <= 1) return;

    // Remove objects from the canvas before grouping
    objects.forEach((obj) => canvas!.remove(obj));
    canvas.discardActiveObject(); 

    objects.forEach((obj) => {
      obj.set({
        selectable: true,
        evented: true,
        hasControls: true, 
      });
    });

    const group = new fabric.Group(objects, {   
         subTargetCheck: true,
         hasControls: true,
         hasBorders: true,
    });

    console.log('Created group with type:', group.type); 
      
    group.setCoords();

    canvas.add(group);
    canvas.setActiveObject(group); 
    canvas.requestRenderAll();


   console.log('Active object after grouping:', canvas.getActiveObject());

    this.pushState(canvas);
    this.getShapeByFabricObject(group); 
  }


  //Ungroups a selected group and restores individual objects.
  ungroupObjects(canvas: fabric.Canvas): void {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    const group = activeObject as fabric.Group;
    const objects = group.getObjects();

    group._restoreObjectsState();
    canvas.discardActiveObject();
    canvas.remove(group);

    // Add objects back to the canvas and update their coordinates
    objects.forEach((obj) => {
      canvas!.add(obj);
      obj.setCoords(); 
    });

    // Create an ActiveSelection with the ungrouped objects
    const selection = new fabric.ActiveSelection(objects, {
      canvas: canvas,
    });
    selection.setCoords(); 
    canvas.setActiveObject(selection);
    this.getShapeByFabricObject(selection);
    canvas.renderAll();
    this.pushState(canvas);
  }



    //Applies perspective skew based on perspectiveAngle.
    private applyPerspectiveToShape(obj: fabric.Object): void {
      const angle = this.getPerspectiveAngle();
      if (angle) {
        obj.set({
          skewX: Math.tan(angle * Math.PI / 180) * 100, 
        });
        obj.setCoords();
      }
    }
    getPerspectiveAngle(): number {
      return this.perspectiveAngle;
    }
  //Resets the canvas to its initial state.
  reset(canvas: fabric.Canvas): void {
    canvas.clear();
    this.history = [];
    this.historyIndex = -1;
    this.pushState(canvas);
  }

  //Gets the history of canvas states.
  getHistory(): string[] {
    return this.history;
  }

  //Gets the current index in the history array.
  getHistoryIndex(): number {
    return this.historyIndex;
  }

}

