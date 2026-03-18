// filename: src/features/auth/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { LoginPayload, RegisterPayload } from '../../types/auth';

// ─── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const setUserFavorites = useFavoriteStore((s) => s.setUserFavorites);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: async ({ user, token }) => {
      setUser(user, token);
      // Load favorites từ server sau khi login thành công
      const ids = await authService.getUserFavorites(user.id);
      setUserFavorites(user.id, ids);
    },
  });
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const setUserFavorites = useFavoriteStore((s) => s.setUserFavorites);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: async ({ user, token }) => {
      setUser(user, token);
      setUserFavorites(user.id, []); // Tài khoản mới, favorites rỗng
    },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function useLogout() {
  const { user, logout } = useAuthStore((s) => ({ user: s.user, logout: s.logout }));
  const { clearUserFavorites, getFavoriteIds } = useFavoriteStore((s) => ({
    clearUserFavorites: s.clearUserFavorites,
    getFavoriteIds: s.getFavoriteIds,
  }));

  return useMutation({
    mutationFn: async () => {
      // Sync favorites lên server trước khi logout
      if (user) {
        const ids = getFavoriteIds(user.id);
        await authService.syncFavorites(user.id, ids);
      }
      await authService.logout();
    },
    onSuccess: () => {
      if (user) clearUserFavorites(user.id);
      logout(); // clear Zustand store → AppNavigator tự render lại guest mode
    },
  });
}

// ─── Restore session khi app khởi động ───────────────────────────────────────
// Gọi hook này trong AppProviders hoặc SplashScreen
// Tự động: check AsyncStorage → verify với server → refresh token nếu cần
export function useRestoreSession() {
  const setUser = useAuthStore((s) => s.setUser);
  const setUserFavorites = useFavoriteStore((s) => s.setUserFavorites);

  return useQuery({
    queryKey: ['auth', 'restoreSession'],
    queryFn: async () => {
      const session = await authService.restoreSession();
      if (session) {
        setUser(session.user, session.token);
        const ids = await authService.getUserFavorites(session.user.id);
        setUserFavorites(session.user.id, ids);
      }
      return session;
    },
    staleTime: Infinity, // Chỉ chạy 1 lần khi mount
    retry: false,
  });
}
