// filename: src/store/useAuthStore.ts
import { create } from 'zustand';
import { User } from '../types/auth';
import { isTokenValid } from '../utils/jwt';

export type AuthStatus = 'guest' | 'authenticated';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => void;
  logout: () => void;
  updateProfile: (partial: Partial<User>) => void;
  hydrateFromToken: (token: string, user: User) => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),

  updateProfile: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  hydrateFromToken: (token, user) => {
    if (!isTokenValid(token)) {
      set({ user: null, token: null, isAuthenticated: false });
      return false;
    }
    set({ user, token, isAuthenticated: true });
    return true;
  },
}));
