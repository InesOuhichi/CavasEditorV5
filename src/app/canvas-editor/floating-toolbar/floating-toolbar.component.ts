import { Component, Input } from '@angular/core';
import { CanvasEditorService } from '../canvas-editor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-toolbar.component.html',
  styleUrl: './floating-toolbar.component.css'
})
export class FloatingToolbarComponent {
@Input() canvas: fabric.Canvas | null = null; 
  @Input() position: { left: number; top: number } = { left: 0, top: 0 };

  constructor(private canvasEditorService: CanvasEditorService) {}


  //Groups the currently selected objects on the canvas.
  groupObjects(): void {
    if (this.canvas) {
      this.canvasEditorService.groupObjects(this.canvas);
    }  
  }

  //Ungroups the currently selected group on the canvas.
  ungroupObjects(): void {
    if (this.canvas) {
      this.canvasEditorService.ungroupObjects(this.canvas);
    } 
  }


  //Checks if the active object is a group.
  isGroupSelected(): boolean {
    const activeObjectType = this.canvas?.getActiveObject()?.type;
    return activeObjectType === 'group'  ; 
  }

  //Determines if multiple objects are selected, excluding SVGs.
  isMultipleSelected(): boolean {
    const activeObjects = this.canvas?.getActiveObjects() || [];
    return activeObjects.length > 1 && !activeObjects.some(obj => obj.type === 'svg');
  }

  


}
