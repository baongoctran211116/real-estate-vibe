// filename: src/store/useFilterStore.ts
import { create } from 'zustand';
import { PropertyFilters, } from '../types/property';

interface FilterState {
  filters: PropertyFilters;
  searchKeyword: string;
  mapFlyToTarget: {
    lat: number;
    lng: number;
    zoom: number;
    timestamp: number;
  } | null;

  setFilter:        <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters:     () => void;
  hasActiveFilters: () => boolean;
  flyMapTo:         (lat: number, lng: number, zoom: number) => void;
  clearMapFlyTo:    () => void;
}

const DEFAULT_FILTERS: PropertyFilters = {};

export const useFilterStore = create<FilterState>((set, get) => ({
  filters:        DEFAULT_FILTERS,
  searchKeyword:  '',
  mapFlyToTarget: null,

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, searchKeyword: '' }),

  hasActiveFilters: () => {
    const { filters, searchKeyword } = get();
    return (
      searchKeyword.trim().length > 0 ||
      Object.values(filters).some((v) => v !== undefined && v !== null && v !== '')
    );
  },

  flyMapTo: (lat, lng, zoom) =>
    set({ mapFlyToTarget: { lat, lng, zoom, timestamp: Date.now() } }),

  clearMapFlyTo: () => set({ mapFlyToTarget: null }),
}));
