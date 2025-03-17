import { fabric } from 'fabric';
import { gifToSprite } from "./gifToSprite";


declare module 'fabric' {
    namespace fabric {
      interface Image {
        mode?: string;
        play?: () => void;
        pause?: () => void;
        stop?: () => void;
        getStatus?: () => string;
        dirty?: boolean;
        frameWidth?: number;
        framesLength?:number;
        delay?: number;
        originalWidth?: number;
        originalHeight?: number;
      }
    }
  }
  
const [PLAY, PAUSE, STOP] = [0, 1, 2];


export const fabricGif = async (gif: string | File, maxWidth?: number, maxHeight?: number, maxDuration?: number)=> {
    const { error, dataUrl, delay, frameWidth,frameHeight, framesLength} = await gifToSprite(
        gif,
        maxWidth,
        maxHeight,
        maxDuration
    );
    console.log('fabricGif')
    if (error) return { error };

    return new Promise<fabric.Image>((resolve) => {
        fabric.Image.fromURL(dataUrl as string, (img) => {
      const sprite = img.getElement() as HTMLImageElement;
      let framesIndex = 0;
      let start = performance.now();
      let status: number;

      img.width = frameWidth;
      img.height = frameHeight;
      img.mode = "image";
      img.top = 200;
      img.left = 200;

      img._render = function (ctx) {
        if (status === PAUSE || (status === STOP && framesIndex === 0)) return;
        const now = performance.now();
        const delta = now - start;
        if (delta > delay) {
          start = now;
          framesIndex++;
        }
        if (framesIndex === framesLength || status === STOP) framesIndex = 0;
        ctx.drawImage(
          sprite,
          frameWidth * framesIndex,
          0,
          frameWidth,
          frameHeight,
          -frameWidth/2,
          -frameHeight/2,
          frameWidth,
          frameHeight
        );
      };
      img.play = function () {
        status = PLAY;
        this.dirty = true;
      };
      img.pause = function () {
        status = PAUSE;
        this.dirty = false;
      };
      img.stop = function () {
        status = STOP;
        this.dirty = false;
      };
      img.getStatus = () => ["Playing", "Paused", "Stopped"][status];

      img.play();
      resolve(img);
    });
    });
};