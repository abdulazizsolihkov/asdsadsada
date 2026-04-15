'use client';

interface YesNoProps {
  value: boolean;
  onChange: (val: boolean) => void;
  label: string;
}

export function YesNo({ value, onChange, label }: YesNoProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
            value ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 text-gray-600 hover:border-emerald-400'
          }`}
        >
          Ha
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
            !value ? 'bg-gray-700 border-gray-700 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          Yo'q
        </button>
      </div>
    </div>
  );
}
