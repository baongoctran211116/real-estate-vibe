// filename: src/utils/constants.ts

export const APP_CONFIG = {
  PAGE_SIZE: 10,
  MAP_DEFAULT_LATITUDE: 16.0,
  MAP_DEFAULT_LONGITUDE: 106.5,
  MAP_DEFAULT_DELTA: 12,
  SEARCH_DEBOUNCE_MS: 400,
  IMAGE_CACHE_MAX_SIZE_MB: 100,
} as const;

export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  secondary: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.15)',
  cardShadow: '#1E3A5F',
} as const;

export const TYPOGRAPHY = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const PROVINCE_REGIONS = {
  Hanoi: {
    latitude: 21.028,
    longitude: 105.854,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4,
  },
  'Ho Chi Minh City': {
    latitude: 10.776,
    longitude: 106.701,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  'Da Nang': {
    latitude: 16.054,
    longitude: 108.202,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  },
  'Hai Phong': {
    latitude: 20.865,
    longitude: 106.684,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  'Can Tho': {
    latitude: 10.034,
    longitude: 105.788,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  },
} as const;
