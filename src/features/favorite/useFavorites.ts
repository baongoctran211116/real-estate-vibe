// filename: src/features/favorite/useFavorites.ts
import { useMemo } from 'react';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { MOCK_PROPERTIES } from '../../data/mockProperties';

export const useFavorites = () => {
  const favoriteIds = useFavoriteStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const favoriteProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((p) => favoriteIds.has(p.id)).map((p) => ({
      ...p,
      isFavorite: true,
    }));
  }, [favoriteIds]);

  return {
    favoriteProperties,
    favoriteCount: favoriteIds.size,
    toggleFavorite,
  };
};
