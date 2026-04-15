'use client';
import type { HeirShare } from '@/engine/types';
import { uz } from '@/i18n/uz';

const COLORS = [
  '#059669', '#10b981', '#34d399', '#6ee7b7',
  '#0891b2', '#06b6d4', '#22d3ee',
  '#d97706', '#f59e0b', '#fbbf24',
  '#7c3aed', '#8b5cf6', '#a78bfa',
  '#dc2626', '#ef4444', '#f87171',
];

interface Props {
  shares: HeirShare[];
}

export function PieChart({ shares }: Props) {
  const active = shares.filter(s => !s.isBlocked && !s.totalFraction.isZero());
  if (active.length === 0) return null;

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const innerR = 45;

  let cumAngle = -Math.PI / 2;
  const slices = active.map((s, i) => {
    const pct = s.totalFraction.toDecimal();
    const angle = pct * 2 * Math.PI;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;

    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const xi1 = cx + innerR * Math.cos(start);
    const yi1 = cy + innerR * Math.sin(start);
    const xi2 = cx + innerR * Math.cos(end);
    const yi2 = cy + innerR * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${xi1} ${yi1}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ');

    return { d, color: COLORS[i % COLORS.length], share: s };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((sl, i) => (
          <path key={i} d={sl.d} fill={sl.color} stroke="white" strokeWidth={2} />
        ))}
        <text x={cx} y={cy - 5} textAnchor="middle" className="text-xs" fontSize={11} fill="#374151">Meros</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="text-xs" fontSize={11} fill="#374151">ulushi</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs w-full max-w-xs">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: sl.color }} />
            <span className="text-gray-600 truncate">
              {uz.heirNames[sl.share.heirType] ?? sl.share.heirType}
            </span>
            <span className="ml-auto font-medium text-gray-800">
              {(sl.share.totalFraction.toDecimal() * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
