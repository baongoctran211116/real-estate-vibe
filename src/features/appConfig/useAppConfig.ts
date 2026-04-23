// filename: src/features/appConfig/useAppConfig.ts
// ─── Hook duy nhất để đọc app config trong toàn bộ app ───────────────────────
//
// Usage:
//   const { map, propertyTypes, priceRanges, theme, pagination, search } = useAppConfig();
//
// Config được load 1 lần khi app khởi động (qua AppConfigInitializer),
// sau đó cached bởi React Query. Mọi component đọc từ đây đều reactive:
// khi server deploy config mới → stale sau 30 phút → tự refetch background.

import { useQuery } from '@tanstack/react-query';
import { fetchAppConfig } from '../../services/appConfigService';
import { FALLBACK_CONFIG, QUERY_KEYS, STALE_TIME } from '../../utils/Constants';
import { AppConfig } from '../../types/appConfig';

export const useAppConfig = (): AppConfig => {
  const query = useQuery<AppConfig>({
    queryKey:  QUERY_KEYS.appConfig,
    queryFn:   fetchAppConfig,
    staleTime: STALE_TIME.appConfig,
    // Không bao giờ throw — fetchAppConfig đã fallback nội bộ
    retry: false,
    // Giữ data cũ khi refetch nền → UI không bị giật
    placeholderData: FALLBACK_CONFIG,
  });

  // Luôn trả về object đầy đủ — không bao giờ undefined
  return query.data ?? FALLBACK_CONFIG;
};

// ─── Selector hooks — tiện lợi, tránh destructure nhiều chỗ ──────────────────

/** Map defaults (lat, lng, zoom) */
export const useMapConfig = () => useAppConfig().map;

/** Danh sách loại bất động sản từ server */
export const usePropertyTypeOptions = () => useAppConfig().propertyTypes;

console.log('propertyTypes:', JSON.stringify(useMapConfig, null, 2));

/** Danh sách khoảng giá từ server */
export const usePriceRanges = () => useAppConfig().priceRanges;

/** Theme colors từ server */
export const useThemeColors = () => useAppConfig().theme;

/** Pagination config */
export const usePaginationConfig = () => useAppConfig().pagination;

/** Search config */
export const useSearchConfig = () => useAppConfig().search;

// ─── Prefetch helper — gọi trước khi React tree mount ────────────────────────
// Dùng trong AppConfigInitializer (outside hook context) để seed cache sớm nhất.
import { queryClient } from '../../app/queryClient';

export const prefetchAppConfig = () =>
  queryClient.prefetchQuery({
    queryKey:  QUERY_KEYS.appConfig,
    queryFn:   fetchAppConfig,
    staleTime: STALE_TIME.appConfig,
  });