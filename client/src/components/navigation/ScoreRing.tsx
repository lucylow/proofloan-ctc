import { useId } from "react";

type ScoreRingProps = {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  caption?: string;
};

export function ScoreRing({
  value,
  max = 850,
  size = 148,
  stroke = 11,
  label = "Credit score",
  caption,
}: ScoreRingProps) {
  const gradientId = useId();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const offset = circumference * (1 - ratio);
  const display = Number.isFinite(value) && value > 0 ? Math.round(value) : "—";

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${display} of ${max}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#a5f3fc" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="pl-score-arc"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="pl-num text-[1.65rem] font-extrabold tracking-tight text-white sm:text-3xl">
            {display}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </div>
          {caption && (
            <div className="mt-1 text-[11px] font-medium text-cyan-200">
              {caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
