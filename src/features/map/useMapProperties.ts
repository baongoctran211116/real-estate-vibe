// filename: src/features/map/useMapProperties.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getMapProperties } from '../../services/propertyService';
import { useFilterStore } from '../../store/useFilterStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { QUERY_KEYS, STALE_TIME } from '../../utils/Constants';

export const useMapProperties = () => {
  const filters = useFilterStore((s) => s.filters);
  const userId  = useAuthStore((s) => s.user?.id);

  const favoriteIdsArray = useFavoriteStore((s) => {
    const key = userId ?? '__guest__';
    return Array.from(s.favoritesByUser[key] ?? []);
  });

  const query = useQuery({
    queryKey: QUERY_KEYS.mapProperties(filters),
    queryFn:  () => getMapProperties(filters),
    staleTime: STALE_TIME.properties,
  });

  const properties = useMemo(() => {
    const idSet = new Set(favoriteIdsArray);
    return (
      query.data?.map((p) => ({
        ...p,
        isFavorite: idSet.has(p.id),
      })) ?? []
    );
  }, [query.data, favoriteIdsArray]);

  return {
    properties,
    isLoading: query.isLoading,
    isError:   query.isError,
    refetch:   query.refetch,
  };
};
