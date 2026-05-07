import { cn } from '@/lib/cn';
import { scoreColor, scoreLabel } from '@/lib/scoring';

export function ScoreBadge({
  score,
  size = 'md',
  showLabel = false,
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const sizing = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold',
        scoreColor(score),
        sizing,
      )}
    >
      <span>{score}</span>
      {showLabel && <span className="font-normal opacity-80">· {scoreLabel(score)}</span>}
    </span>
  );
}

export function ScoreRing({
  score,
  size = 96,
  stroke = 8,
  label = 'VQI',
}: {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 80
      ? '#34d399'
      : score >= 60
        ? '#6b8eff'
        : score >= 40
          ? '#fbbf24'
          : '#f87171';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease', filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold text-ink-900">{score}</div>
        <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      </div>
    </div>
  );
}
