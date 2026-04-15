'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-emerald-300 group-hover:shadow-emerald-400 transition-shadow">
            م
          </div>
          <span className="font-bold text-slate-800 text-sm">Meros</span>
        </Link>

        {/* Nav right */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/calculator"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
              >
                Kalkulyator
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-slate-700 font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-red-600 transition-colors ml-1 px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  Chiqish
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors px-3 py-1.5"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
