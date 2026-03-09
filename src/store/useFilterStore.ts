// filename: src/store/useFilterStore.ts
import { create } from 'zustand';
import { PropertyFilters, Province, PropertyType } from '../types/property';

interface FilterState {
  filters: PropertyFilters;
  searchKeyword: string;
  setFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const DEFAULT_FILTERS: PropertyFilters = {};

export const useFilterStore = create<FilterState>((set, get) => ({
  filters: DEFAULT_FILTERS,
  searchKeyword: '',

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  setSearchKeyword: (keyword: string) => {
    set({ searchKeyword: keyword });
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, searchKeyword: '' });
  },

  hasActiveFilters: () => {
    const { filters, searchKeyword } = get();
    return (
      searchKeyword.trim().length > 0 ||
      Object.values(filters).some((v) => v !== undefined && v !== null && v !== '')
    );
  },
}));

// Convenience selectors
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
  { label: 'Under 2B', min: 0, max: 2_000_000_000 },
  { label: '2B – 5B', min: 2_000_000_000, max: 5_000_000_000 },
  { label: '5B – 10B', min: 5_000_000_000, max: 10_000_000_000 },
  { label: 'Above 10B', min: 10_000_000_000, max: 999_000_000_000 },
];
