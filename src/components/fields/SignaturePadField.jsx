import { useEffect, useRef, useState } from 'react';

function SignaturePadField({ value, onChange, disabled, penColor = '#0d6efd' }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = penColor;
    if (!value) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const image = new Image();
    image.src = value;
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [penColor, value]);

  const getPosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (event) => {
    if (disabled) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    const { x, y } = getPosition(event);
    context.beginPath();
    context.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (event) => {
    if (!drawing || disabled) {
      return;
    }
    const context = canvasRef.current.getContext('2d');
    const { x, y } = getPosition(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!drawing || disabled) {
      return;
    }
    setDrawing(false);
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="border rounded-3 p-2 bg-white">
      <canvas
        ref={canvasRef}
        className="w-100 border rounded bg-light"
        height="180"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        onTouchStart={startDrawing}
        width="600"
      />
      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={clearSignature} type="button">Clear</button>
        {value && (
          <a className="btn btn-sm btn-outline-primary" download="signature.png" href={value}>
            Save PNG
          </a>
        )}
      </div>
    </div>
  );
}

export default SignaturePadField;
