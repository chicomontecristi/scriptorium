// ─── TINTAXIS SIGIL — THE BRASS MARK ──────────────────────────────────────
// Mechanical eye within a gear ring.
// Used as wordmark companion and standalone favicon.

interface TintaxisLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function TintaxisLogo({
  size = 32,
  className = "",
}: TintaxisLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Tintaxis"
      role="img"
    >
      {/* ── Gear ring (12 teeth at 30° intervals) ── */}
      <g fill="#C9A84C" stroke="none">
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
          <rect
            key={deg}
            x={48} y={2}
            width={4} height={7}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </g>

      {/* ── Outer ring ── */}
      <circle cx="50" cy="50" r="41" stroke="#C9A84C" strokeWidth="1.2"/>

      {/* ── Mid dashed ring ── */}
      <circle cx="50" cy="50" r="33" stroke="#C9A84C" strokeWidth="0.6"
              strokeDasharray="2.5 3" opacity="0.55"/>

      {/* ── Cardinal ticks ── */}
      <line x1="50" y1="9"  x2="50" y2="13" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="50" y1="87" x2="50" y2="91" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="9"  y1="50" x2="13" y2="50" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="87" y1="50" x2="91" y2="50" stroke="#C9A84C" strokeWidth="1.5"/>

      {/* ── Eye / lens ── */}
      <path d="M 18 50 Q 50 22 82 50 Q 50 78 18 50 Z"
            stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>

      {/* ── Iris ring ── */}
      <circle cx="50" cy="50" r="11" stroke="#C9A84C" strokeWidth="1.4"/>

      {/* ── Inner iris detail ── */}
      <circle cx="50" cy="50" r="7.5" stroke="#C9A84C" strokeWidth="0.5"
              strokeDasharray="1.5 2" opacity="0.5"/>

      {/* ── Pupil ── */}
      <circle cx="50" cy="50" r="3.5" fill="#C9A84C"/>

      {/* ── Axis lines ── */}
      <line x1="50" y1="22" x2="50" y2="39"
            stroke="#C9A84C" strokeWidth="0.7" opacity="0.45"/>
      <line x1="50" y1="61" x2="50" y2="78"
            stroke="#C9A84C" strokeWidth="0.7" opacity="0.45"/>

      {/* ── Corner dots ── */}
      <circle cx="79" cy="21" r="1.2" fill="#C9A84C" opacity="0.5"/>
      <circle cx="21" cy="21" r="1.2" fill="#C9A84C" opacity="0.5"/>
      <circle cx="79" cy="79" r="1.2" fill="#C9A84C" opacity="0.5"/>
      <circle cx="21" cy="79" r="1.2" fill="#C9A84C" opacity="0.5"/>
    </svg>
  );
}
