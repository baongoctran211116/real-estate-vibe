// filename: src/features/property/usePropertyDetail.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getPropertyById } from '../../services/propertyService';
import { useFavoriteStore } from '../../store/useFavoriteStore';

export const usePropertyDetail = (propertyId: string) => {
  const isFavorite = useFavoriteStore((s) => s.isFavorite);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const query = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId),
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5,
  });

  const property = useMemo(() => {
    if (!query.data) return null;
    return {
      ...query.data,
      isFavorite: isFavorite(query.data.id),
    };
  }, [query.data, isFavorite]);

  return {
    property,
    isLoading: query.isLoading,
    isError: query.isError,
    toggleFavorite: () => {
      if (property) toggleFavorite(property.id);
    },
  };
};
