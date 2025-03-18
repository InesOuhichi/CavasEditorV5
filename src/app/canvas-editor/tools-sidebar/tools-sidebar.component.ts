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
  private isOpenCvReady: boolean = false; //Tracks if OpenCV.js is loaded for image processing.


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

  
  //Opens a file input for images, processes them with OpenCV.js for perspective correction, and adds them to the canvas.
  importImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Accept all image types (e.g., .png, .jpg, .jpeg)
  
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imageDataUrl = e.target.result as string;
          const canvas = this.canvasEditorService.getCanvas();
          if (canvas) {
            const img = new Image();
            img.onload = () => {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = img.width;
              tempCanvas.height = img.height;
              const ctx = tempCanvas.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              const imageData = ctx?.getImageData(0, 0, img.width, img.height);

              if (imageData) {
                this.detectPerspectiveAngle(imageData).then(angle => {
                  console.log('Detected distortion angle:', angle);
                  this.canvasEditorService.setPerspectiveAngle(angle);
                  this.canvasEditorService.importImage(imageDataUrl, canvas);
                });
              } else {
                this.canvasEditorService.importImage(imageDataUrl, canvas);
              }
            };
            img.src = imageDataUrl;
          }
        };
        reader.readAsDataURL(file); 
      }
    };
  
    input.click();
  }


  //Uses OpenCV.js to detect the average angle of tilted lines in an image for perspective correction.
  private async detectPerspectiveAngle(imageData: ImageData): Promise<number> {
    if (!this.isOpenCvReady) {
      await new Promise<void>((resolve) => {
        const checkOpenCv = () => {
          if (typeof cv !== 'undefined' && cv.getBuildInformation()) {
            this.isOpenCvReady = true;
            resolve();
          } else {
            setTimeout(checkOpenCv, 100);
          }
        };
        checkOpenCv();
      });
    }
    const src = cv.matFromImageData(imageData);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const lines = new cv.Mat();
  
    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  
    // Apply Gaussian blur to reduce noise
    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
  
    // Increase contrast to enhance field lines
    const highContrast = new cv.Mat();
    cv.convertScaleAbs(gray, highContrast, 1.5, 0); // Increase brightness by 50%
  
    // Apply Canny edge detection with adjusted thresholds
    cv.Canny(highContrast, edges, 30, 100, 3, false); 
  
    // Detect lines using Probabilistic Hough Transform with adjusted parameters
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 30, 5); 
  
    let angleSum = 0;
    let angleCount = 0;
    const angles: number[] = [];
    const filteredAngles: number[] = [];

    for (let i = 0; i < lines.rows; i++) {
      const line = lines.data32S.slice(i * 4, (i + 1) * 4); // [x1, y1, x2, y2]
      const dx = line[2] - line[0];//x2-x1
      const dy = line[3] - line[1]; //y2-y1
      let angle = Math.atan2(dy, dx) * 180 / Math.PI; //from PI to 180°

   
    angles.push(angle);

    // Filter for lines that are tilted (exclude near-horizontal/vertical)
    if ((angle > 5 && angle < 85) || (angle > 95 && angle < 175)) {
      angleSum += angle;
      angleCount++;
      filteredAngles.push(angle);
    }
  }

  let averageAngle = 0;
  if (angleCount > 0) {
    averageAngle = angleSum / angleCount;
    console.log(`Average distortion angle from ${angleCount} lines: ${averageAngle.toFixed(2)}°`);
  } else {
    console.warn('No suitable tilted lines detected for angle calculation. Falling back to 0°.');
    console.log(`All angles: [${angles.map(a => a.toFixed(2)).join(', ')}]`);
  }

  src.delete();
  gray.delete();
  edges.delete();
  lines.delete();
  highContrast.delete();

  return averageAngle;
  }


}

