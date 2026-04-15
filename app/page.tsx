'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/ui/Navbar';

const features = [
  {
    icon: '⚖️',
    title: 'Aniq hisob-kitob',
    desc: 'Kasr arifmetikasi orqali to\'liq aniqlikda Farz va Asaba ulushlarini hisoblaydi',
  },
  {
    icon: '📋',
    title: 'Shariat qoidalari',
    desc: 'Awl va Radd algoritmlari, Gharrawain holatlari va barcha merosxo\'r turlari',
  },
  {
    icon: '📱',
    title: 'Qulay interfeys',
    desc: 'Bosqichma-bosqich so\'rovnoma orqali barcha merosxo\'rlarni aniqlash',
  },
  {
    icon: '🖨️',
    title: 'Hisobot chop etish',
    desc: 'Natijalarni chiroyli jadval ko\'rinishida chop eting yoki saqlang',
  },
];

const steps = [
  { num: '01', title: 'Mulkni kiriting', desc: 'Jami mulk, qarzlar va vasiyatni kiriting' },
  { num: '02', title: 'Merosxo\'rlarni aniqlang', desc: 'Shartli so\'rovnoma orqali barcha merosxo\'rlarni belgilang' },
  { num: '03', title: 'Natijani ko\'ring', desc: 'Har bir merosxo\'rning ulushi va miqdorini diagramma bilan ko\'ring' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Islomiy Meros Taqsimoti
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
            Meros taqsimotini{' '}
            <span className="text-emerald-600">to'g'ri</span> hisoblang
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Islomiy meros qonunlari asosida merosni taqsimlash — Farz, Asaba, Awl va Radd
            algoritmlarini qo'llab, har bir merosxo'rga to'g'ri ulush hisoblab beradi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={isAuthenticated ? '/calculator' : '/register'}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-base"
            >
              Hisoblashni boshlash →
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 transition-all border-2 border-slate-200 text-base"
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Qanday ishlaydi?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="relative text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-200">
                  {s.num}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">Imkoniyatlar</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-emerald-600">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Boshlashga tayyormisiz?</h2>
          <p className="text-emerald-100 mb-8">
            Bepul ro'yxatdan o'ting va meros taqsimotini hoziroq hisoblang.
          </p>
          <Link
            href={isAuthenticated ? '/calculator' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg text-base"
          >
            {isAuthenticated ? 'Kalkulyatorga o\'tish →' : 'Bepul ro\'yxatdan o\'tish →'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">م</div>
            <span className="font-medium text-slate-700">Meros Kalkulyatori</span>
          </div>
          <span>© 2026 · Islomiy Meros Taqsimoti</span>
        </div>
      </footer>
    </div>
  );
}
