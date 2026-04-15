'use client';
import { useCalculatorStore } from '@/store/calculatorStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { YesNo } from '@/components/ui/YesNo';
import { CountInput } from '@/components/ui/NumberInput';
import { uz } from '@/i18n/uz';
import type { HeirData } from '@/engine/types';

// Total wizard steps (0-indexed)
const TOTAL_STEPS = 8;

function hasAnyChildren(h: HeirData) {
  return h.son_count > 0 || h.daughter_count > 0 || h.sons_son_count > 0 || h.sons_daughter_count > 0 || h.sons_sons_son_count > 0 || h.sons_sons_daughter_count > 0;
}
function hasAnyMaleLine(h: HeirData) {
  return h.son_count > 0 || h.sons_son_count > 0 || h.sons_sons_son_count > 0;
}

export function PhaseTwo() {
  const { heirs, setHeirs, setPhase, wizardStep, setWizardStep } = useCalculatorStore();
  const h = heirs;

  function field<K extends keyof HeirData>(key: K) {
    return (val: HeirData[K]) => setHeirs({ [key]: val });
  }

  const asabaChainTriggered =
    h.son_count === 0 &&
    h.sons_son_count === 0 &&
    h.sons_sons_son_count === 0 &&
    !h.father_alive &&
    !h.fathers_father_alive &&
    !h.fathers_fathers_father_alive &&
    h.blood_brother_count === 0 &&
    h.paternal_brother_count === 0;

  const steps: { title: string; content: React.ReactNode; isVisible: boolean }[] = [
    // Step 0: Gender
    {
      title: "Marhum / Marhumaning jinsi",
      isVisible: true,
      content: (
        <div className="flex gap-3">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => field('deceased_gender')(g)}
              className={`flex-1 py-4 rounded-xl border-2 text-base font-semibold transition-all ${
                h.deceased_gender === g
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-emerald-300'
              }`}
            >
              {g === 'male' ? '👨 Erkak' : '👩 Ayol'}
            </button>
          ))}
        </div>
      ),
    },

    // Step 1: Spouse
    {
      title: "Turmush o'rtog'i",
      isVisible: true,
      content: h.deceased_gender === 'male' ? (
        <CountInput label="Xotinlar soni (0–4)" value={h.wife_count} onChange={field('wife_count')} max={4} />
      ) : (
        <YesNo label="Eri tirikmi?" value={h.husband_alive} onChange={field('husband_alive')} />
      ),
    },

    // Step 2: Children
    {
      title: "Farzandlar",
      isVisible: true,
      content: (
        <div className="space-y-4">
          <CountInput label="O'g'il farzandlar soni" value={h.son_count} onChange={field('son_count')} />
          <CountInput label="Qiz farzandlar soni" value={h.daughter_count} onChange={field('daughter_count')} />
          {h.son_count === 0 && (
            <>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">O'g'il yo'q — nabiralarni kiriting</div>
              <CountInput label="O'g'ilning o'g'illari soni" value={h.sons_son_count} onChange={field('sons_son_count')} />
              <CountInput label="O'g'ilning qizlari soni" value={h.sons_daughter_count} onChange={field('sons_daughter_count')} />
              {h.sons_son_count === 0 && (
                <>
                  <CountInput label="O'g'ilning o'g'ilining o'g'illari soni" value={h.sons_sons_son_count} onChange={field('sons_sons_son_count')} />
                  <CountInput label="O'g'ilning o'g'ilining qizlari soni" value={h.sons_sons_daughter_count} onChange={field('sons_sons_daughter_count')} />
                </>
              )}
            </>
          )}
        </div>
      ),
    },

    // Step 3: Parents
    {
      title: "Ota-ona",
      isVisible: true,
      content: (
        <div className="space-y-4">
          <YesNo label="Otasi tirikmi?" value={h.father_alive} onChange={field('father_alive')} />
          <YesNo label="Onasi tirikmi?" value={h.mother_alive} onChange={field('mother_alive')} />
          {!h.father_alive && (
            <>
              <YesNo label="Bobosi (otasining otasi) tirikmi?" value={h.fathers_father_alive} onChange={field('fathers_father_alive')} />
              {!h.fathers_father_alive && (
                <YesNo label="Otasining bobosi tirikmi?" value={h.fathers_fathers_father_alive} onChange={field('fathers_fathers_father_alive')} />
              )}
            </>
          )}
        </div>
      ),
    },

    // Step 4: Grandmothers
    {
      title: "Buvilar",
      isVisible: !h.mother_alive,
      content: (
        <div className="space-y-4">
          <YesNo label="Onasining onasi tirikmi?" value={h.mothers_mother_alive} onChange={field('mothers_mother_alive')} />
          {!h.father_alive && (
            <YesNo label="Otasining onasi tirikmi?" value={h.fathers_mother_alive} onChange={field('fathers_mother_alive')} />
          )}
          {!h.mothers_mother_alive && (!h.father_alive ? !h.fathers_mother_alive : true) && (
            <>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">Buvilar yo'q — katta buvilarni kiriting</div>
              <YesNo label="Onasining onasining onasi tirikmi?" value={h.mothers_mothers_mother_alive} onChange={field('mothers_mothers_mother_alive')} />
              {!h.father_alive && (
                <>
                  <YesNo label="Otasining otasining onasi tirikmi?" value={h.fathers_fathers_mother_alive} onChange={field('fathers_fathers_mother_alive')} />
                  <YesNo label="Otasining onasining onasi tirikmi?" value={h.fathers_mothers_mother_alive} onChange={field('fathers_mothers_mother_alive')} />
                </>
              )}
            </>
          )}
        </div>
      ),
    },

    // Step 5: Blood/Paternal siblings
    {
      title: "Aka-uka va opa-singillar",
      isVisible: !hasAnyMaleLine(h) && (!h.father_alive),
      content: (
        <div className="space-y-4">
          <CountInput label="To'la aka-uka soni" value={h.blood_brother_count} onChange={field('blood_brother_count')} />
          <CountInput label="To'la opa-singil soni" value={h.blood_sister_count} onChange={field('blood_sister_count')} />
          {h.blood_brother_count === 0 && (
            <>
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">To'la aka-uka yo'q — otadan aka-ukalarni kiriting</div>
              <CountInput label="Otadan aka-uka soni" value={h.paternal_brother_count} onChange={field('paternal_brother_count')} />
              <CountInput label="Otadan opa-singil soni" value={h.paternal_sister_count} onChange={field('paternal_sister_count')} />
            </>
          )}
        </div>
      ),
    },

    // Step 6: Maternal siblings
    {
      title: "Onadan aka-uka va opa-singillar",
      isVisible: !hasAnyChildren(h) && !hasAnyMaleLine(h) && !h.father_alive && !h.fathers_father_alive && !h.fathers_fathers_father_alive,
      content: (
        <div className="space-y-4">
          <CountInput label="Onadan aka-uka soni" value={h.maternal_brother_count} onChange={field('maternal_brother_count')} />
          <CountInput label="Onadan opa-singil soni" value={h.maternal_sister_count} onChange={field('maternal_sister_count')} />
        </div>
      ),
    },

    // Step 7: Asaba chain
    {
      title: "Uzoq qarindoshlar (Asaba zanjiri)",
      isVisible: asabaChainTriggered,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Asosiy Asaba merosxo'rlar mavjud emas. Quyidagi zanjirdan birini to'ldiring (birinchi topilganida to'xtaydi).
          </p>
          <CountInput label="To'la aka-ukaning o'g'illari soni" value={h.blood_brothers_son_count} onChange={field('blood_brothers_son_count')} />
          {h.blood_brothers_son_count === 0 && (
            <CountInput label="Otadan aka-ukaning o'g'illari soni" value={h.paternal_brothers_son_count} onChange={field('paternal_brothers_son_count')} />
          )}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && (
            <CountInput label="To'la amaki soni" value={h.blood_uncle_count} onChange={field('blood_uncle_count')} />
          )}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && h.blood_uncle_count === 0 && (
            <CountInput label="Otadan amaki soni" value={h.paternal_uncle_count} onChange={field('paternal_uncle_count')} />
          )}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && h.blood_uncle_count === 0 && h.paternal_uncle_count === 0 && (
            <CountInput label="To'la amakining o'g'illari soni" value={h.blood_uncles_son_count} onChange={field('blood_uncles_son_count')} />
          )}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && h.blood_uncle_count === 0 && h.paternal_uncle_count === 0 && h.blood_uncles_son_count === 0 && (
            <CountInput label="Otadan amakining o'g'illari soni" value={h.paternal_uncles_son_count} onChange={field('paternal_uncles_son_count')} />
          )}
        </div>
      ),
    },
  ];

  const visibleSteps = steps.filter(s => s.isVisible);
  const currentStep = visibleSteps[Math.min(wizardStep, visibleSteps.length - 1)];
  const isLast = wizardStep >= visibleSteps.length - 1;

  function handleNext() {
    if (isLast) {
      setPhase(3);
    } else {
      setWizardStep(wizardStep + 1);
    }
  }

  function handleBack() {
    if (wizardStep === 0) {
      setPhase(1);
    } else {
      setWizardStep(wizardStep - 1);
    }
  }

  // Heir summary for display
  const heirEntries: [string, number | boolean][] = [
    ['O\'g\'il farzand', h.son_count],
    ['Qiz farzand', h.daughter_count],
    ['O\'g\'ilning o\'g\'ili', h.sons_son_count],
    ['O\'g\'ilning qizi', h.sons_daughter_count],
    ['Eri', h.husband_alive ? 1 : 0],
    ['Xotini', h.wife_count],
    ['Otasi', h.father_alive ? 1 : 0],
    ['Onasi', h.mother_alive ? 1 : 0],
    ['Bobosi', h.fathers_father_alive ? 1 : 0],
    ['To\'la aka-uka', h.blood_brother_count],
    ['To\'la opa-singil', h.blood_sister_count],
    ['Otadan aka-uka', h.paternal_brother_count],
    ['Onadan aka-uka', h.maternal_brother_count],
  ].filter(([, v]) => (typeof v === 'boolean' ? v : (v as number) > 0)) as [string, number | boolean][];

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex gap-1">
        {visibleSteps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= wizardStep ? 'bg-emerald-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Qadam {wizardStep + 1} / {visibleSteps.length}
      </p>

      {/* Current step card */}
      {currentStep && (
        <Card>
          <SectionTitle>{currentStep.title}</SectionTitle>
          {currentStep.content}
        </Card>
      )}

      {/* Summary (only on last step) */}
      {isLast && heirEntries.length > 0 && (
        <Card>
          <SectionTitle>Aniqlangan Merosxo'rlar</SectionTitle>
          <div className="space-y-1.5">
            {heirEntries.map(([name, val]) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-gray-600">{name}</span>
                <span className="font-medium text-emerald-700">{typeof val === 'boolean' ? (val ? '✓' : '') : val}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold hover:border-gray-400 transition-colors"
        >
          ← Orqaga
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-2 flex-grow py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow"
        >
          {isLast ? 'Natijalarni ko\'rish →' : 'Keyingi →'}
        </button>
      </div>
    </div>
  );
}
