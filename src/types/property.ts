// filename: src/types/property.ts
export type PropertyType = 'apartment' | 'house' | 'villa' | 'townhouse' | 'land';

export type Province =
  | 'Hanoi'
  | 'Ho Chi Minh City'
  | 'Da Nang'
  | 'Hai Phong'
  | 'Can Tho';

export interface Property {
  id: string;
  title: string;
  price: number; // VND
  province: Province;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  area: number; // m²
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  images: string[];
  description: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface PropertyFilters {
  province?: Province;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  minBedrooms?: number;
  minArea?: number;
  start?:number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface SearchQuery {
  keyword: string;
  filters?: PropertyFilters;
}
