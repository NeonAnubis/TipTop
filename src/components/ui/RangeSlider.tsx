'use client';

/**
 * Two-slider range control. Renders min and max sliders stacked.
 * Reliable across browsers and accessible.
 */
export function RangeSlider({
  min = 0,
  max = 100,
  step = 5,
  value,
  onChange,
}: {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  return (
    <div className="space-y-2">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
          <span>Min</span>
          <span className="font-semibold text-ink-700">{lo}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), hi);
            onChange([v, hi]);
          }}
          className="w-full accent-brand-600"
          aria-label="Minimum score"
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
          <span>Max</span>
          <span className="font-semibold text-ink-700">{hi}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), lo);
            onChange([lo, v]);
          }}
          className="w-full accent-brand-600"
          aria-label="Maximum score"
        />
      </div>
    </div>
  );
}
