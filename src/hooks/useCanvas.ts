import { useState, useCallback, useRef, useEffect, MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';

export function useCanvas() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const startPan = useCallback((e: ReactMouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      e.preventDefault();
    }
  }, []);

  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  const onPan = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    setOffset(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  }, [isPanning]);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', onPan);
      window.addEventListener('mouseup', endPan);
    }
    return () => {
      window.removeEventListener('mousemove', onPan);
      window.removeEventListener('mouseup', endPan);
    };
  }, [isPanning, onPan, endPan]);

  const onWheel = useCallback((e: ReactWheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY;
      const zoomSpeed = 0.001;
      const newScale = Math.min(Math.max(scale - delta * zoomSpeed, 0.1), 5);
      setScale(newScale);
      e.preventDefault();
    } else {
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [scale]);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  return { scale, setScale, offset, setOffset, startPan, canvasRef, onWheel, resetView };
}
