'use client';
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightElement, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            className={`
              w-full rounded-xl border text-sm transition-all duration-150
              px-3 py-2.5
              ${leftIcon ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              ${error
                ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                : 'border-slate-200 bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400'
              }
              placeholder:text-slate-400
              ${className}
            `}
          />
          {rightElement && (
            <div className="absolute right-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span>{error}</p>}
        {helper && !error && <p className="text-xs text-slate-500">{helper}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
