// filename: src/store/useFilterStore.ts
import { create } from 'zustand';
import { PropertyFilters, Province, PropertyType } from '../types/property';

interface FilterState {
  filters: PropertyFilters;
  searchKeyword: string;
  // Mới: trigger fly-to map từ bất kỳ screen nào
  mapFlyToTarget: {
    lat: number;
    lng: number;
    zoom: number;
    timestamp: number; // force re-trigger dù cùng tọa độ
  } | null;

  setFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
  flyMapTo: (lat: number, lng: number, zoom: number) => void;
  clearMapFlyTo: () => void;
}

const DEFAULT_FILTERS: PropertyFilters = {};

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: DEFAULT_FILTERS,
  searchKeyword: '',
  mapFlyToTarget: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, searchKeyword: '' }),

  hasActiveFilters: () => {
    const { filters, searchKeyword } = get();
    return (
      searchKeyword.trim().length > 0 ||
      Object.values(filters).some((v) => v !== undefined && v !== null && v !== '')
    );
  },

  flyMapTo: (lat, lng, zoom) => {
    set({ mapFlyToTarget: { lat, lng, zoom, timestamp: Date.now() } });
  },

  clearMapFlyTo: () => set({ mapFlyToTarget: null }),
}));

// ─── Constants ────────────────────────────────────────────
export const PROVINCES: Province[] = [
  'Hanoi',
  'Ho Chi Minh City',
  'Da Nang',
  'Hai Phong',
  'Can Tho',
];

export const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Villa', value: 'villa' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Land', value: 'land' },
];

export const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: 'Dưới 2 tỷ',    min: 0,              max: 2_000_000_000 },
  { label: '2 – 5 tỷ',     min: 2_000_000_000,  max: 5_000_000_000 },
  { label: '5 – 10 tỷ',    min: 5_000_000_000,  max: 10_000_000_000 },
  { label: 'Trên 10 tỷ',   min: 10_000_000_000, max: 999_000_000_000 },
];

export const PROVINCE_REGIONS: Record<Province, { lat: number; lng: number; zoom: number }> = {
  'Hanoi':              { lat: 21.028,  lng: 105.854, zoom: 13 },
  'Ho Chi Minh City':   { lat: 10.776,  lng: 106.701, zoom: 13 },
  'Da Nang':            { lat: 16.054,  lng: 108.202, zoom: 13 },
  'Hai Phong':          { lat: 20.865,  lng: 106.684, zoom: 13 },
  'Can Tho':            { lat: 10.034,  lng: 105.788, zoom: 13 },
};