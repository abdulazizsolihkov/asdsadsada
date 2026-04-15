'use client';
import { useRouter } from 'next/navigation';
import { useCalculatorStore } from '@/store/calculatorStore';
import { computeEstate } from '@/engine/calculator';
import { CurrencyInput } from '@/components/ui/NumberInput';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function SummaryRow({ label, value, variant = 'normal' }: { label: string; value: number; variant?: 'normal' | 'deduct' | 'net' | 'final' }) {
  if (value === 0 && variant === 'deduct') return null;
  const fmt = (n: number) => n.toLocaleString('uz-UZ');
  return (
    <div className={`flex justify-between items-center text-sm py-1.5 ${variant === 'final' ? 'border-t-2 border-emerald-400 pt-3 mt-1' : variant === 'net' ? 'border-t border-slate-100 pt-2 mt-0.5' : ''}`}>
      <span className={variant === 'deduct' ? 'text-red-600' : variant === 'final' ? 'font-bold text-emerald-700 text-base' : variant === 'net' ? 'font-semibold text-slate-700' : 'text-slate-600'}>
        {label}
      </span>
      <span className={variant === 'deduct' ? 'text-red-600 font-medium' : variant === 'final' ? 'font-bold text-emerald-700 text-base' : variant === 'net' ? 'font-semibold' : 'font-medium text-slate-800'}>
        {variant === 'deduct' ? `− ${fmt(value)}` : fmt(value)}
      </span>
    </div>
  );
}

export default function EstatePage() {
  const router = useRouter();
  const { estate, setEstate } = useCalculatorStore();
  const mode = estate.mode;

  function setMode(m: 'basic' | 'advanced') { setEstate({ mode: m }); }
  function field(key: keyof typeof estate) { return (val: number) => setEstate({ [key]: val }); }

  const computed = computeEstate(estate);
  const maxBequest = Math.floor(computed.netAmount / 3);

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-slate-900">Mulk ma'lumotlari</h1>
        <p className="text-sm text-slate-500 mt-0.5">Marhum qoldirgan mulk va majburiyatlarni kiriting</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {(['basic', 'advanced'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
            {m === 'basic' ? 'Oddiy' : 'Kengaytirilgan'}
          </button>
        ))}
      </div>

      {mode === 'basic' ? (
        <Card>
          <SectionTitle>Mulk va Majburiyatlar</SectionTitle>
          <div className="space-y-4">
            <CurrencyInput label="Jami mulk miqdori" value={estate.gross_amount} onChange={field('gross_amount')} />
            <CurrencyInput label="Kafanlik va Dafn harajatlari" value={estate.burial_expenses} onChange={field('burial_expenses')} />
            <CurrencyInput label="Insonlarga qarzlar" value={estate.debts_to_people} onChange={field('debts_to_people')} />
            <CurrencyInput label="Diniy qarzlar (zakat, kafforat va b.)" value={estate.religious_debts} onChange={field('religious_debts')} />
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <SectionTitle>Mulk tarkibi</SectionTitle>
            <div className="space-y-4">
              <CurrencyInput label="Naqd pul va ekvivalentlar" value={estate.cash} onChange={field('cash')} />
              <CurrencyInput label="Ko'chmas mulk, mashina, yer va b." value={estate.assets} onChange={field('assets')} />
              <CurrencyInput label="Chorva mollari" value={estate.livestock} onChange={field('livestock')} />
              <CurrencyInput label="Oltin / Kumush" value={estate.gold_silver} onChange={field('gold_silver')} />
              <CurrencyInput label="Berilgan qarzlar (vafot etganga qarzdorlik)" value={estate.given_debts} onChange={field('given_debts')} />
              <CurrencyInput label="Investitsiyalar" value={estate.investments} onChange={field('investments')} />
              <CurrencyInput label="Biznes kapitali" value={estate.business_capital} onChange={field('business_capital')} />
            </div>
          </Card>
          <Card>
            <SectionTitle>Dafn harajatlari</SectionTitle>
            <div className="space-y-4">
              <CurrencyInput label="Kafanlik" value={estate.shroud} onChange={field('shroud')} />
              <CurrencyInput label="Dafn harajatlari" value={estate.funeral_expenses} onChange={field('funeral_expenses')} />
            </div>
          </Card>
          <Card>
            <SectionTitle>Qarzlar</SectionTitle>
            <div className="space-y-4">
              <CurrencyInput label="Insonlarga qarzlar" value={estate.debts_to_people} onChange={field('debts_to_people')} />
              <CurrencyInput label="Diniy qarzlar" value={estate.religious_debts} onChange={field('religious_debts')} />
            </div>
          </Card>
        </>
      )}

      {/* Bequest */}
      <Card>
        <SectionTitle>Vasiyat</SectionTitle>
        <CurrencyInput
          label="Vasiyat miqdori"
          value={estate.bequest}
          onChange={field('bequest')}
          helper={computed.netAmount > 0 ? `Maksimal ruxsat: ${maxBequest.toLocaleString('uz-UZ')} (1/3)` : undefined}
        />
        {estate.bequest > maxBequest && maxBequest >= 0 && (
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-800">
            <span className="mt-0.5">⚠</span>
            <span>Vasiyat 1/3 dan oshmasligi kerak. {maxBequest.toLocaleString('uz-UZ')} ga cheklanadi.</span>
          </div>
        )}
      </Card>

      {/* Live summary */}
      {computed.grossAmount > 0 && (
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <SectionTitle>Hisob xulosasi</SectionTitle>
          <div className="space-y-0.5">
            <SummaryRow label="Jami mulk" value={computed.grossAmount} />
            <SummaryRow label="− Kafanlik/Dafn" value={computed.burialExpenses} variant="deduct" />
            <SummaryRow label="− Qarzlar" value={computed.debtsTopeople} variant="deduct" />
            <SummaryRow label="− Diniy qarzlar" value={computed.religiousDebts} variant="deduct" />
            <SummaryRow label="Sof miqdor" value={computed.netAmount} variant="net" />
            <SummaryRow label="− Vasiyat" value={computed.bequest} variant="deduct" />
            <SummaryRow label="Taqsimlash uchun" value={computed.finalAmount} variant="final" />
          </div>
        </Card>
      )}

      <Button
        fullWidth size="lg"
        disabled={computed.finalAmount <= 0}
        onClick={() => router.push('/calculator/heirs')}
      >
        Merosxo'rlarni aniqlash →
      </Button>
    </div>
  );
}
