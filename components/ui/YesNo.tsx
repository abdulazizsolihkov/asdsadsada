'use client';

interface YesNoProps {
  value: boolean;
  onChange: (val: boolean) => void;
  label: string;
}

export function YesNo({ value, onChange, label }: YesNoProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
            value
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          ✓ Ha
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
            !value
              ? 'bg-slate-700 border-slate-700 text-white'
              : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          ✗ Yo'q
        </button>
      </div>
    </div>
  );
}
