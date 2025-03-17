import { fabric } from 'fabric';
import { CanvasEditorService } from './canvas-editor.service';
declare module 'fabric' {
    namespace fabric {
        interface Transform {
            control?: fabric.Control;
          }

      interface Control {
        edgeIndex?: number; 
      }
      
    }
  }

const deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='red'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E";

const cloneIcon =
"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 55.699 55.699' width='100px' height='100px' xml:space='preserve'%3E%3Cpath style='fill:%23010002;' d='M51.51,18.001c-0.006-0.085-0.022-0.167-0.05-0.248c-0.012-0.034-0.02-0.067-0.035-0.1 c-0.049-0.106-0.109-0.206-0.194-0.291v-0.001l0,0c0,0-0.001-0.001-0.001-0.002L34.161,0.293c-0.086-0.087-0.188-0.148-0.295-0.197 c-0.027-0.013-0.057-0.02-0.086-0.03c-0.086-0.029-0.174-0.048-0.265-0.053C33.494,0.011,33.475,0,33.453,0H22.177 c-3.678,0-6.669,2.992-6.669,6.67v1.674h-4.663c-3.678,0-6.67,2.992-6.67,6.67V49.03c0,3.678,2.992,6.669,6.67,6.669h22.677 c3.677,0,6.669-2.991,6.669-6.669v-1.675h4.664c3.678,0,6.669-2.991,6.669-6.669V18.069C51.524,18.045,51.512,18.025,51.51,18.001z M34.454,3.414l13.655,13.655h-8.985c-2.575,0-4.67-2.095-4.67-4.67V3.414z M38.191,49.029c0,2.574-2.095,4.669-4.669,4.669H10.845 c-2.575,0-4.67-2.095-4.67-4.669V15.014c0-2.575,2.095-4.67,4.67-4.67h5.663h4.614v10.399c0,3.678,2.991,6.669,6.668,6.669h10.4 v18.942L38.191,49.029L38.191,49.029z M36.777,25.412h-8.986c-2.574,0-4.668-2.094-4.668-4.669v-8.985L36.777,25.412z M44.855,45.355h-4.664V26.412c0-0.023-0.012-0.044-0.014-0.067c-0.006-0.085-0.021-0.167-0.049-0.249 c-0.012-0.033-0.021-0.066-0.036-0.1c-0.048-0.105-0.109-0.205-0.194-0.29l0,0l0,0c0-0.001-0.001-0.002-0.001-0.002L22.829,8.637 c-0.087-0.086-0.188-0.147-0.295-0.196c-0.029-0.013-0.058-0.021-0.088-0.031c-0.086-0.03-0.172-0.048-0.263-0.053 c-0.021-0.002-0.04-0.013-0.062-0.013h-4.614V6.67c0-2.575,2.095-4.67,4.669-4.67h10.277v10.4c0,3.678,2.992,6.67,6.67,6.67h10.399 v21.616C49.524,43.26,47.429,45.355,44.855,45.355z'/%3E%3C/svg%3E%0A";



// Create an Image element for the delete icon
const deleteImg = document.createElement('img');
deleteImg.src = deleteIcon;

// Create an Image element for the clone icon
const cloneImg = document.createElement('img');
cloneImg.src = cloneIcon;


// Custom control for deleting an object
export const deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -10,
    offsetX: 10,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon,
});

// Custom control for cloning an object
export const cloneControl = new fabric.Control({
    x: 0.5,
    y: 0.5,
    offsetY: -10,
    offsetX: 10,
    cursorStyle: 'pointer',
    mouseUpHandler: cloneObject,
    render: renderCloneIcon,
});


//Removes the target object and triggers a canvas re-render.
function deleteObject(eventData: MouseEvent, transformData: fabric.Transform) {
    if (!transformData || !transformData.target || !transformData.target.canvas) return false;
    transformData.target.canvas.remove(transformData.target);
    transformData.target.canvas.requestRenderAll();
    return true;
}

//Clones the target object, adds it to the canvas, and re-renders.
function cloneObject(eventData: MouseEvent, transformData: fabric.Transform) {
    if (!transformData || !transformData.target || !transformData.target.canvas) return false;

    transformData.target.clone((cloned: fabric.Object) => {
        cloned.left = (transformData.target.left || 0) + 10;
        cloned.top = (transformData.target.top || 0) + 10;
        transformData.target.canvas?.add(cloned);
        transformData.target.canvas?.requestRenderAll();
    });

    return true;
}


//Draws the delete icon at the control’s position, rotating with the object.
function renderIcon(ctx: CanvasRenderingContext2D, left: number, top: number, fabricObject: fabric.Object) {
    const size =  16;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
    ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
    ctx.restore();
}

//Draws the clone icon, rotating with the object.
function renderCloneIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) {
    const size = 16;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
    ctx.drawImage(cloneImg, -size / 2, -size / 2, size, size);
    ctx.restore();
}

const edgeIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='blue'%3E%3Ccircle cx='12' cy='12' r='6'/%3E%3C/svg%3E"; // Simple circle icon for edge controls

const edgeImg = document.createElement('img');
edgeImg.src = edgeIcon;

export const EdgeControl = new fabric.Control({
  x: 0.5,
  y: 0.5,
  offsetY: -10,
  offsetX: 10,
  cursorStyle: 'pointer',
  mouseUpHandler: resizePolygonEdge,
  render: renderEdgeIcon,
});

//Draws the edge icon, rotating with the object.
function renderEdgeIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) {
    const size = 16;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
    ctx.drawImage(edgeImg, -size / 2, -size / 2, size, size);
    ctx.restore();
}
  

//Adjusts the position of two adjacent polygon points based on mouse movement.
function resizePolygonEdge(eventData: MouseEvent, transformData: fabric.Transform, x: number, y: number) {
  const target = transformData.target as fabric.Polygon;
  if (!target || !target.canvas || !target.points) return false;

  const { offsetX, offsetY } = eventData;
  const lastX = transformData.lastX || offsetX;
  const lastY = transformData.lastY || offsetY;
  const deltaX = offsetX - lastX;
  const deltaY = offsetY - lastY;

  transformData.lastX = offsetX;
  transformData.lastY = offsetY;

  
  const edgeIndex = (transformData.control as fabric.Control).edgeIndex;
  if (edgeIndex === undefined) return false;

  const points = target.points;
  const startPoint = points[edgeIndex];
  const endPoint = points[(edgeIndex + 1) % points.length];
  startPoint.x += deltaX / 4;
  startPoint.y += deltaY / 4;
  endPoint.x += deltaX / 4;
  endPoint.y += deltaY / 4;

  target.set({ points: [...points] });
  target.setCoords();
  target.canvas.renderAll();

  const service = (target.canvas as any).canvasEditorService as CanvasEditorService;
  if (service) {
    service.pushState(target.canvas);
  }

  return true;
}

//Dynamically creates edge controls for each side of a polygon.
export function createPolygonEdgeControls(polygon: fabric.Polygon): { [key: string]: fabric.Control } {
  const controls: { [key: string]: fabric.Control } = {};
  if (!polygon.points) return controls;

  polygon.points.forEach((_, index) => {
    const nextIndex = (index + 1) % polygon.points!.length;
    const control = new fabric.Control({
      positionHandler: (dim, finalMatrix, fabricObject) => {
        const points = (fabricObject as fabric.Polygon).points!;
        const p1 = points[index];
        const p2 = points[nextIndex];
          
        // Calculate the midpoint relative to the polygon's coordinate system
        const midX = (p1.x + p2.x) / 2 - (fabricObject as fabric.Polygon).pathOffset.x;
        const midY = (p1.y + p2.y) / 2 - (fabricObject as fabric.Polygon).pathOffset.y;
                  
        const matrix = fabricObject.calcTransformMatrix();
        const transformed = fabric.util.transformPoint(new fabric.Point(midX, midY), matrix);
        return transformed;
      },
      actionName: 'resizePolygonEdge',
      mouseDownHandler: (eventData, transformData) => {
        transformData.lastX = eventData.offsetX;
        transformData.lastY = eventData.offsetY;
        return true;
      },
      actionHandler: resizePolygonEdge,
      render: renderEdgeIcon,
    });
    control.edgeIndex = index;
    controls[`edge${index}`] = control;
  });

  return controls;
}

export function attachServiceToCanvas(canvas: fabric.Canvas, service: CanvasEditorService) {
  (canvas as any).canvasEditorService = service;
}

