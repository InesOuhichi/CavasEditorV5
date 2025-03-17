import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasEditorComponent } from "./canvas-editor/canvas-editor.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'canvas-fabric-app';
  constructor(private dialog: MatDialog) {}

  openCanvasEditor() {
    const dialogRef = this.dialog.open(CanvasEditorComponent, {
      width: '80vw',
      height: '80vh',
      maxWidth: '1200px',
      maxHeight: '800px',
      panelClass: 'canvas-editor-dialog',
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Canvas Editor dialog closed', result);
    });
  }
}
