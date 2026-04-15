'use client';
import { useState, useCallback } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  helper?: string;
  min?: number;
  max?: number;
}

export function CurrencyInput({ value, onChange, label, helper, min = 0, max }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);

  const displayValue = focused
    ? (value === 0 ? '' : String(value))
    : (value === 0 ? '' : value.toLocaleString('uz-UZ'));

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className={`relative flex items-center rounded-xl border transition-all duration-150 bg-white ${
        focused ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
      }`}>
        <span className="absolute left-3 text-sm text-slate-400 pointer-events-none select-none">so'm</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder="0"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const stripped = e.target.value.replace(/[^\d]/g, '');
            let parsed = stripped === '' ? 0 : parseInt(stripped, 10);
            if (max !== undefined) parsed = Math.min(parsed, max);
            onChange(Math.max(min, parsed));
          }}
          className="w-full pl-12 pr-3 py-2.5 text-sm text-right bg-transparent outline-none font-medium text-slate-800"
        />
      </div>
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

// Keep old export name for compatibility
export { CurrencyInput as NumberInput };

interface CountInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  helper?: string;
  min?: number;
  max?: number;
}

export function CountInput({ value, onChange, label, helper, min = 0, max = 99 }: CountInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-600 flex items-center justify-center text-lg font-bold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150 active:scale-95"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-600 flex items-center justify-center text-lg font-bold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150 active:scale-95"
        >
          +
        </button>
      </div>
      {helper && <p className="text-xs text-slate-500 text-center mt-0.5">{helper}</p>}
    </div>
  );
}
