// filename: src/services/appConfigService.ts
// ─── Fetch remote app config từ server ───────────────────────────────────────
import axios from 'axios';
import { AppConfig } from '../types/appConfig';
import { FALLBACK_CONFIG, BASE_URL} from '../utils/Constants';

import configClient from './propertyService';
// Client riêng — không cần auth interceptor, gọi sớm nhất có thể
const configClient1 = axios.create({
  baseURL: BASE_URL,
  timeout: 8_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * GET /app-config
 *
 * Trả về toàn bộ runtime config: map defaults, property types,
 * price ranges, theme colors, pagination, search debounce…
 *
 * Khi lỗi mạng hoặc server 5xx → trả FALLBACK_CONFIG thay vì throw,
 * app vẫn chạy được với giá trị mặc định.
 */
export const fetchAppConfig = async (): Promise<AppConfig> => {
  try {
    const res = await configClient.get<AppConfig>('/v1/config/app');
    // Merge với fallback để đảm bảo các field mới được thêm về sau không bị undefined
    console.log('[AppConfig] fetched remote config1:', res.data);    
    //return deepMerge(FALLBACK_CONFIG, res.data);
    return res.data;
  } catch (err) {
    if (__DEV__) console.warn('[AppConfig] fetch failed, using fallback:', err);
    return FALLBACK_CONFIG;
  }
};

// ─── Lightweight deep-merge (chỉ plain object, không cần lodash) ──────────────
function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const bVal = base[key];
    const oVal = override[key];
    if (
      oVal !== undefined &&
      oVal !== null &&
      typeof oVal === 'object' &&
      !Array.isArray(oVal) &&
      typeof bVal === 'object' &&
      bVal !== null &&
      !Array.isArray(bVal)
    ) {
      result[key] = deepMerge(bVal as object, oVal as object) as T[keyof T];
    } else if (oVal !== undefined) {
      result[key] = oVal as T[keyof T];
    }
  }
  return result;
}
