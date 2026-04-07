// filename: src/features/province/useProvinces.ts
// ─── Hook duy nhất để đọc province data trong toàn app ───────────────────────
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getProvinces } from '../../services/provinceService';
import { ProvinceInfo, Province } from '../../types/property';
import { QUERY_KEYS, STALE_TIME} from '../../utils/Constants';

export const useProvinces = () => {
  const query = useQuery<ProvinceInfo[]>({
    queryKey: QUERY_KEYS.provinces,
    queryFn:  getProvinces,
    staleTime: STALE_TIME.provinces,
    // Không retry quá nhiều — nếu lỗi hiện empty state gracefully
    retry: 2,
  });

  /**
   * Danh sách tên province (string[]) — dùng cho pills, dropdown
   */
  const provinceNames = useMemo<Province[]>(
    () => (query.data ?? []).map((p) => p.name),
    [query.data]
  );

  /**
   * Map name → ProvinceInfo — O(1) lookup thay cho Array.find
   */
  const provinceMap = useMemo<Record<Province, ProvinceInfo>>(() => {
    const map: Record<string, ProvinceInfo> = {};
    for (const p of query.data ?? []) map[p.name] = p;
    return map;
  }, [query.data]);

  /**
   * Tra tọa độ + zoom theo tên tỉnh.
   * Trả về null nếu không tìm thấy (caller tự fallback về MAP_DEFAULTS).
   */
  const getProvinceView = (name: Province): { lat: number; lng: number; zoom: number } | null => {
    const info = provinceMap[name];
    if (!info) return null;
    return { lat: info.lat, lng: info.lng, zoom: info.zoom };
  };

  /**
   * Nhãn hiển thị ngắn (displayName) theo tên tỉnh.
   * Fallback về chính name nếu chưa load.
   */
  const getDisplayName = (name: Province): string =>
    provinceMap[name]?.displayName ?? name;

  return {
    provinces:    query.data ?? [],
    provinceNames,
    provinceMap,
    getProvinceView,
    getDisplayName,
    isLoading: query.isLoading,
    isError:   query.isError,
  };
};
