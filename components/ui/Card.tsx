import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const padMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padMap[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-base font-semibold text-slate-800 mb-4 ${className}`}>
      {children}
    </h2>
  );
}

export function Divider() {
  return <hr className="border-slate-100 my-4" />;
}
