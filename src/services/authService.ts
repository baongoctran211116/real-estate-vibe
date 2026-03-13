// filename: src/services/authService.ts
import { LoginPayload, RegisterPayload, AuthResponse, AuthError } from '../types/auth';
import { signJwt, verifyJwt } from '../utils/jwt';

// ─── Mock database ────────────────────────────────────────────────────────────
const MOCK_USERS: Array<{
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}> = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'Demo@123',
    fullName: 'Nguyễn Văn Demo',
    phone: '0901234567',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// Per-user data store (favorites, history...)
const USER_DATA: Record<string, { favoriteIds: string[]; viewedIds: string[] }> = {
  '1': { favoriteIds: ['2', '5', '10', '12', '18'], viewedIds: [] },
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Validation helpers
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const isValidPhone = (p: string) => /^0[35789][0-9]{8}$/.test(p.trim());
const isStrongPassword = (pw: string) =>
  pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);

export const authService = {
  // ─── Login → trả JWT ─────────────────────────────────────────────────────
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay(800);

    if (!payload.email.trim() || !payload.password.trim()) {
      throw { message: 'Vui lòng nhập đầy đủ thông tin' } as AuthError;
    }

    const found = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === payload.email.trim().toLowerCase() &&
        u.password === payload.password,
    );

    if (!found) {
      throw { message: 'Email hoặc mật khẩu không đúng', field: 'email' } as AuthError;
    }

    const { password, ...user } = found;

    // Tạo JWT
    const token = signJwt({ sub: user.id, email: user.email });

    return { user, token };
  },

  // ─── Register → trả JWT ──────────────────────────────────────────────────
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay(1000);

    if (!payload.fullName.trim() || payload.fullName.trim().length < 2)
      throw { message: 'Họ tên phải có ít nhất 2 ký tự', field: 'fullName' } as AuthError;
    if (!isValidEmail(payload.email))
      throw { message: 'Email không hợp lệ', field: 'email' } as AuthError;
    if (payload.phone && !isValidPhone(payload.phone))
      throw { message: 'Số điện thoại VN không hợp lệ (vd: 0901234567)', field: 'phone' } as AuthError;
    if (!isStrongPassword(payload.password))
      throw { message: 'Mật khẩu tối thiểu 8 ký tự, có chữ hoa và số', field: 'password' } as AuthError;
    if (payload.password !== payload.confirmPassword)
      throw { message: 'Mật khẩu xác nhận không khớp', field: 'confirmPassword' } as AuthError;

    const exists = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase(),
    );
    if (exists)
      throw { message: 'Email này đã được đăng ký', field: 'email' } as AuthError;

    const newUser = {
      id: String(Date.now()),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      phone: payload.phone?.trim(),
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    // Khởi tạo data rỗng cho user mới
    USER_DATA[newUser.id] = { favoriteIds: [], viewedIds: [] };

    const { password, ...user } = newUser;
    const token = signJwt({ sub: user.id, email: user.email });

    return { user, token };
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  async logout(): Promise<void> {
    await delay(200);
    // Trong production: gọi API blacklist token
  },

  // ─── Verify token (dùng khi app khởi động lại) ───────────────────────────
  async verifyToken(token: string): Promise<AuthResponse | null> {
    await delay(300);
    const payload = verifyJwt(token);
    if (!payload) return null;

    const user = MOCK_USERS.find((u) => u.id === payload.sub);
    if (!user) return null;

    const { password, ...userData } = user;
    return { user: userData, token };
  },

  // ─── Update profile ───────────────────────────────────────────────────────
  async updateProfile(
    userId: string,
    partial: { fullName?: string; phone?: string },
  ): Promise<void> {
    await delay(600);
    const idx = MOCK_USERS.findIndex((u) => u.id === userId);
    if (idx !== -1) MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...partial };
  },

  // ─── Per-user favorites (server-side) ────────────────────────────────────
  async getUserFavorites(userId: string): Promise<string[]> {
    await delay(200);
    return USER_DATA[userId]?.favoriteIds ?? [];
  },

  async syncFavorites(userId: string, favoriteIds: string[]): Promise<void> {
    await delay(200);
    if (!USER_DATA[userId]) USER_DATA[userId] = { favoriteIds: [], viewedIds: [] };
    USER_DATA[userId].favoriteIds = favoriteIds;
  },
};
