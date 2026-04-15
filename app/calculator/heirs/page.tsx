'use client';
import { useRouter } from 'next/navigation';
import { useCalculatorStore } from '@/store/calculatorStore';
import { Card, SectionTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { YesNo } from '@/components/ui/YesNo';
import { CountInput } from '@/components/ui/NumberInput';
import type { HeirData } from '@/engine/types';

function hasAnyMaleLine(h: HeirData) {
  return h.son_count > 0 || h.sons_son_count > 0 || h.sons_sons_son_count > 0;
}
function hasAnyChildren(h: HeirData) {
  return h.son_count > 0 || h.daughter_count > 0 || h.sons_son_count > 0 || h.sons_daughter_count > 0 || h.sons_sons_son_count > 0 || h.sons_sons_daughter_count > 0;
}

export default function HeirsPage() {
  const router = useRouter();
  const { heirs, setHeirs, wizardStep, setWizardStep } = useCalculatorStore();
  const h = heirs;
  function field<K extends keyof HeirData>(key: K) {
    return (val: HeirData[K]) => setHeirs({ [key]: val });
  }

  const asabaChainTriggered =
    !h.son_count && !h.sons_son_count && !h.sons_sons_son_count &&
    !h.father_alive && !h.fathers_father_alive && !h.fathers_fathers_father_alive &&
    !h.blood_brother_count && !h.paternal_brother_count;

  const steps: { title: string; subtitle?: string; content: React.ReactNode; visible: boolean }[] = [
    {
      title: "Marhum jinsi",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map(g => (
            <button key={g} type="button" onClick={() => field('deceased_gender')(g)}
              className={`py-5 rounded-2xl border-2 text-sm font-semibold transition-all ${h.deceased_gender === g ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200' : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'}`}>
              <div className="text-3xl mb-2">{g === 'male' ? '👨' : '👩'}</div>
              {g === 'male' ? 'Erkak' : 'Ayol'}
            </button>
          ))}
        </div>
      ),
      visible: true,
    },
    {
      title: "Turmush o'rtog'i",
      content: h.deceased_gender === 'male'
        ? <CountInput label="Xotinlar soni" value={h.wife_count} onChange={field('wife_count')} max={4} helper="Islom bo'yicha maksimal 4 ta xotin" />
        : <YesNo label="Eri tirikmi?" value={h.husband_alive} onChange={field('husband_alive')} />,
      visible: true,
    },
    {
      title: "Farzandlar",
      subtitle: "To'g'ridan-to'g'ri farzandlar",
      content: (
        <div className="space-y-5">
          <CountInput label="O'g'il farzandlar soni" value={h.son_count} onChange={field('son_count')} />
          <CountInput label="Qiz farzandlar soni" value={h.daughter_count} onChange={field('daughter_count')} />
          {h.son_count === 0 && (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                <span>ℹ</span> O'g'il yo'q — nabiralarni ham kiriting
              </div>
              <CountInput label="O'g'ilning o'g'illari soni" value={h.sons_son_count} onChange={field('sons_son_count')} />
              <CountInput label="O'g'ilning qizlari soni" value={h.sons_daughter_count} onChange={field('sons_daughter_count')} />
              {h.sons_son_count === 0 && (
                <>
                  <CountInput label="O'g'ilning o'g'ilining o'g'illari" value={h.sons_sons_son_count} onChange={field('sons_sons_son_count')} />
                  <CountInput label="O'g'ilning o'g'ilining qizlari" value={h.sons_sons_daughter_count} onChange={field('sons_sons_daughter_count')} />
                </>
              )}
            </>
          )}
        </div>
      ),
      visible: true,
    },
    {
      title: "Ota-ona",
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
      visible: true,
    },
    {
      title: "Buvilar",
      content: (
        <div className="space-y-4">
          <YesNo label="Onasining onasi tirikmi?" value={h.mothers_mother_alive} onChange={field('mothers_mother_alive')} />
          {!h.father_alive && (
            <YesNo label="Otasining onasi tirikmi?" value={h.fathers_mother_alive} onChange={field('fathers_mother_alive')} />
          )}
          {!h.mothers_mother_alive && (
            <>
              <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">Buvilar yo'q — katta buvilarni kiriting</div>
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
      visible: !h.mother_alive,
    },
    {
      title: "Aka-uka va opa-singillar",
      content: (
        <div className="space-y-5">
          <CountInput label="To'la aka-uka soni" value={h.blood_brother_count} onChange={field('blood_brother_count')} />
          <CountInput label="To'la opa-singil soni" value={h.blood_sister_count} onChange={field('blood_sister_count')} />
          {h.blood_brother_count === 0 && (
            <>
              <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">To'la aka-uka yo'q</div>
              <CountInput label="Otadan aka-uka soni" value={h.paternal_brother_count} onChange={field('paternal_brother_count')} />
              <CountInput label="Otadan opa-singil soni" value={h.paternal_sister_count} onChange={field('paternal_sister_count')} />
            </>
          )}
        </div>
      ),
      visible: !hasAnyMaleLine(h) && !h.father_alive,
    },
    {
      title: "Onadan aka-uka va opa-singillar",
      content: (
        <div className="space-y-5">
          <CountInput label="Onadan aka-uka soni" value={h.maternal_brother_count} onChange={field('maternal_brother_count')} />
          <CountInput label="Onadan opa-singil soni" value={h.maternal_sister_count} onChange={field('maternal_sister_count')} />
        </div>
      ),
      visible: !hasAnyChildren(h) && !h.father_alive && !h.fathers_father_alive && !h.fathers_fathers_father_alive,
    },
    {
      title: "Uzoq qarindoshlar (Asaba zanjiri)",
      subtitle: "Birinchi topilganida zanjir to'xtaydi",
      content: (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-800">
            Asosiy Asaba merosxo'rlar mavjud emas. Zanjir bo'yicha kiriting.
          </div>
          <CountInput label="To'la aka-ukaning o'g'illari" value={h.blood_brothers_son_count} onChange={field('blood_brothers_son_count')} />
          {h.blood_brothers_son_count === 0 && <CountInput label="Otadan aka-ukaning o'g'illari" value={h.paternal_brothers_son_count} onChange={field('paternal_brothers_son_count')} />}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && <CountInput label="To'la amaki soni" value={h.blood_uncle_count} onChange={field('blood_uncle_count')} />}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && h.blood_uncle_count === 0 && <CountInput label="Otadan amaki soni" value={h.paternal_uncle_count} onChange={field('paternal_uncle_count')} />}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && h.blood_uncle_count === 0 && h.paternal_uncle_count === 0 && <CountInput label="To'la amakining o'g'illari" value={h.blood_uncles_son_count} onChange={field('blood_uncles_son_count')} />}
          {h.blood_brothers_son_count === 0 && h.paternal_brothers_son_count === 0 && h.blood_uncle_count === 0 && h.paternal_uncle_count === 0 && h.blood_uncles_son_count === 0 && <CountInput label="Otadan amakining o'g'illari" value={h.paternal_uncles_son_count} onChange={field('paternal_uncles_son_count')} />}
        </div>
      ),
      visible: asabaChainTriggered,
    },
  ];

  const visible = steps.filter(s => s.visible);
  const current = visible[Math.min(wizardStep, visible.length - 1)];
  const isLast = wizardStep >= visible.length - 1;
  const progress = ((wizardStep + 1) / visible.length) * 100;

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <h1 className="text-xl font-bold text-slate-900">Merosxo'rlar</h1>
          <span className="text-xs text-slate-500 font-medium">{wizardStep + 1} / {visible.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {current && (
        <Card className="slide-up" key={wizardStep}>
          <div className="mb-4">
            <SectionTitle className="mb-0.5">{current.title}</SectionTitle>
            {current.subtitle && <p className="text-xs text-slate-500">{current.subtitle}</p>}
          </div>
          {current.content}
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" size="lg"
          onClick={() => wizardStep === 0 ? router.push('/calculator/estate') : setWizardStep(wizardStep - 1)}
          className="flex-1">
          ← Orqaga
        </Button>
        <Button size="lg" className="flex-[2]"
          onClick={() => isLast ? router.push('/calculator/results') : setWizardStep(wizardStep + 1)}>
          {isLast ? 'Natijalarni ko\'rish →' : 'Keyingi →'}
        </Button>
      </div>
    </div>
  );
}
