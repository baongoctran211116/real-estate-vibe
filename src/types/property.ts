// filename: src/types/property.ts

import {usePropertyTypeOptions} from '../features/appConfig/useAppConfig';
export type PropertyType = ReturnType<typeof usePropertyTypeOptions>[number]['value'];

//export type PropertyType = 'apartment' | 'house' | 'villa' | 'townhouse' | 'land';

// Province không còn hardcode enum — là string dynamic từ server
export type Province = string;

// ─── Province với metadata map (từ API) ──────────────────────────────────────
export interface ProvinceInfo {
  /** Tên chuẩn (key dùng khắp app, VD: "Ho Chi Minh City") */
  name: Province;
  /** Nhãn hiển thị ngắn gọn (VD: "TP.HCM") */
  displayName: string;
  /** Tọa độ trung tâm */
  lat: number;
  lng: number;
  /** Zoom level mặc định khi flyTo tỉnh này */
  zoom: number;
}

// ─── Property ─────────────────────────────────────────────────────────────────
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
  isHighlighted?: boolean;
}

export interface PropertyFilters {
  province?: Province;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  minBedrooms?: number;
  minArea?: number;
  start?: number;
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
