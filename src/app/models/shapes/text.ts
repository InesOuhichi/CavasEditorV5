import { fabric } from 'fabric';
import { BaseShape } from './base-shape';

export class Text extends BaseShape {
  private textProps: any;

  constructor(canvas: fabric.Canvas, x: number, y: number, textProps: any) {
    super(canvas, x, y);
    this.textProps = textProps;
    this.createShape(x, y);
  }

  createShape(x: number, y: number): void {
    this.shape = new fabric.IText('Enter Text', {
      left: x,
      top: y,
      fontSize: this.textProps.fontSize || 20,
      fill: this.textProps.fillColor || 'black',
      stroke: '#000000',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      fontFamily: this.textProps.fontFamily || 'Arial',
      fontWeight: this.textProps.fontWeight || 'normal',
      underline: this.textProps.underline || false,
      overline: this.textProps.overline || false,
      linethrough: this.textProps.linethrough || false,
      textAlign: this.textProps.textAlign || 'left',
      data: { modelId: this.id, type: 'i-text' },
    });
  }

  updateShape(x: number, y: number): void {
    // No dynamic resizing during drawing
  }

  updateFromProperties(properties: any): void {
    const text = this.shape as fabric.IText;
    text.set({
      left: properties.objectLeft ?? text.left,
      top: properties.objectTop ?? text.top,
      scaleX: properties.objectScaleX ?? text.scaleX,
      scaleY: properties.objectScaleY ?? text.scaleY,
      angle: properties.objectAngle ?? text.angle,
      text: properties.text ?? text.text,
      fontFamily: properties.fontFamily ?? text.fontFamily,
      fontSize: properties.fontSize ?? text.fontSize,
      fontWeight: properties.fontWeight ?? text.fontWeight,
      fontStyle: properties.fontStyle ?? text.fontStyle,
      underline: properties.underline ?? text.underline,
      overline: properties.overline ?? text.overline,
      linethrough: properties.linethrough ?? text.linethrough,
      textAlign: properties.textAlign ?? text.textAlign,
      fill: properties.fillColor ?? text.fill,
      stroke: properties.strokeColor ?? text.stroke,
    });
    this.applyTextTransform(text, properties.textTransform);
    text.setCoords();
    this.canvas.requestRenderAll();
  }

  private applyTextTransform(obj: fabric.IText, textTransform: string): void {
    if (textTransform === 'uppercase') {
      obj.set('text', obj.text?.toUpperCase());
    } else if (textTransform === 'lowercase') {
      obj.set('text', obj.text?.toLowerCase());
    } else if (textTransform === 'capitalize') {
      obj.set('text', obj.text?.replace(/\b\w/g, (l) => l.toUpperCase()));
    }
  }
}