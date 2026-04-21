import { useMemo } from 'react';
import './ArchitecturalLines.css';

const COLORS = {
  background: '#1A1A1A',
  gold: '#D4AF37',
  cream: '#F5F5DC',
};

function generateLines(seed) {
  const lines = [];
  const rects = [];
  
  const hz = seed * 7;
  const vt = seed * 11;
  
  for (let i = 0; i < 6; i++) {
    const y = ((hz + i * 17 + seed * 23) % 100);
    lines.push({
      x1: 0,
      y1: `${y}%`,
      x2: '100%',
      y2: `${y}%`,
      opacity: 0.2 + (seed * 0.3) % 0.3,
      strokeWidth: 1 + (i % 2),
    });
  }
  
  for (let i = 0; i < 5; i++) {
    const x = ((vt + i * 19 + seed * 13) % 100);
    lines.push({
      x1: `${x}%`,
      y1: 0,
      x2: `${x}%`,
      y2: '100%',
      opacity: 0.15 + (seed * 0.25) % 0.25,
      strokeWidth: 1 + (i % 2),
    });
  }
  
  const focusX = 20 + (seed * 30) % 30;
  const focusY = 10 + (seed * 20) % 20;
  const focusW = 35 + (seed * 25) % 20;
  const focusH = 60 + (seed * 20) % 25;
  
  rects.push({
    x: `${focusX}%`,
    y: `${focusY}%`,
    width: `${focusW}%`,
    height: `${focusH}%`,
    fillOpacity: 0.08,
    strokeOpacity: 0.3,
  });
  
  for (let i = 0; i < 3; i++) {
    const rx = ((seed * 31 + i * 37) % 70);
    const ry = ((seed * 41 + i * 29) % 60);
    const rw = 15 + ((seed * 17 + i * 23) % 25);
    const rh = 10 + ((seed * 19 + i * 31) % 20);
    rects.push({
      x: `${rx}%`,
      y: `${ry}%`,
      width: `${rw}%`,
      height: `${rh}%`,
      fillOpacity: 0.04 + (seed * 0.02),
      strokeOpacity: 0.1 + (seed * 0.1),
    });
  }
  
  return { lines, rects };
}

export default function ArchitecturalLines({ seed = 0.5, children }) {
  const { lines, rects } = useMemo(() => generateLines(seed), [seed]);
  
  return (
    <div className="architectural-lines-container">
      <svg 
        className="architectural-lines-bg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <rect width="100" height="100" fill={COLORS.background} />
        
        <defs>
          <radialGradient id="creamGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.cream} stopOpacity="0.08" />
            <stop offset="100%" stopColor={COLORS.cream} stopOpacity="0" />
          </radialGradient>
          <filter id="founderGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <rect width="100" height="100" fill="url(#creamGlow)" />
        
        {lines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={COLORS.gold}
            strokeWidth={line.strokeWidth * 0.1}
            opacity={line.opacity}
          />
        ))}
        
        {rects.map((rect, i) => (
          <rect
            key={`rect-${i}`}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill={COLORS.gold}
            fillOpacity={rect.fillOpacity}
            stroke={COLORS.gold}
            strokeWidth="0.2"
            opacity={rect.strokeOpacity}
          />
        ))}
      </svg>
      
      <div className="architectural-lines-content">
        {children}
      </div>
    </div>
  );
}
