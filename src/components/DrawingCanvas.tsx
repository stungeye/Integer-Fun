import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export interface DrawingCanvasRef {
  clearCanvas: () => void;
}

interface Position {
  x: number;
  y: number;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<Position | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [width, height]);

  const getPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const position = getPosition(e);
    setIsDrawing(true);
    setLastPosition(position);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosition) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const currentPosition = getPosition(e);

      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      setLastPosition(currentPosition);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useImperativeHandle(ref, () => ({
    clearCanvas
  }));

  useEffect(() => {
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('touchend', stopDrawing);
    return () => {
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('touchend', stopDrawing);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
    />
  );
});

export default DrawingCanvas;
