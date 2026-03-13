// filename: src/features/auth/useAuth.ts
import { useMutation } from '@tanstack/react-query';
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
      // Load favorites của user từ server
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
      logout();
      // AppNavigator tự render lại về guest mode
    },
  });
}
