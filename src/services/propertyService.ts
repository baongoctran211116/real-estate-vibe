// filename: src/services/propertyService.ts
import axios from 'axios';
import { Property, PropertyFilters, PaginatedResponse, SearchQuery } from '../types/property';
import { BASE_URL } from '../utils/Constants';

// ─── Base URL — đổi thành domain thật khi backend sẵn sàng ──────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // const token = getAuthToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Error interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err?.response?.data ?? err.message);
    return Promise.reject(err);
  }
);

// ── Dev logging (strip in production via __DEV__ guard) ───────────────────
if (__DEV__) {
  apiClient.interceptors.request.use((config) => {
    console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
  apiClient.interceptors.response.use((res) => {
    console.log(`[API ←] ${res.status} ${res.config.url}`);
    return res;
  });
}

// ─── GET PROPERTIES (paginated + filtered) ────────────────────────────────
export const getProperties = async (
  page = 1,
  pageSize = 10,
  filters?: PropertyFilters
): Promise<PaginatedResponse<Property>> => {
  const response = await apiClient.get<{ errorCode: number; data: PaginatedResponse<Property> }>('/v1/api/properties', {
    params: { page, pageSize, ...filters },
  });
  return response.data.data;
};

// ─── GET PROPERTY BY ID ───────────────────────────────────────────────────
export const getPropertyById = async (id: string): Promise<Property | null> => {
  const response = await apiClient.get<{ errorCode: number; data: Property }>(`/v1/api/properties/${id}`);
  return response.data.data;
};

// ─── SEARCH PROPERTIES ────────────────────────────────────────────────────
export const searchProperties = async (
  query: SearchQuery,
  page = 1,
  pageSize = 10
): Promise<PaginatedResponse<Property>> => {
  const response = await apiClient.post<{ errorCode: number; data: PaginatedResponse<Property> }>('/v1/api/properties/search', {
    query,
    page,
    pageSize,
  });
  return response.data.data;
};

// ─── GET MAP PROPERTIES (all, no pagination) ──────────────────────────────
export const getMapProperties = async (filters?: PropertyFilters): Promise<Property[]> => {
  const response = await apiClient.get<{ errorCode: number; data: Property[] }>('/v1/api/properties/map', {
    params: filters,
  });
  return response.data.data;
};

// ─── GET PROPERTIES BY IDS (batch — dùng cho Favorites) ─────────────────────
// Server trả về chỉ các property có id nằm trong danh sách.
// Mock API trả toàn bộ map.json; hook phía client tự filter theo ids.
export const getPropertiesByIds = async (ids: string[]): Promise<Property[]> => {
  if (ids.length === 0) return [];
  const response = await apiClient.get<{errorCode: number; data: Property[]}>('/v1/api/properties/batch', {
    params: { ids: ids.join(',') },
  });
  return response.data.data;
};

export default apiClient;
