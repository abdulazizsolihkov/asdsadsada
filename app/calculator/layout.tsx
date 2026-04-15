'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthGuard } from '@/components/ui/AuthGuard';
import { useCalculatorStore } from '@/store/calculatorStore';

const PHASES = [
  { path: '/calculator/estate', label: 'Mulk', num: 1 },
  { path: '/calculator/heirs',  label: "Merosxo'rlar", num: 2 },
  { path: '/calculator/results', label: 'Natijalar', num: 3 },
];

function CalcHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { reset } = useCalculatorStore();

  const current = PHASES.find(p => pathname.startsWith(p.path))?.num ?? 1;

  function handleLogout() { logout(); router.push('/'); }
  function handleReset() { reset(); router.push('/calculator/estate'); }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">م</div>
          <span className="font-bold text-slate-800 text-sm hidden sm:block">Meros</span>
        </Link>

        {/* Phase stepper */}
        <div className="flex items-center gap-0">
          {PHASES.map((phase, idx) => {
            const done = phase.num < current;
            const active = phase.num === current;
            return (
              <div key={phase.num} className="flex items-center">
                <Link
                  href={phase.path}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all text-xs font-semibold ${
                    active ? 'text-emerald-700' : done ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 pointer-events-none'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    active ? 'bg-emerald-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? '✓' : phase.num}
                  </span>
                  <span className="hidden sm:block">{phase.label}</span>
                </Link>
                {idx < PHASES.length - 1 && (
                  <div className={`w-6 h-px mx-0.5 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block">
            Yangi
          </button>
          {user && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 ml-1">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-red-600 transition-colors px-1">
                Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function CalculatorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <CalcHeader />
        <main className="pt-14 pb-8">
          <div className="max-w-xl mx-auto px-4 py-6 page-enter">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
