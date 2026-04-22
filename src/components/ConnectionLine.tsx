import { Note } from '../types';

interface ConnectionLineProps {
  key?: string;
  from: Note;
  to: Note;
  scale: number;
}

export function ConnectionLine({ from, to, scale }: ConnectionLineProps) {
  // Center coordinates of nodes (roughly)
  const x1 = from.x + 100;
  const y1 = from.y + 50;
  const x2 = to.x + 100;
  const y2 = to.y + 50;

  // Bezier curve control points
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  const controlPointOffset = Math.min(dx, dy, 150);

  const path = `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;

  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full" style={{ zIndex: 0 }}>
      <path
        d={path}
        fill="none"
        stroke="#E4E4E7"
        strokeWidth={2 / scale}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
      <circle cx={x1} cy={y1} r={3 / scale} fill="#D4D4D8" />
      <circle cx={x2} cy={y2} r={3 / scale} fill="#D4D4D8" />
    </svg>
  );
}
