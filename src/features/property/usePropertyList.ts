// filename: src/features/property/usePropertyList.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getProperties } from '../../services/propertyService';
import { useFilterStore } from '../../store/useFilterStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Property } from '../../types/property';

const PAGE_SIZE = 10;

export const usePropertyList = () => {
  const filters = useFilterStore((s) => s.filters);
  const userId = useAuthStore((s) => s.user?.id);

  // Reactive: lấy array ids theo user hiện tại
  const favoriteIdsArray = useFavoriteStore((s) => {
    const key = userId ?? '__guest__';
    return Array.from(s.favoritesByUser[key] ?? []);
  });

  const query = useInfiniteQuery({
    queryKey: ['properties', filters],
    queryFn: ({ pageParam = 1 }) =>
      getProperties(pageParam as number, PAGE_SIZE, filters),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const properties = useMemo<Property[]>(() => {
    const idSet = new Set(favoriteIdsArray);
    return (
      query.data?.pages.flatMap((page) =>
        page.data.map((p) => ({
          ...p,
          isFavorite: idSet.has(p.id),
        }))
      ) ?? []
    );
  }, [query.data, favoriteIdsArray]);

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
