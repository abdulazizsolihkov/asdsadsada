'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Ismingizni kiriting'); return; }
    if (!email) { setError('Email kiriting'); return; }
    if (!password) { setError('Parol kiriting'); return; }
    if (password.length < 6) { setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(name, email, password);
    setLoading(false);
    if (result.ok) {
      router.push('/calculator');
    } else {
      setError(result.error || 'Xatolik yuz berdi');
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  const strengthLabels = ['', 'Zaif', 'O\'rtacha', 'Kuchli'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-200">
          م
        </div>
        <span className="font-bold text-slate-800 text-lg">Meros</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-7 slide-up">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Hisob yaratish</h1>
          <p className="text-sm text-slate-500 mt-1">Bepul, bir daqiqada</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ism familiya"
            type="text"
            placeholder="Abdulaziz Soliqov"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>}
          />
          <div>
            <Input
              label="Parol"
              type={showPassword ? 'text' : 'password'}
              placeholder="Kamida 6 ta belgi"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                  {showPassword
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              }
            />
            {/* Password strength */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`} />
                  ))}
                </div>
                <span className={`text-xs font-medium ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            Hisob yaratish
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Hisob bormi?{' '}
          <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
            Kirish
          </Link>
        </p>
      </div>

      <Link href="/" className="mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        ← Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
