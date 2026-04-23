// filename: src/utils/Constants.ts
// ─── Giá trị FALLBACK tĩnh — chỉ dùng khi server chưa trả về config ──────────
// KHÔNG dùng trực tiếp trong UI component. Import từ useAppConfig() thay thế.
// File này chỉ là "safety net" cho lần đầu boot khi offline hoặc lỗi mạng.

import { AppConfig } from '../types/appConfig';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://bdsbds123.web.app';

/**
 * Fallback config cứng — chỉ dùng trong trường hợp fetchAppConfig() lỗi hoặc offline.
 * Cần đủ "cứng" để app vẫn chạy được, nhưng cũng phải hợp lý để tránh UI bị vỡ.
 * Sau khi fetch thành công, config thực sẽ ghi đè lên giá trị này. 
 */
export const FALLBACK_CONFIG: AppConfig = {
  map: {
    defaultLat:  10.7769,
    defaultLng:  106.7009,
    defaultZoom: 12,
  },
  pagination: {
    pageSize: 10,
  },
  search: {
    debounceMs: 400,
  },
  propertyTypes: [
    { value: 'apartment', label: 'Căn hộ'      },
    { value: 'house',     label: 'Nhà phố'      },
    { value: 'villa',     label: 'Biệt thự'     },
    { value: 'townhouse', label: 'Nhà liền kề'  },
    { value: 'land',      label: 'Đất nền'      },
  ],
  priceRanges: [
    { label: 'Dưới 2 tỷ 3',  min: 0,               max: 2_000_000_000   },
    { label: '2 – 5 tỷ',   min: 2_000_000_000,   max: 5_000_000_000   },
    { label: '5 – 10 tỷ',  min: 5_000_000_000,   max: 10_000_000_000  },
    { label: 'Trên 10 tỷ', min: 10_000_000_000,  max: 999_000_000_000 },
  ],
  theme: {
    primary:       '#006AFF',
    primaryDark:   '#0052CC',
    primaryLight:  '#EFF6FF',
    secondary:     '#7C3AED',
    success:       '#10B981',
    warning:       '#F59E0B',
    error:         '#EF4444',
    mapBackground: '#e8e0d8',
  },
};

// ─── Query key & stale time (infrastructure — không cần từ server) ────────────
export const QUERY_KEYS = {
  appConfig:          ['appConfig']          as const,
  provinces:          ['provinces']          as const,
  mapProperties:      (filters: object)       => ['mapProperties', filters]   as const,
  properties:         (page: number, filters: object) => ['properties', page, filters] as const,
  propertyById:       (id: string)            => ['property', id]             as const,
  search:             (q: string)             => ['search', q]                as const,
  // ids thay đổi => refetch tự động để sync với API
  favoriteProperties: (ids: string[])         => ['favoriteProperties', ...ids] as const,
} as const;

export const STALE_TIME = {
  appConfig:  1000 * 60 * 30, // 30 phút — config ít thay đổi nhưng cần hot-reload
  provinces:  1000 * 60 * 60, // 1 giờ
  properties: 1000 * 60 * 3,  // 3 phút
  detail:     1000 * 60 * 5,  // 5 phút
} as const;

// ─── Màu cứng dùng trong bootstrap UI (trước khi config load) ────────────────
// Chỉ dùng cho ActivityIndicator / SplashScreen — KHÔNG dùng ở nơi khác.
export const BOOTSTRAP_COLOR = '#ff6a00';

// ─── Spacing / Radius / Typography — layout primitives, không cần từ server ──
// Những giá trị này thuần là design token, thay đổi đòi hỏi rebuild UI dù sao.
export const SPACING = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 40,
} as const;

export const RADIUS = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 9999,
} as const;

export const TYPOGRAPHY = {
  xs: 11, sm: 12, base: 14, md: 15, lg: 16, xl: 18,
  '2xl': 20, '3xl': 22, '4xl': 24, '5xl': 28,
} as const;
