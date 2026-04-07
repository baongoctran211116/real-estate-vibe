// filename: src/services/provinceService.ts
// ─── Province Service — tất cả data tỉnh/thành đọc từ server ─────────────────
import apiClient from './propertyService';
import { ProvinceInfo } from '../types/property';

// ─── Response shape từ server ─────────────────────────────────────────────────
// GET /provinces
// [
//   {
//     "name": "Ho Chi Minh City",
//     "displayName": "TP.HCM",
//     "lat": 10.7769,
//     "lng": 106.7009,
//     "zoom": 12
//   },
//   ...
// ]

/**
 * Lấy danh sách tỉnh/thành kèm metadata (tọa độ, zoom) từ server.
 * Dùng làm nguồn duy nhất cho PROVINCES, PROVINCE_REGIONS, PROVINCE_ZOOM.
 */
export const getProvinces = async (): Promise<ProvinceInfo[]> => {
  const response = await apiClient.get<ProvinceInfo[]>('/v1/api/provinces');
  return response.data;
};
