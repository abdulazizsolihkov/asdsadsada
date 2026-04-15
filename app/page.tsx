'use client';
import { useCalculatorStore } from '@/store/calculatorStore';
import { PhaseHeader } from '@/components/ui/PhaseHeader';
import { PhaseOne } from '@/components/PhaseOne/PhaseOne';
import { PhaseTwo } from '@/components/PhaseTwo/PhaseTwo';
import { PhaseThree } from '@/components/PhaseThree/PhaseThree';

export default function Home() {
  const { phase, setPhase, result } = useCalculatorStore();

  function canNavigateTo(p: 1 | 2 | 3): boolean {
    if (p === 1) return true;
    if (p === 2) return phase >= 2;
    if (p === 3) return phase >= 3 && result !== null;
    return false;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm print:hidden">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">م</div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Meros Kalkulyatori</h1>
            <p className="text-xs text-gray-500">Islomiy Meros Taqsimoti</p>
          </div>
        </div>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block px-6 py-4 border-b">
        <h1 className="text-xl font-bold">Meros Kalkulyatori — Islomiy Meros Taqsimoti</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <PhaseHeader
          current={phase}
          onPhaseClick={setPhase}
          canNavigateTo={canNavigateTo}
        />

        {phase === 1 && <PhaseOne />}
        {phase === 2 && <PhaseTwo />}
        {phase === 3 && <PhaseThree />}
      </div>
    </main>
  );
}
