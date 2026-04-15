'use client';

interface PhaseHeaderProps {
  current: 1 | 2 | 3;
  onPhaseClick?: (phase: 1 | 2 | 3) => void;
  canNavigateTo?: (phase: 1 | 2 | 3) => boolean;
}

const PHASES = [
  { num: 1 as const, label: "Mulk" },
  { num: 2 as const, label: "Merosxo'rlar" },
  { num: 3 as const, label: "Natijalar" },
];

export function PhaseHeader({ current, onPhaseClick, canNavigateTo }: PhaseHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {PHASES.map((phase, idx) => {
        const done = phase.num < current;
        const active = phase.num === current;
        const clickable = canNavigateTo?.(phase.num) ?? false;
        return (
          <div key={phase.num} className="flex items-center">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onPhaseClick?.(phase.num)}
              className={`flex flex-col items-center gap-1 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  active
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : done
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {done ? '✓' : phase.num}
              </div>
              <span
                className={`text-xs font-medium ${
                  active ? 'text-emerald-700' : done ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                {phase.label}
              </span>
            </button>
            {idx < PHASES.length - 1 && (
              <div className={`w-16 h-0.5 mx-1 mb-5 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
