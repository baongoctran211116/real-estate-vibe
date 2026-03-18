// filename: src/types/auth.ts

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string; // accessToken — giữ tên cũ để không break useAuthStore / useAuth
}

export interface AuthError {
  message: string;
  field?: string; // tên field lỗi, highlight đúng input
}
