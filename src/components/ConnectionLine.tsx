import { Note } from '../types';

interface ConnectionLineProps {
  from: Note;
  to: Note;
  scale: number;
  fromPoint?: 'top' | 'bottom' | 'left' | 'right';
  toPoint?: 'top' | 'bottom' | 'left' | 'right';
}

export function ConnectionLine({ from, to, scale, fromPoint = 'right', toPoint = 'left' }: ConnectionLineProps) {
  const getPoint = (note: Note, point: string) => {
    const width = note.isExpanded ? 400 : 220;
    const height = note.isExpanded ? 300 : 120; // Approximation of average height
    
    switch (point) {
      case 'top': return { x: note.x + width / 2, y: note.y };
      case 'bottom': return { x: note.x + width / 2, y: note.y + height };
      case 'left': return { x: note.x, y: note.y + height / 2 };
      case 'right': return { x: note.x + width, y: note.y + height / 2 };
      default: return { x: note.x + width / 2, y: note.y + height / 2 };
    }
  };

  const p1 = getPoint(from, fromPoint);
  const p2 = getPoint(to, toPoint);

  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  const controlPointOffset = Math.min(dx, dy, 100);

  const path = `M ${p1.x} ${p1.y} C ${p1.x + (fromPoint === 'right' ? controlPointOffset : fromPoint === 'left' ? -controlPointOffset : 0)} ${p1.y + (fromPoint === 'bottom' ? controlPointOffset : fromPoint === 'top' ? -controlPointOffset : 0)}, ${p2.x + (toPoint === 'right' ? controlPointOffset : toPoint === 'left' ? -controlPointOffset : 0)} ${p2.y + (toPoint === 'bottom' ? controlPointOffset : toPoint === 'top' ? -controlPointOffset : 0)}, ${p2.x} ${p2.y}`;

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full" style={{ zIndex: 0 }}>
      {/* Glow path */}
      <path
        d={path}
        fill="none"
        stroke="#A1A1AA"
        strokeWidth={4 / scale}
        strokeLinecap="round"
        className="opacity-10"
      />
      {/* Main path */}
      <path
        d={path}
        fill="none"
        stroke="#71717A"
        strokeWidth={1.5 / scale}
        strokeLinecap="round"
      />
      <circle cx={p1.x} cy={p1.y} r={2.5 / scale} fill="#71717A" />
      <circle cx={p2.x} cy={p2.y} r={2.5 / scale} fill="#71717A" />
    </svg>
  );
}
