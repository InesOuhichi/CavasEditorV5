import { decompressFrames, Frame, ParsedFrame, parseGIF } from "gifuct-js";


export const gifToSprite = 
async (gif: string | File,
     maxWidth?: number, 
     maxHeight?: number, 
     maxDuration?: number) => {
    let arrayBuffer: ArrayBuffer | null = null;
    let error: any = null;
    let frames: any[] = [];
    // If the gif is an input File, get the arrayBuffer with FileReader
    if (typeof gif !== 'string' && gif instanceof File) {
      const reader = new FileReader();
      try {
        arrayBuffer = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(gif as File);
        });
      } catch (err) {
        error = (err as Error).message || 'FileReader_error';
      }
    } else {
      // Else the gif is a URL or a dataUrl, fetch the arrayBuffer
      try {
        arrayBuffer = await fetch(gif as string).then((resp) => resp.arrayBuffer());
      } catch (err) {
        error = (err as Error).message || 'Fetch_error';
      }
    }
  
    // Parse and decompress the gif arrayBuffer to frames
    if (!error) {
      frames = decompressFrames(parseGIF(arrayBuffer!), true);
    }
    if (!error && (!frames || !frames.length)) {
      error = 'No_frame_error';
    }
    if (error) {
      console.error(error);
      return { error };
    }
  
    // Create the needed canvases
    const dataCanvas = document.createElement('canvas');
    const dataCtx = dataCanvas.getContext('2d')!;
    const frameCanvas = document.createElement('canvas');
    const frameCtx = frameCanvas.getContext('2d')!;
    const spriteCanvas = document.createElement('canvas');
    const spriteCtx = spriteCanvas.getContext('2d')!;
  
    // Get the frames dimensions and delay
    let [width, height, delay] = [
      frames![0].dims.width,
      frames![0].dims.height,
      frames!.reduce((acc, cur) => (!acc ? cur.delay : acc), null as number | null)!,
    ];
  
    // Set the max duration of the gif if any
    const duration = frames!.length * delay;
    maxDuration = maxDuration || duration;
    if (duration > maxDuration) {
      frames!.splice(Math.ceil(maxDuration / delay));
    }
  
  
    // Set the frame and sprite canvases dimensions
    frameCanvas.width = width;
    frameCanvas.height = height;
    spriteCanvas.width = width * frames!.length;
    spriteCanvas.height = height;
  
    frames!.forEach((frame, i) => {
      // Get the frame imageData from the "frame.patch"
      const frameImageData = dataCtx.createImageData(frame.dims.width, frame.dims.height);
      frameImageData.data.set(frame.patch);
      dataCanvas.width = frame.dims.width;
      dataCanvas.height = frame.dims.height;
      dataCtx.putImageData(frameImageData, 0, 0);

  
      // Draw a frame from the imageData
      if (frame.disposalType === 2) {
        frameCtx.clearRect(0, 0, width, height);
      }
      frameCtx.drawImage(
        dataCanvas,
        0, 0,   
        frame.dims.width, frame.dims.height,  
        0, 0,   
        width, height
      );
  
      // Add the frame to the sprite sheet
      spriteCtx.drawImage(frameCanvas, width * i, 0);
    });
    console.log(`frameCanvas: width=${frameCanvas.width}, height=${frameCanvas.height}`);
    console.log(`spriteCanvas: width=${spriteCanvas.width}, height=${spriteCanvas.height}`);
    // Get the sprite sheet dataUrl
    const dataUrl = spriteCanvas.toDataURL();
  
    // Clean the DOM
    dataCanvas.remove();
    frameCanvas.remove();
    spriteCanvas.remove();
  
    return {
      dataUrl,
      frameWidth: width,
      framesLength: frames!.length,
      delay,
      frameHeight: height,
      
    };
  };