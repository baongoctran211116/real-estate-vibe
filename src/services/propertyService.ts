// filename: src/services/propertyService.ts
import axios from 'axios';
import { MOCK_PROPERTIES, getPagedProperties } from '../data/mockProperties';
import { Property, PropertyFilters, PaginatedResponse, SearchQuery } from '../types/property';

const BASE_URL = 'https://api.yourbackend.com/v1'; // Replace when backend is ready

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token when available
apiClient.interceptors.request.use((config) => {
  // const token = getAuthToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Simulate network delay for realistic mock behavior ───
const simulateDelay = (ms = 600): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── GET PROPERTIES (paginated + filtered) ────────────────
export const getProperties = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: PropertyFilters
): Promise<PaginatedResponse<Property>> => {
  await simulateDelay();

  // TODO: Replace with real API call when backend is ready:
  // const response = await apiClient.get('/properties', {
  //   params: { page, pageSize, ...filters },
  // });
  // return response.data;

  const result = getPagedProperties(page, pageSize, filters as any);
  return {
    data: result.data,
    page,
    pageSize,
    total: result.total,
    hasNextPage: result.hasNextPage,
  };
};

// ─── GET PROPERTY BY ID ───────────────────────────────────
export const getPropertyById = async (id: string): Promise<Property | null> => {
  await simulateDelay(400);

  // TODO: Replace with real API call:
  // const response = await apiClient.get(`/properties/${id}`);
  // return response.data;

  const property = MOCK_PROPERTIES.find((p) => p.id === id) ?? null;
  return property;
};

// ─── SEARCH PROPERTIES ────────────────────────────────────
export const searchProperties = async (
  query: SearchQuery,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Property>> => {
  await simulateDelay(500);

  // TODO: Replace with real API call:
  // const response = await apiClient.post('/properties/search', { query, page, pageSize });
  // return response.data;

  const keyword = query.keyword.toLowerCase();
  let filtered = MOCK_PROPERTIES.filter(
    (p) =>
      p.title.toLowerCase().includes(keyword) ||
      p.province.toLowerCase().includes(keyword) ||
      p.district.toLowerCase().includes(keyword) ||
      p.address.toLowerCase().includes(keyword)
  );

  if (query.filters) {
    const f = query.filters;
    if (f.province) filtered = filtered.filter((p) => p.province === f.province);
    if (f.district) filtered = filtered.filter((p) => p.district.toLowerCase().includes(f.district!.toLowerCase()));
    if (f.minPrice) filtered = filtered.filter((p) => p.price >= f.minPrice!);
    if (f.maxPrice) filtered = filtered.filter((p) => p.price <= f.maxPrice!);
    if (f.propertyType) filtered = filtered.filter((p) => p.propertyType === f.propertyType);
    if (f.minBedrooms) filtered = filtered.filter((p) => p.bedrooms >= f.minBedrooms!);
    if (f.minArea) filtered = filtered.filter((p) => p.area >= f.minArea!);
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: filtered.slice(start, end),
    page,
    pageSize,
    total: filtered.length,
    hasNextPage: end < filtered.length,
  };
};

// ─── GET MAP PROPERTIES (all, no pagination) ──────────────
export const getMapProperties = async (
  filters?: PropertyFilters
): Promise<Property[]> => {
  await simulateDelay(300);

  // TODO: Replace with real API call:
  // const response = await apiClient.get('/properties/map', { params: filters });
  // return response.data;

  let filtered = [...MOCK_PROPERTIES];
  if (filters?.province) filtered = filtered.filter((p) => p.province === filters.province);
  if (filters?.propertyType) filtered = filtered.filter((p) => p.propertyType === filters.propertyType);
  return filtered;
};

export default apiClient;
