import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  width?: number;
  height?: number;
  onChange?: (dataUrl: string | null) => void;
  disabled?: boolean;
  initialImage?: string | null;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  width = 300,
  height = 100,
  onChange,
  disabled = false,
  initialImage = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const devicePixelRatioRef = useRef<number>(1);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Ensure crisp rendering on high-DPI displays and keep a cached context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    devicePixelRatioRef.current = dpr;

    // Size the canvas drawing buffer to device pixels, while keeping CSS size as given width/height
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scaling
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#222';
    contextRef.current = ctx;

    // If there is an initial image, redraw it after resizing
    if (initialImage) {
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        setHasDrawn(true); // Treat loaded image as drawable content so Clear is enabled
      };
      img.src = initialImage;
    }
  }, [width, height, initialImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.beginPath();
    const { x, y } = getPointerPosition(e, canvas);
    ctx.moveTo(x, y);
    // Draw a minimal dot to register taps without movement
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    const { x, y } = getPointerPosition(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!drawing) return;
    setDrawing(false);
    if (canvasRef.current && onChange) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    setHasDrawn(false);
    if (onChange) onChange(null);
  };

  const getPointerPosition = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    let clientX = 0, clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc', borderRadius: 8, background: '#fff', touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        onTouchCancel={endDrawing}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          disabled={disabled || !hasDrawn}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SignaturePad; 