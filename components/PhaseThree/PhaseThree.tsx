'use client';
import { useEffect, useState } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { calculateInheritance } from '@/engine/calculator';
import { Card, SectionTitle } from '@/components/ui/Card';
import { PieChart } from './PieChart';
import { uz } from '@/i18n/uz';
import type { HeirShare } from '@/engine/types';

function fmt(n: number) { return n.toLocaleString('uz-UZ'); }

function ShareRow({ share, finalAmount }: { share: HeirShare; finalAmount: number }) {
  const name = uz.heirNames[share.heirType] ?? share.heirType;
  const methodLabel = uz.methodNames[share.method] ?? share.method;

  if (share.isBlocked) {
    return (
      <tr className="opacity-50">
        <td className="py-2 px-3 text-sm text-gray-500">{name}</td>
        <td className="py-2 px-3 text-center text-sm">{share.count}</td>
        <td className="py-2 px-3 text-center text-sm text-red-500 font-medium">Mahrum</td>
        <td className="py-2 px-3 text-center text-sm">—</td>
        <td className="py-2 px-3 text-right text-sm">—</td>
      </tr>
    );
  }

  const pct = (share.totalFraction.toDecimal() * 100).toFixed(2);
  const totalAmt = Math.round(finalAmount * share.totalFraction.toDecimal());
  const perAmt = share.count > 0 ? Math.round(totalAmt / share.count) : 0;

  return (
    <tr className="border-t border-gray-100 hover:bg-emerald-50 transition-colors">
      <td className="py-2.5 px-3">
        <div className="text-sm font-medium text-gray-800">{name}</div>
        <div className="text-xs text-gray-400">{methodLabel}</div>
      </td>
      <td className="py-2.5 px-3 text-center text-sm">{share.count}</td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-sm font-semibold text-emerald-700">{share.totalFraction.toString()}</span>
        {share.count > 1 && (
          <div className="text-xs text-gray-400">{share.perPersonFraction.toString()} har biriga</div>
        )}
      </td>
      <td className="py-2.5 px-3 text-center text-sm">{pct}%</td>
      <td className="py-2.5 px-3 text-right">
        <div className="text-sm font-semibold">{fmt(totalAmt)}</div>
        {share.count > 1 && <div className="text-xs text-gray-400">{fmt(perAmt)} har biriga</div>}
      </td>
    </tr>
  );
}

export function PhaseThree() {
  const { estate, heirs, result, setResult, setPhase, reset, setWizardStep } = useCalculatorStore();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const r = calculateInheritance(estate, heirs);
    setResult(r);
  }, [estate, heirs, setResult]);

  if (!result) return <div className="text-center py-10 text-gray-500">Hisoblanmoqda...</div>;

  const activeShares = result.shares.filter(s => !s.isBlocked && !s.totalFraction.isZero());
  const blockedShares = result.shares.filter(s => s.isBlocked);

  function handlePrint() { window.print(); }

  return (
    <div className="space-y-5 print:space-y-4">
      {/* Method badge */}
      <div className="flex justify-center">
        {result.method === 'awl' && (
          <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">
            Awl (عول) qo'llanildi
          </span>
        )}
        {result.method === 'radd' && (
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
            Radd (رد) qo'llanildi
          </span>
        )}
        {result.method === 'exact' && (
          <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium">
            Aniq taqsimot
          </span>
        )}
      </div>

      {/* Estate summary */}
      <Card>
        <SectionTitle>Mulk Xulosasi</SectionTitle>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Jami mulk</span><span className="font-medium">{fmt(result.grossAmount)}</span></div>
          {result.burialExpenses > 0 && <div className="flex justify-between text-red-600"><span>− Kafanlik/Dafn</span><span>{fmt(result.burialExpenses)}</span></div>}
          {result.debtsTopeople > 0 && <div className="flex justify-between text-red-600"><span>− Qarzlar</span><span>{fmt(result.debtsTopeople)}</span></div>}
          {result.religiousDebts > 0 && <div className="flex justify-between text-red-600"><span>− Diniy qarzlar</span><span>{fmt(result.religiousDebts)}</span></div>}
          <div className="flex justify-between border-t pt-1.5"><span className="font-medium">Sof miqdor</span><span className="font-semibold">{fmt(result.netAmount)}</span></div>
          {result.bequest > 0 && <div className="flex justify-between text-amber-700"><span>− Vasiyat{result.bequestCapped && ' (cheklangan)'}</span><span>{fmt(result.bequest)}</span></div>}
          <div className="flex justify-between border-t-2 border-emerald-400 pt-2 text-emerald-700 font-bold text-base">
            <span>Taqsimlash uchun</span><span>{fmt(result.finalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Pie chart */}
      {activeShares.length > 0 && (
        <Card>
          <SectionTitle>Taqsimot Diagrammasi</SectionTitle>
          <PieChart shares={activeShares} />
        </Card>
      )}

      {/* Distribution table */}
      <Card className="overflow-hidden p-0">
        <div className="px-5 pt-5 pb-3">
          <SectionTitle>Merosxo'rlar Taqsimoti</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="py-2 px-3 text-left">Merosxo'r</th>
                <th className="py-2 px-3 text-center">Son</th>
                <th className="py-2 px-3 text-center">Ulush (Kasr)</th>
                <th className="py-2 px-3 text-center">Foiz</th>
                <th className="py-2 px-3 text-right">Miqdor</th>
              </tr>
            </thead>
            <tbody>
              {activeShares.map((s) => (
                <ShareRow key={s.heirType} share={s} finalAmount={result.finalAmount} />
              ))}
              {blockedShares.length > 0 && blockedShares.map((s) => (
                <ShareRow key={s.heirType} share={s} finalAmount={result.finalAmount} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Method notes */}
      {(result.method === 'awl' || result.method === 'radd') && (
        <Card>
          <div className="text-sm text-gray-600">
            {result.method === 'awl' && (
              <p><strong>Awl (عول):</strong> Ulushlar yig'indisi 1 dan oshib ketdi. Har bir merosxo'rning ulushi proporsional ravishda kamaytirildi (asl surtma kasr saqlanib, maxraj yig'indisi sifatida yangilandi).</p>
            )}
            {result.method === 'radd' && (
              <p><strong>Radd (رد):</strong> {result.raddNotes}</p>
            )}
          </div>
        </Card>
      )}

      {/* Calculation details (expandable) */}
      <Card>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex justify-between items-center text-sm font-semibold text-gray-700"
        >
          <span>Hisoblash Tafsilotlari</span>
          <span>{showDetails ? '▲' : '▼'}</span>
        </button>
        {showDetails && (
          <div className="mt-4 space-y-2">
            {result.shares.map(s => (
              <div key={s.heirType} className="text-xs bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-medium text-gray-700">{uz.heirNames[s.heirType] ?? s.heirType}:</span>{' '}
                <span className="text-gray-500">{s.ruleApplied || s.blockReason}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3 print:hidden">
        <button
          type="button"
          onClick={() => { setPhase(2); setWizardStep(0); }}
          className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold hover:border-gray-400 transition-colors text-sm"
        >
          ← Merosxo'rlarni o'zgartirish
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="py-3 px-4 rounded-xl bg-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Chop etish
        </button>
      </div>
      <button
        type="button"
        onClick={reset}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors print:hidden"
      >
        Boshidan boshlash
      </button>
    </div>
  );
}
