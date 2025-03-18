/**This component is responsible for rendering the Fabric.js canvas and handling user interactions with it. */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasEditorService } from '../canvas-editor.service';
import { fabric } from 'fabric';
import {   attachServiceToCanvas, cloneControl, createPolygonEdgeControls, deleteControl} from '../New-control';
import { CommonModule } from '@angular/common';
import { FloatingToolbarComponent } from "../floating-toolbar/floating-toolbar.component";
import { Polygon } from '../../models/shapes/polygon';
import { ConnectedCircles } from '../../models/shapes/connected-circles';
import { ClosedConnectedCircles } from '../../models/shapes/closed-connected-circles';
import { ClosedConnectedEllipses } from '../../models/shapes/closed-connected-ellipses';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FloatingToolbarComponent],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent {
  @ViewChild('canvasElement') canvasElement!: ElementRef;
   public  canvas!: fabric.Canvas;

   
   showFloatingToolbar: boolean = false; // Toggle for floating toolbar visibility
   toolbarPosition: { left: number; top: number } = { left: 0, top: 0 }; // Position of the toolbar
   renderSelection: boolean = true; // Flag to track whether the slection should be rendered
  


   
  constructor(private canvasEditorService: CanvasEditorService) {}

  ngAfterViewInit(): void {
    // Create the Fabric.js canvas
    this.canvas = new fabric.Canvas(
      this.canvasElement.nativeElement,
      this.canvasEditorService.getCanvasConfig()
    );
    this.canvasEditorService.setCanvas(this.canvas);

    this.canvas.on('mouse:down', (opt) => this.onMouseDown(opt));
    this.canvas.on('mouse:move', (opt) => this.onMouseMove(opt));
    this.canvas.on('mouse:up', (opt) => this.onMouseUp(opt));


    this.canvas.on('selection:created', (e) => this.onSelection(e));
    this.canvas.on('selection:updated', (e) => this.onSelection(e));

    this.canvas.on('selection:cleared', () => this.canvasEditorService.setSelectedObject(null));


    this.canvas.on('object:modified', (e) => this.onObjectModified(e));
 

    this.canvas.on('object:removed', (e) => {
      if (e.target) {
        this.canvasEditorService.deleteShape(e.target);
      }
    });

    this.canvas.on('text:changed', (e: any) => this.onTextChanged(e)); 

    this.canvas.on('mouse:dblclick', (opt) => {
      this.onDoubleClick(opt)
      console.log('type double',this.canvasEditorService.getSelectedShapeType() )

      if (this.canvasEditorService.getSelectedShapeType() === 'polygon') {
        this.canvasEditorService.closePolygonDrawing(this.canvas);
      }
      else if (this.canvasEditorService.getSelectedShapeType() === 'connectedCircles'|| this.canvasEditorService.getSelectedShapeType() === 'closedConnectedCircles'|| this.canvasEditorService.getSelectedShapeType() === 'closedConnectedEllipses') {
        console.log('shape double click',this.canvasEditorService.getSelectedShapeType())
        console.log('Double-click detected, finishing drawing');
        this.canvasEditorService.finishDrawing(this.canvas);
      }

    
    });
  
  

  }


  
  private onMouseDown(event: any): void {
    const shapeType = this.canvasEditorService.getSelectedShapeType();
    if (!event.e) return;
  
    const canvas = this.canvasEditorService.getCanvas();
    if (!canvas) return;
  
    if (!shapeType) {
      return; 
    }
  
   
      this.canvasEditorService.setSelectedObject(null); 
      this.canvasEditorService.startDrawing(event.e.offsetX, event.e.offsetY, shapeType, canvas);
  
  
   
  }

  private onMouseMove(event: any): void {
    const canvas = this.canvasEditorService.getCanvas();
    if(canvas){
     
     
      this.canvasEditorService.draw(event.e.offsetX, event.e.offsetY,canvas)
    }
  }

  private onMouseUp(event:any): void {
    const canvas = this.canvasEditorService.getCanvas();
    if(canvas){
      
     
      this.canvasEditorService.endDrawing(event.e.offsetX,event.e.offsetY,canvas)
      console.log('type  mouse up', this.canvasEditorService.selectedObjectSubject.value)

    }
 
  }

  private onSelection(e: fabric.IEvent): void {
    const canvas = this.canvasEditorService.getCanvas();
    if (!canvas || !e.selected) return;

    if (canvas && e.selected) {
      e.selected.forEach((obj: fabric.Object) => {
        const controls: { [key: string]: fabric.Control } = {
          ...fabric.Object.prototype.controls,
          deleteControl,
          cloneControl,
        };
        obj.controls = controls;
        obj.set({
          cornerSize: 10,
          cornerColor: 'rgba(67, 68, 68, 0.7)',
          borderColor: 'black',
          cornerStyle: 'circle',
          transparentCorners: false,
          padding: 5,
        });
      });
    this.canvasEditorService.onSelection(e, this.canvas);
    const activeObjects = this.canvas.getActiveObjects();

    const selectedShape = this.canvasEditorService.selectedObjectSubject.value;
    const isConnectedCircles = selectedShape instanceof ConnectedCircles;
    const isClosedConnectedCircles = selectedShape instanceof ClosedConnectedCircles;
    const isClosedConnectedEllipses=selectedShape instanceof ClosedConnectedEllipses

    if (activeObjects.length > 1) {
      console.log('active objects[0]',activeObjects[0])

      this.showFloatingToolbar = true;
      this.updateToolbarPosition(activeObjects);
      this.renderSelection = false;
    } else if (activeObjects.length === 1 && (activeObjects[0].type === 'group')&& !isConnectedCircles && !isClosedConnectedCircles && !isClosedConnectedEllipses) { 
      this.showFloatingToolbar = true;
      this.updateToolbarPosition(activeObjects);
      this.renderSelection = false;
    } else {
      console.log('1 object selected ',activeObjects)
      this.showFloatingToolbar = false;
      this.renderSelection = true;
    }
  }
  }

  private onObjectModified(e: fabric.IEvent): void {
    const shape = this.canvasEditorService.getShapeByFabricObject(e.target!);
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject?.group) {
        this.canvasEditorService.getShapeByFabricObject(activeObject!);
        const canvas = this.canvasEditorService.getCanvas()
        if(canvas){
          // Update the selected object to reflect the modified state
          if (shape === this.canvasEditorService.selectedObjectSubject.value) {
            this.canvasEditorService.setSelectedObject(shape); 
          }
          this.canvasEditorService.pushState(canvas);
        }
    }else {
      const group = activeObject.group as fabric.Group;
      group.setCoords(); // Update group bounding box
      const canvas = this.canvasEditorService.getCanvas()

      if(canvas){
      this.canvasEditorService.pushState(canvas);
      canvas.renderAll();}
    }
  }

//Updates the selected object and canvas state when text is edited.
private onTextChanged(event: any): void {
  if (event && event.target && event.target.type === 'i-text') {
    const shape = this.canvasEditorService.getShapeByFabricObject(event.target!);
    //const activeObject = this.canvas.getActiveObject();
    //this.canvasEditorService.getShapeByFabricObject(activeObject!);
    if (shape === this.canvasEditorService.selectedObjectSubject.value) {
      this.canvasEditorService.setSelectedObject(shape); 
    }
    const canvas = this.canvasEditorService.getCanvas()
    if(canvas){
      
      this.canvasEditorService.pushState(canvas);
    }
  }
}


  private updateToolbarPosition(activeObjects: fabric.Object[]): void {
    const group = new fabric.Group(activeObjects);
    const boundingRect = group.getBoundingRect();
    group.destroy();
    this.toolbarPosition = {
      left: boundingRect.left + boundingRect.width / 2 + 100,
      top: boundingRect.top,
    };
  }

  

  
 
  

//Handles double-click events, primarily for group and polygon interactions.
  private onDoubleClick(opt: fabric.IEvent): void {
  
    const canvas = this.canvasEditorService.getCanvas();
    if (!canvas || !opt.target) return;

    if (opt.target.type === 'group' && opt.subTargets && opt.subTargets.length > 0) {
      const subTarget = opt.subTargets[0]; // Select the first sub-target clicked
      subTarget.set({
        controls: { ...subTarget.controls, deleteControl, cloneControl },
        selectable: true,  
        evented: true,     
        hasControls: true,
        hasBorders: true,
      });

      // Set the child as the active object
      canvas.setActiveObject(subTarget);

      this.canvasEditorService.getShapeByFabricObject(subTarget);
      this.showFloatingToolbar = false; 
      canvas.renderAll();
    }
    
  }


 
  
 

}


