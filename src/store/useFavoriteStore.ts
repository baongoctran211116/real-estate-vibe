// filename: src/store/useFavoriteStore.ts
import { create } from 'zustand';
import { Property } from '../types/property';

interface FavoriteState {
  favoriteIds: Set<string>;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  getFavoriteIds: () => string[];
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoriteIds: new Set(
    // Pre-seed from mock data
    ['2', '5', '10', '12', '18', '22', '31', '36', '46']
  ),

  toggleFavorite: (propertyId: string) => {
    set((state) => {
      const next = new Set(state.favoriteIds);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return { favoriteIds: next };
    });
  },

  isFavorite: (propertyId: string) => {
    return get().favoriteIds.has(propertyId);
  },

  getFavoriteIds: () => {
    return Array.from(get().favoriteIds);
  },
}));
