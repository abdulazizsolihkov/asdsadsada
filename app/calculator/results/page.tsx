'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateInheritance } from '@/engine/calculator';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { uz } from '@/i18n/uz';
import type { HeirShare } from '@/engine/types';

const COLORS = ['#059669','#10b981','#34d399','#0891b2','#06b6d4','#d97706','#f59e0b','#7c3aed','#8b5cf6','#dc2626','#ef4444','#0284c7','#0ea5e9'];

function PieChart({ shares }: { shares: HeirShare[] }) {
  const active = shares.filter(s => !s.isBlocked && !s.totalFraction.isZero());
  if (!active.length) return null;
  const size = 200; const cx = 100; const cy = 100; const r = 75; const ir = 42;
  let cum = -Math.PI / 2;
  const slices = active.map((s, i) => {
    const pct = s.totalFraction.toDecimal();
    const angle = pct * 2 * Math.PI;
    const start = cum; cum += angle; const end = cum;
    const large = angle > Math.PI ? 1 : 0;
    const d = [`M ${cx + ir * Math.cos(start)} ${cy + ir * Math.sin(start)}`,
               `L ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)}`,
               `A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)}`,
               `L ${cx + ir * Math.cos(end)} ${cy + ir * Math.sin(end)}`,
               `A ${ir} ${ir} 0 ${large} 0 ${cx + ir * Math.cos(start)} ${cy + ir * Math.sin(start)} Z`].join(' ');
    return { d, color: COLORS[i % COLORS.length], share: s };
  });
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((sl, i) => <path key={i} d={sl.d} fill={sl.color} stroke="white" strokeWidth={2.5} />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#64748b">Taqsimot</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#94a3b8">ulushi</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: sl.color }} />
            <span className="text-slate-600 truncate">{uz.heirNames[sl.share.heirType] ?? sl.share.heirType}</span>
            <span className="ml-auto font-semibold text-slate-800 flex-shrink-0">{(sl.share.totalFraction.toDecimal() * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString('uz-UZ'); }

function HeirRow({ share, finalAmount }: { share: HeirShare; finalAmount: number }) {
  const name = uz.heirNames[share.heirType] ?? share.heirType;
  if (share.isBlocked) {
    return (
      <tr className="border-t border-slate-50">
        <td className="py-2.5 px-4 text-sm text-slate-400">{name}</td>
        <td className="py-2.5 px-3 text-center text-sm text-slate-400">{share.count}</td>
        <td className="py-2.5 px-3 text-center"><span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Mahrum</span></td>
        <td className="py-2.5 px-3 text-center text-slate-400 text-sm">—</td>
        <td className="py-2.5 px-4 text-right text-slate-400 text-sm">—</td>
      </tr>
    );
  }
  const pct = (share.totalFraction.toDecimal() * 100).toFixed(2);
  const totalAmt = Math.round(finalAmount * share.totalFraction.toDecimal());
  const perAmt = share.count > 0 ? Math.round(totalAmt / share.count) : 0;
  const methodLabel = uz.methodNames[share.method] ?? share.method;
  return (
    <tr className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="text-sm font-semibold text-slate-800">{name}</div>
        <div className="text-xs text-slate-400">{methodLabel}</div>
      </td>
      <td className="py-3 px-3 text-center text-sm text-slate-600">{share.count}</td>
      <td className="py-3 px-3 text-center">
        <span className="text-sm font-bold text-emerald-700">{share.totalFraction.toString()}</span>
        {share.count > 1 && <div className="text-xs text-slate-400">{share.perPersonFraction.toString()} har biriga</div>}
      </td>
      <td className="py-3 px-3 text-center text-sm font-medium text-slate-700">{pct}%</td>
      <td className="py-3 px-4 text-right">
        <div className="text-sm font-bold text-slate-800">{fmt(totalAmt)}</div>
        {share.count > 1 && <div className="text-xs text-slate-400">{fmt(perAmt)} har biriga</div>}
      </td>
    </tr>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { estate, heirs, reset, setWizardStep } = useCalculatorStore();
  const [showDetails, setShowDetails] = useState(false);
  const result = calculateInheritance(estate, heirs);

  const active = result.shares.filter(s => !s.isBlocked && !s.totalFraction.isZero());
  const blocked = result.shares.filter(s => s.isBlocked);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-slate-900">Natijalar</h1>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          result.method === 'awl' ? 'bg-orange-100 text-orange-700' :
          result.method === 'radd' ? 'bg-blue-100 text-blue-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          {result.method === 'awl' ? 'Awl عول' : result.method === 'radd' ? 'Radd رد' : 'Aniq taqsimot'}
        </span>
      </div>

      {/* Estate summary */}
      <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
        <SectionTitle>Mulk xulosasi</SectionTitle>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Jami mulk</span><span className="font-medium">{fmt(result.grossAmount)}</span></div>
          {result.burialExpenses > 0 && <div className="flex justify-between text-red-600"><span>− Kafanlik/Dafn</span><span>{fmt(result.burialExpenses)}</span></div>}
          {result.debtsTopeople > 0 && <div className="flex justify-between text-red-600"><span>− Qarzlar</span><span>{fmt(result.debtsTopeople)}</span></div>}
          {result.religiousDebts > 0 && <div className="flex justify-between text-red-600"><span>− Diniy qarzlar</span><span>{fmt(result.religiousDebts)}</span></div>}
          {result.bequest > 0 && <div className="flex justify-between text-amber-700"><span>− Vasiyat{result.bequestCapped ? ' (cheklangan)' : ''}</span><span>{fmt(result.bequest)}</span></div>}
          <div className="flex justify-between border-t-2 border-emerald-400 pt-2 mt-2">
            <span className="font-bold text-emerald-700 text-base">Taqsimlash uchun</span>
            <span className="font-bold text-emerald-700 text-base">{fmt(result.finalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Pie chart */}
      {active.length > 0 && (
        <Card>
          <SectionTitle>Taqsimot diagrammasi</SectionTitle>
          <PieChart shares={active} />
        </Card>
      )}

      {/* Distribution table */}
      <Card padding="none">
        <div className="px-4 pt-4 pb-2">
          <SectionTitle className="mb-0">Merosxo'rlar taqsimoti</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="py-2 px-4 text-left font-semibold">Merosxo'r</th>
                <th className="py-2 px-3 text-center font-semibold">Son</th>
                <th className="py-2 px-3 text-center font-semibold">Ulush</th>
                <th className="py-2 px-3 text-center font-semibold">%</th>
                <th className="py-2 px-4 text-right font-semibold">Miqdor</th>
              </tr>
            </thead>
            <tbody>
              {active.map(s => <HeirRow key={s.heirType} share={s} finalAmount={result.finalAmount} />)}
              {blocked.map(s => <HeirRow key={s.heirType} share={s} finalAmount={result.finalAmount} />)}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Method note */}
      {result.method !== 'exact' && (
        <Card className="bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>{result.method === 'awl' ? 'Awl (عول):' : 'Radd (رد):'}</strong>{' '}
            {result.method === 'awl'
              ? 'Ulushlar yig\'indisi 1 dan oshdi — proporsional kamaytirish qo\'llanildi.'
              : result.raddNotes}
          </p>
        </Card>
      )}

      {/* Calculation details */}
      <Card>
        <button type="button" onClick={() => setShowDetails(!showDetails)}
          className="w-full flex justify-between items-center text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors">
          <span>Hisoblash tafsilotlari</span>
          <span className="text-slate-400">{showDetails ? '▲' : '▼'}</span>
        </button>
        {showDetails && (
          <div className="mt-4 space-y-2">
            {result.shares.map(s => (
              <div key={s.heirType} className="text-xs bg-slate-50 rounded-xl px-3 py-2.5">
                <span className="font-semibold text-slate-700">{uz.heirNames[s.heirType] ?? s.heirType}:</span>{' '}
                <span className="text-slate-500">{s.ruleApplied || s.blockReason}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3 no-print">
        <Button variant="secondary" size="lg" className="flex-1"
          onClick={() => { setWizardStep(0); router.push('/calculator/heirs'); }}>
          ← Merosxo'rlar
        </Button>
        <Button variant="ghost" size="lg"
          onClick={() => window.print()}
          className="px-4">
          🖨
        </Button>
      </div>
      <Button variant="ghost" fullWidth
        onClick={() => { reset(); router.push('/calculator/estate'); }}>
        Yangi hisoblash
      </Button>
    </div>
  );
}
