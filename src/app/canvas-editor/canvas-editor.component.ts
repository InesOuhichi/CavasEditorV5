import { Component, ElementRef, Inject, ViewChild  } from '@angular/core';
import {  HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolsSidebarComponent } from "./tools-sidebar/tools-sidebar.component";
import { CanvasComponent } from "./canvas/canvas.component";
import { PropertiesSidebarComponent } from "./properties-sidebar/properties-sidebar.component";
import { CanvasEditorService } from './canvas-editor.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fabric } from 'fabric';

@Component({
  selector: 'app-canvas-editor',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, ToolsSidebarComponent, CanvasComponent, PropertiesSidebarComponent],
  templateUrl: './canvas-editor.component.html',
  styleUrl: './canvas-editor.component.css'
})
export class CanvasEditorComponent {
  title = 'fabric-shape-editor';
 /* @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fabricCanvas', { static: false }) fabricCanvas!: ElementRef<HTMLCanvasElement>;

  private canvas!: fabric.Canvas;

  constructor(
    private canvasEditorService: CanvasEditorService,
    @Inject(MAT_DIALOG_DATA) public data: { svgData?: string },
    private dialogRef: MatDialogRef<CanvasEditorComponent>
  ) {}

  ngOnInit(): void {
    console.log('Received data:', this.data);
    // Use this.data.svgData to initialize the canvas if provided
  }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas(this.fabricCanvas.nativeElement, {
      width: this.canvasContainer.nativeElement.clientWidth,
      height: this.canvasContainer.nativeElement.clientHeight
    });
    if (this.data?.svgData) {
      fabric.loadSVGFromString(this.data.svgData, (objects, options) => {
        const group = new fabric.Group(objects, options);
        this.canvas.add(group);
        this.canvas.renderAll();
      });
    }
    this.canvasEditorService.getCanvasConfig();

    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this.canvasContainer.nativeElement);
  }

  private resizeCanvas(): void {
    if (this.canvas && this.canvasContainer) {
      const containerWidth = this.canvasContainer.nativeElement.clientWidth;
      const containerHeight = this.canvasContainer.nativeElement.clientHeight;
      this.canvas.setWidth(containerWidth);
      this.canvas.setHeight(containerHeight);
      this.canvas.renderAll();
    }
  }

  closeDialog(): void {
    this.dialogRef.close(this.canvas.toJSON()); // Return canvas state
  }*/
}

