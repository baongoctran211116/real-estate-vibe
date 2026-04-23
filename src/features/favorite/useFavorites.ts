// filename: src/features/favorite/useFavorites.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getPropertiesByIds } from '../../services/propertyService';
import { QUERY_KEYS, STALE_TIME } from '../../utils/Constants';

export const useFavorites = () => {
  const userId = useAuthStore((s) => s.user?.id);

  // Reactive: subscribe trực tiếp vào slice của user hiện tại
  const favoriteIdsArray = useFavoriteStore((s) => {
    const key = userId ?? '__guest__';
    return Array.from(s.favoritesByUser[key] ?? []);
  });

  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  // ── Fetch từ API ───────────────────────────────────────────────────────────
  // Mock server trả toàn bộ map.json → client filter theo favoriteIdsArray.
  // Real backend sẽ filter server-side qua query param ?ids=...
  const query = useQuery({
    queryKey: QUERY_KEYS.favoriteProperties(favoriteIdsArray),
    queryFn:  () => getPropertiesByIds(favoriteIdsArray),
    enabled:  favoriteIdsArray.length > 0,
    staleTime: STALE_TIME.properties,
  });

  const favoriteProperties = useMemo(() => {
    const idSet = new Set(favoriteIdsArray);
    // Filter phòng trường hợp mock server trả nhiều hơn danh sách yêu cầu
    return (query.data ?? [])
      .filter((p) => idSet.has(p.id))
      .map((p) => ({ ...p, isFavorite: true }));
  }, [query.data, favoriteIdsArray]);

  return {
    favoriteProperties,
    favoriteCount: favoriteIdsArray.length,
    isLoading: query.isLoading && favoriteIdsArray.length > 0,
    // Bọc sẵn userId để caller không cần truyền
    toggleFavorite: (propertyId: string) => toggleFavorite(propertyId, userId),
  };
};
