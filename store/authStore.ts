'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

function hashPassword(password: string): string {
  // Simple deterministic hash for demo (not cryptographically secure)
  let hash = 0;
  const str = password + 'meros_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('meros_users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('meros_users', JSON.stringify(users));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const users = getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!found) return { ok: false, error: 'Email topilmadi' };
        if (found.passwordHash !== hashPassword(password)) {
          return { ok: false, error: 'Parol noto\'g\'ri' };
        }
        const user: AuthUser = { id: found.id, name: found.name, email: found.email };
        set({ user, isAuthenticated: true });
        return { ok: true };
      },

      register: (name, email, password) => {
        const users = getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan' };
        }
        if (password.length < 6) {
          return { ok: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' };
        }
        const newUser: StoredUser = {
          id: Date.now().toString(36),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: hashPassword(password),
        };
        saveUsers([...users, newUser]);
        const user: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email };
        set({ user, isAuthenticated: true });
        return { ok: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'meros-auth-state',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
