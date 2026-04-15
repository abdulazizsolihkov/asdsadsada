'use client';
import { useState, useCallback } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  helper?: string;
  min?: number;
  max?: number;
  isCurrency?: boolean;
  className?: string;
}

function formatCurrency(n: number): string {
  return n.toLocaleString('uz-UZ');
}

export function NumberInput({ value, onChange, label, helper, min = 0, max, isCurrency = false, className = '' }: NumberInputProps) {
  const [raw, setRaw] = useState<string>(value === 0 ? '' : String(value));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const stripped = e.target.value.replace(/[^\d]/g, '');
    setRaw(stripped);
    const parsed = stripped === '' ? 0 : parseInt(stripped, 10);
    const clamped = max !== undefined ? Math.min(parsed, max) : parsed;
    onChange(Math.max(min, clamped));
  }, [onChange, min, max]);

  const handleBlur = useCallback(() => {
    setRaw(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-right text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {isCurrency && value > 0 && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {formatCurrency(value)}
          </span>
        )}
      </div>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-full border border-gray-300 text-xl font-semibold text-gray-600 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className="w-16 text-center text-lg font-semibold rounded-lg border border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-full border border-gray-300 text-xl font-semibold text-gray-600 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          +
        </button>
      </div>
      {helper && <p className="text-xs text-gray-500 mt-0.5">{helper}</p>}
    </div>
  );
}
