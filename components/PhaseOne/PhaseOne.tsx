'use client';
import { useState } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { computeEstate } from '@/engine/calculator';
import { NumberInput } from '@/components/ui/NumberInput';
import { Card, SectionTitle } from '@/components/ui/Card';
import { EstateSummary } from './EstateSummary';

export function PhaseOne() {
  const { estate, setEstate, setPhase } = useCalculatorStore();
  const [mode, setMode] = useState<'basic' | 'advanced'>(estate.mode);

  function handleModeChange(m: 'basic' | 'advanced') {
    setMode(m);
    setEstate({ mode: m });
  }

  const computed = computeEstate({ ...estate, mode });

  function handleField(key: keyof typeof estate) {
    return (val: number) => setEstate({ [key]: val });
  }

  const maxBequest = Math.floor(computed.netAmount / 3);

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {(['basic', 'advanced'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'basic' ? 'Oddiy' : 'Kengaytirilgan'}
          </button>
        ))}
      </div>

      {mode === 'basic' ? (
        <Card>
          <SectionTitle>Mulk Ma'lumotlari</SectionTitle>
          <div className="space-y-4">
            <NumberInput label="Jami mulk miqdori" value={estate.gross_amount} onChange={handleField('gross_amount')} isCurrency />
            <NumberInput label="Kafanlik va Dafn harajatlari" value={estate.burial_expenses} onChange={handleField('burial_expenses')} isCurrency />
            <NumberInput label="Insonlarga qarzlar" value={estate.debts_to_people} onChange={handleField('debts_to_people')} isCurrency />
            <NumberInput label="Diniy qarzlar (zakat, kafforat va b.)" value={estate.religious_debts} onChange={handleField('religious_debts')} isCurrency />
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <SectionTitle>Mulk Tarkibi</SectionTitle>
            <div className="space-y-4">
              <NumberInput label="Naqd pul va ekvivalentlar" value={estate.cash} onChange={handleField('cash')} isCurrency />
              <NumberInput label="Ko'chmas mulk, mashina, yer va b." value={estate.assets} onChange={handleField('assets')} isCurrency />
              <NumberInput label="Chorva mollari" value={estate.livestock} onChange={handleField('livestock')} isCurrency />
              <NumberInput label="Oltin/Kumush" value={estate.gold_silver} onChange={handleField('gold_silver')} isCurrency />
              <NumberInput label="Berilgan qarzlar (vafot etganga qarzdorlik)" value={estate.given_debts} onChange={handleField('given_debts')} isCurrency />
              <NumberInput label="Investitsiyalar" value={estate.investments} onChange={handleField('investments')} isCurrency />
              <NumberInput label="Biznes kapitali" value={estate.business_capital} onChange={handleField('business_capital')} isCurrency />
            </div>
          </Card>
          <Card>
            <SectionTitle>Dafn Harajatlari</SectionTitle>
            <div className="space-y-4">
              <NumberInput label="Kafanlik (Shroud)" value={estate.shroud} onChange={handleField('shroud')} isCurrency />
              <NumberInput label="Dafn harajatlari" value={estate.funeral_expenses} onChange={handleField('funeral_expenses')} isCurrency />
            </div>
          </Card>
          <Card>
            <SectionTitle>Qarzlar</SectionTitle>
            <div className="space-y-4">
              <NumberInput label="Insonlarga qarzlar" value={estate.debts_to_people} onChange={handleField('debts_to_people')} isCurrency />
              <NumberInput label="Diniy qarzlar (zakat, kafforat va b.)" value={estate.religious_debts} onChange={handleField('religious_debts')} isCurrency />
            </div>
          </Card>
        </>
      )}

      {/* Bequest */}
      <Card>
        <SectionTitle>Vasiyat</SectionTitle>
        <div className="space-y-2">
          <NumberInput
            label="Vasiyat miqdori"
            value={estate.bequest}
            onChange={handleField('bequest')}
            isCurrency
            helper={`Maksimal vasiyat (1/3): ${maxBequest.toLocaleString('uz-UZ')}`}
          />
          {estate.bequest > maxBequest && maxBequest >= 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Vasiyat 1/3 dan oshmasligi kerak. Avtomatik ravishda {maxBequest.toLocaleString('uz-UZ')} ga cheklanadi.
            </p>
          )}
        </div>
      </Card>

      {/* Live summary */}
      {computed.grossAmount > 0 && (
        <Card>
          <SectionTitle>Hisob-kitob Xulosasi</SectionTitle>
          <EstateSummary {...computed} />
        </Card>
      )}

      <button
        type="button"
        disabled={computed.finalAmount <= 0}
        onClick={() => setPhase(2)}
        className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow"
      >
        Merosxo'rlarga o'tish →
      </button>
    </div>
  );
}
