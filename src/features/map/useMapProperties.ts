// filename: src/features/map/useMapProperties.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getMapProperties } from '../../services/propertyService';
import { useFilterStore } from '../../store/useFilterStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';

export const useMapProperties = () => {
  const filters = useFilterStore((s) => s.filters);
  const favoriteIds = useFavoriteStore((s) => s.favoriteIds);

  const query = useQuery({
    queryKey: ['mapProperties', filters],
    queryFn: () => getMapProperties(filters),
    staleTime: 1000 * 60 * 3,
  });

  const properties = useMemo(() => {
    return (
      query.data?.map((p) => ({
        ...p,
        isFavorite: favoriteIds.has(p.id),
      })) ?? []
    );
  }, [query.data, favoriteIds]);

  return {
    properties,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
