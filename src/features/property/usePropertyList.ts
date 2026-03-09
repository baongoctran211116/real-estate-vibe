// filename: src/features/property/usePropertyList.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getProperties } from '../../services/propertyService';
import { useFilterStore } from '../../store/useFilterStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { Property } from '../../types/property';

const PAGE_SIZE = 10;

export const usePropertyList = () => {
  const filters = useFilterStore((s) => s.filters);
  const favoriteIds = useFavoriteStore((s) => s.favoriteIds);

  const query = useInfiniteQuery({
    queryKey: ['properties', filters],
    queryFn: ({ pageParam = 1 }) =>
      getProperties(pageParam as number, PAGE_SIZE, filters),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  // Flatten pages + inject live favorite state
  const properties = useMemo<Property[]>(() => {
    return (
      query.data?.pages.flatMap((page) =>
        page.data.map((p) => ({
          ...p,
          isFavorite: favoriteIds.has(p.id),
        }))
      ) ?? []
    );
  }, [query.data, favoriteIds]);

  return {
    properties,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isError: query.isError,
  };
};
