// filename: src/features/search/useSearch.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { searchProperties } from '../../services/propertyService';
import { useFilterStore } from '../../store/useFilterStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDebounce } from '../../hooks/useDebounce';
import { Property } from '../../types/property';

const PAGE_SIZE = 10;

export const useSearch = () => {
  const keyword = useFilterStore((s) => s.searchKeyword);
  const filters = useFilterStore((s) => s.filters);
  const setKeyword = useFilterStore((s) => s.setSearchKeyword);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const userId = useAuthStore((s) => s.user?.id);

  // Reactive: lấy array ids theo user hiện tại
  const favoriteIdsArray = useFavoriteStore((s) => {
    const key = userId ?? '__guest__';
    return Array.from(s.favoritesByUser[key] ?? []);
  });

  const debouncedKeyword = useDebounce(keyword, 400);

  const query = useInfiniteQuery({
    queryKey: ['search', debouncedKeyword, filters],
    queryFn: ({ pageParam = 1 }) =>
      searchProperties(
        { keyword: debouncedKeyword, filters },
        pageParam as number,
        PAGE_SIZE,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: debouncedKeyword.trim().length > 0,
  });

  const results = useMemo<Property[]>(() => {
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
    keyword,
    setKeyword,
    resetFilters,
    results,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
    totalResults: query.data?.pages[0]?.total ?? 0,
  };
};
