// filename: src/services/authService.ts
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginPayload, RegisterPayload, AuthResponse, AuthError } from '../types/auth';

// ─── Base URL ─────────────────────────────────────────────────────────────────
export const API_BASE_URL = 'http://192.168.1.16:8080';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  ACCESS_TOKEN:  '@auth/access_token',
  REFRESH_TOKEN: '@auth/refresh_token',
  USER:          '@auth/user',
} as const;

// ─── Axios instance dành riêng cho auth ───────────────────────────────────────
export const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// TODO DEBUG: Thêm ngay dưới dòng tạo authApiClient
authApiClient.interceptors.request.use((config) => {  
  console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log(`[API →] body:`, JSON.stringify(config.data));
  console.log(`[API →] headers:`, JSON.stringify(config.headers));
  return config;
});

authApiClient.interceptors.response.use(
  (res) => {
    console.log(`[API ←] ${res.status} ${res.config.url}`);
    console.log(`[API ←] data:`, JSON.stringify(res.data));
    return res;
  },
  (err) => {
    console.log(`[API ✗] ${err.response?.status} ${err.config?.url}`);
    console.log(`[API ✗] error:`, JSON.stringify(err.response?.data));
    return Promise.reject(err);
  }
);

// ─── Token storage helpers ────────────────────────────────────────────────────
export const tokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN,  accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },

  async saveUser(user: AuthResponse['user']): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<AuthResponse['user'] | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
};

// ─── Normalize lỗi từ server về AuthError shape ───────────────────────────────
// Spring Boot thường trả: { message, field } hoặc { error, message } hoặc string
function normalizeError(err: unknown): AuthError {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (!data) {
      return { message: 'Không thể kết nối máy chủ. Kiểm tra lại mạng.' };
    }
    if (typeof data === 'object') {
      return {
        message: data.message ?? data.error ?? 'Có lỗi xảy ra',
        field:   data.field,
      };
    }
    if (typeof data === 'string') {
      return { message: data };
    }
  }
  if (err instanceof Error) return { message: err.message };
  return { message: 'Có lỗi không xác định' };
}

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {

  // ── Login → POST /api/auth/login ──────────────────────────────────────────
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const res = await authApiClient.post<{
        accessToken:  string;
        refreshToken: string;
        user: AuthResponse['user'];
      }>('/v1/auth/login', {
        email:    payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      const { accessToken, refreshToken, user } = res.data;

      await tokenStorage.saveTokens(accessToken, refreshToken);
      await tokenStorage.saveUser(user);

      // Trả về AuthResponse { user, token } — token = accessToken
      return { user, token: accessToken };

    } catch (err) {
      throw normalizeError(err);
    }
  },

  // ── Register → POST /api/auth/register ───────────────────────────────────
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const res = await authApiClient.post<{
        accessToken:  string;
        refreshToken: string;
        user: AuthResponse['user'];
      }>('/v1/auth/register', {
        email:    payload.email.trim().toLowerCase(),
        password: payload.password,
        fullName: payload.fullName.trim(),
        phone:    payload.phone?.trim() || undefined,
      });

      const { accessToken, refreshToken, user } = res.data;

      await tokenStorage.saveTokens(accessToken, refreshToken);
      await tokenStorage.saveUser(user);

      return { user, token: accessToken };

    } catch (err) {
      throw normalizeError(err);
    }
  },

  // ── Logout → POST /api/auth/logout ───────────────────────────────────────
  async logout(): Promise<void> {
    try {
      const accessToken = await tokenStorage.getAccessToken();
      if (accessToken) {
        // Gọi server blacklist token (fire-and-forget, không block UI nếu lỗi)
        await authApiClient.post(
          '/v1/auth/logout',
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } },
        ).catch(() => { /* bỏ qua lỗi network khi logout */ });
      }
    } finally {
      // Luôn clear local storage dù server có lỗi
      await tokenStorage.clearTokens();
    }
  },

  // ── Refresh token → POST /api/auth/refresh-token ─────────────────────────
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) return null;

      const res = await authApiClient.post<{
        accessToken:  string;
        refreshToken: string;
      }>('/v1/auth/refresh-token', { refreshToken });

      const { accessToken, refreshToken: newRefreshToken } = res.data;
      await tokenStorage.saveTokens(accessToken, newRefreshToken);
      return accessToken;

    } catch {
      // Refresh token hết hạn → clear hết, user phải login lại
      await tokenStorage.clearTokens();
      return null;
    }
  },

  // ── Khôi phục session khi app khởi động lại ──────────────────────────────
  // Gọi thay cho verifyToken() cũ — dùng trong AppProviders hoặc SplashScreen
  async restoreSession(): Promise<AuthResponse | null> {
    try {
      const [accessToken, cachedUser] = await Promise.all([
        tokenStorage.getAccessToken(),
        tokenStorage.getUser(),
      ]);

      if (!accessToken || !cachedUser) return null;

      // Verify token với server và lấy user mới nhất
      const res = await authApiClient.get<AuthResponse['user']>(
        '/v1/users/me',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      await tokenStorage.saveUser(res.data);
      return { user: res.data, token: accessToken };

    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        // Access token hết hạn → thử refresh
        const newToken = await authService.refreshToken();
        if (!newToken) return null;

        const user = await tokenStorage.getUser();
        if (!user) return null;
        return { user, token: newToken };
      }
      // Lỗi network → dùng cache offline
      const [token, user] = await Promise.all([
        tokenStorage.getAccessToken(),
        tokenStorage.getUser(),
      ]);
      if (token && user) return { user, token };
      return null;
    }
  },

  // ── Update profile → PUT /api/users/me ───────────────────────────────────
  async updateProfile(
    _userId: string,
    partial: { fullName?: string; phone?: string },
  ): Promise<void> {
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) throw { message: 'Chưa đăng nhập' } as AuthError;

    try {
      const res = await authApiClient.put<AuthResponse['user']>(
        '/v1/users/me',
        partial,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      await tokenStorage.saveUser(res.data);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  // ── Lấy danh sách favorites → GET /api/users/me/favorites ────────────────
  async getUserFavorites(_userId: string): Promise<string[]> {
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) return [];

    try {
      const res = await authApiClient.get<{ data: string[] }>(
        '/v1/favorites',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  // ── Sync favorites → PUT /v1/favorites/sync ────────────────────
  async syncFavorites(_userId: string, favoriteIds: string[]): Promise<void> {
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) return;

    try {
      await authApiClient.put(
        '/v1/favorites/sync',
        { favoriteIds },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch {
      // Sync thất bại khi logout không block flow
    }
  },
};
