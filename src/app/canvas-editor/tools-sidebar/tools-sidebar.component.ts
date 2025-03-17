/**Provides a toolbar for selecting shapes, importing SVGs, and managing undo/redo/reset actions. */
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasEditorService } from '../canvas-editor.service';
import { fabric } from 'fabric';

import cv from '@techstark/opencv-js';
import { Polygon } from '../../models/shapes/polygon';
@Component({
  selector: 'app-tools-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tools-sidebar.component.html',
  styleUrl: './tools-sidebar.component.css'
})
export class ToolsSidebarComponent  {
  selectedTool: string | null = null;

  constructor(private canvasEditorService: CanvasEditorService) {}

  selectTool(tool: string): void {
      this.selectedTool = tool;
      this.canvasEditorService.setSelectedShapeType(tool);
      // Deselect any currently selected object to start fresh drawing
      this.canvasEditorService.setSelectedObject(null);
  
  }

  isToolSelected(tool: string): boolean {
    return this.selectedTool === tool;
  }


  undo(): void {
    this.canvasEditorService.undo();
  }

  redo(): void {
    this.canvasEditorService.redo();
  }
  resetCanvas(): void {
    const canvas = this.canvasEditorService.getCanvas();
    if (canvas) {
      this.canvasEditorService.reset(canvas);
    }
  }
}

