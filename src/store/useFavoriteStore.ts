// filename: src/store/useFavoriteStore.ts
import { create } from 'zustand';

interface FavoriteState {
  // Map userId → Set of favoriteIds
  // Key 'guest' untuk pengguna tidak login
  favoritesByUser: Record<string, Set<string>>;

  // Actions
  toggleFavorite: (propertyId: string, userId?: string) => void;
  isFavorite: (propertyId: string, userId?: string) => boolean;
  getFavoriteIds: (userId?: string) => string[];
  getFavoriteCount: (userId?: string) => number;

  // Sync từ server sau khi login
  setUserFavorites: (userId: string, ids: string[]) => void;

  // Clear user data khi logout
  clearUserFavorites: (userId: string) => void;
}

const GUEST_KEY = '__guest__';

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoritesByUser: {
    // Seed một vài BĐS cho guest để app trông có nội dung
    [GUEST_KEY]: new Set<string>(),
  },

  toggleFavorite: (propertyId, userId) => {
    const key = userId ?? GUEST_KEY;
    set((state) => {
      const current = state.favoritesByUser[key] ?? new Set<string>();
      const next = new Set(current);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      return {
        favoritesByUser: { ...state.favoritesByUser, [key]: next },
      };
    });
  },

  isFavorite: (propertyId, userId) => {
    const key = userId ?? GUEST_KEY;
    return get().favoritesByUser[key]?.has(propertyId) ?? false;
  },

  getFavoriteIds: (userId) => {
    const key = userId ?? GUEST_KEY;
    return Array.from(get().favoritesByUser[key] ?? []);
  },

  getFavoriteCount: (userId) => {
    const key = userId ?? GUEST_KEY;
    return get().favoritesByUser[key]?.size ?? 0;
  },

  setUserFavorites: (userId, ids) => {
    set((state) => ({
      favoritesByUser: {
        ...state.favoritesByUser,
        [userId]: new Set(ids),
      },
    }));
  },

  clearUserFavorites: (userId) => {
    set((state) => {
      const next = { ...state.favoritesByUser };
      delete next[userId];
      return { favoritesByUser: next };
    });
  },
}));
