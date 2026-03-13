// filename: src/features/favorite/useFavorites.ts
import { useMemo } from 'react';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MOCK_PROPERTIES } from '../../data/mockProperties';

export const useFavorites = () => {
  const userId = useAuthStore((s) => s.user?.id);

  // Reactive: subscribe trực tiếp vào slice của user hiện tại
  const favoriteIdsArray = useFavoriteStore((s) => {
    const key = userId ?? '__guest__';
    return Array.from(s.favoritesByUser[key] ?? []);
  });

  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const favoriteProperties = useMemo(() => {
    const idSet = new Set(favoriteIdsArray);
    return MOCK_PROPERTIES.filter((p) => idSet.has(p.id)).map((p) => ({
      ...p,
      isFavorite: true,
    }));
  }, [favoriteIdsArray]);

  return {
    favoriteProperties,
    favoriteCount: favoriteIdsArray.length,
    // Bọc sẵn userId để caller không cần truyền
    toggleFavorite: (propertyId: string) => toggleFavorite(propertyId, userId),
  };
};
