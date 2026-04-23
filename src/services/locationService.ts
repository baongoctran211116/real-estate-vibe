// filename: src/services/locationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './propertyService';

const DEVICE_ID_KEY = 'device_id';

/**
 * Lấy hoặc tạo mới một device ID ẩn danh và lưu vào AsyncStorage.
 * Nếu user đã login, ưu tiên dùng user.id.
 */
export const getOrCreateDeviceId = async (userId?: string | null): Promise<string> => {
  if (userId) return userId;

  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;

  const generated =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
};

/**
 * Gửi tọa độ hiện tại của người dùng (hoặc thiết bị) lên server.
 * Fire-and-forget — bắt lỗi nội bộ, không ném ra ngoài.
 *
 * @param lat      Vĩ độ
 * @param lon      Kinh độ
 * @param userId   ID của user đang đăng nhập (nếu có)
 */
export const submitLocation = async (
  lat: number,
  lon: number,
  userId?: string | null,
): Promise<void> => {
  try {
    const id = await getOrCreateDeviceId(userId);
    await apiClient.post('/v1/api/submitLc', { lat, lon, id });
  } catch (e) {
    console.warn('[locationService] submitLocation error:', e);
  }
};
