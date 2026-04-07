// filename: src/services/propertyService.ts
import axios from 'axios';
import { MOCK_PROPERTIES, getPagedProperties } from '../data/mockProperties';
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

// ─── Mock delay helper ────────────────────────────────────────────────────
const simulateDelay = (ms = 600): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── GET PROPERTIES (paginated + filtered) ────────────────────────────────
export const getProperties = async (
  page     = 1,
  pageSize = 10,
  filters?: PropertyFilters
): Promise<PaginatedResponse<Property>> => {
  // TODO: uncomment when backend ready
  // const response = await apiClient.get('/properties', { params: { page, pageSize, ...filters } });
  // return response.data;

  await simulateDelay();
  const result = getPagedProperties(page, pageSize, filters as any);
  return { data: result.data, page, pageSize, total: result.total, hasNextPage: result.hasNextPage };
};

// ─── GET PROPERTY BY ID ───────────────────────────────────────────────────
export const getPropertyById = async (id: string): Promise<Property | null> => {
  // TODO: const response = await apiClient.get(`/properties/${id}`); return response.data;
  await simulateDelay(400);
  return MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
};

// ─── SEARCH PROPERTIES ────────────────────────────────────────────────────
export const searchProperties = async (
  query: SearchQuery,
  page     = 1,
  pageSize = 10
): Promise<PaginatedResponse<Property>> => {
  // TODO: const response = await apiClient.post('/properties/search', { query, page, pageSize }); return response.data;
  await simulateDelay(500);
  const keyword  = query.keyword.toLowerCase();
  let filtered   = MOCK_PROPERTIES.filter(
    (p) =>
      p.title.toLowerCase().includes(keyword) ||
      p.province.toLowerCase().includes(keyword) ||
      p.district.toLowerCase().includes(keyword) ||
      p.address.toLowerCase().includes(keyword)
  );
  if (query.filters) {
    const f = query.filters;
    if (f.province)     filtered = filtered.filter((p) => p.province === f.province);
    if (f.district)     filtered = filtered.filter((p) => p.district.toLowerCase().includes(f.district!.toLowerCase()));
    if (f.minPrice)     filtered = filtered.filter((p) => p.price >= f.minPrice!);
    if (f.maxPrice)     filtered = filtered.filter((p) => p.price <= f.maxPrice!);
    if (f.propertyType) filtered = filtered.filter((p) => p.propertyType === f.propertyType);
    if (f.minBedrooms)  filtered = filtered.filter((p) => p.bedrooms >= f.minBedrooms!);
    if (f.minArea)      filtered = filtered.filter((p) => p.area >= f.minArea!);
  }
  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    page, pageSize, total: filtered.length,
    hasNextPage: start + pageSize < filtered.length,
  };
};

// ─── GET MAP PROPERTIES (all, no pagination) ──────────────────────────────
export const getMapProperties = async (filters?: PropertyFilters): Promise<Property[]> => {
  // TODO: const response = await apiClient.get('/properties/map', { params: filters }); return response.data;
  await simulateDelay(300);
  let filtered = [...MOCK_PROPERTIES];
  if (filters?.province)     filtered = filtered.filter((p) => p.province === filters.province);
  if (filters?.propertyType) filtered = filtered.filter((p) => p.propertyType === filters.propertyType);
  return filtered;
};

export default apiClient;
