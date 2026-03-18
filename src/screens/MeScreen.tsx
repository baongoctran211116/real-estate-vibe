// filename: src/screens/MeScreen.tsx
import React from 'react';


//TODO DEBUG: Test tokenStorage trực tiếp tại đây để tránh lỗi async khi logout/login
import { tokenStorage } from '@/services/authService';
// Dán vào bất kỳ component nào để test
tokenStorage.getAccessToken().then(t => console.log('token:', t));
tokenStorage.getUser().then(u => console.log('user:', u));
tokenStorage.getRefreshToken().then(t => console.log('refreshToken:', t));

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useLogout } from '../features/auth/useAuth';
import { useFavoriteStore } from '../store/useFavoriteStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];
const getAvatarColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};
const getInitials = (name: string) => {
  const p = name.trim().split(' ').filter(Boolean);
  if (!p.length) return '?';
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const Avatar: React.FC<{ name: string; avatarUrl?: string; size?: number }> = ({
  name, avatarUrl, size = 60,
}) => {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: getAvatarColor(name) }]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
    </View>
  );
};

// ─── MenuItem ─────────────────────────────────────────────────────────────────
interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  loading?: boolean;
}
const MenuItem: React.FC<MenuItemProps> = ({ icon, label, value, onPress, danger, loading }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7} disabled={loading}>
    <View style={styles.menuItemLeft}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {loading
        ? <ActivityIndicator size="small" color="#EF4444" />
        : <>{value && <Text style={styles.menuValue}>{value}</Text>}<Text style={[styles.menuArrow, danger && styles.menuArrowDanger]}>›</Text></>
      }
    </View>
  </TouchableOpacity>
);

// ─── Guest banner ─────────────────────────────────────────────────────────────
const GuestBanner: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <View style={styles.guestBanner}>
    <View style={styles.guestAvatarCircle}>
      <Text style={styles.guestAvatarEmoji}>👤</Text>
    </View>
    <View style={styles.guestInfo}>
      <Text style={styles.guestTitle}>Bạn chưa đăng nhập</Text>
      <Text style={styles.guestSubtitle}>Đăng nhập để lưu BĐS yêu thích, xem lịch sử và nhiều hơn nữa</Text>
    </View>
    <TouchableOpacity style={styles.loginBtn} onPress={onLogin} activeOpacity={0.85}>
      <Text style={styles.loginBtnText}>Đăng nhập</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const MeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, isAuthenticated } = useAuthStore((s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }));
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const favoriteCount = useFavoriteStore((s) => s.getFavoriteCount(user?.id));

  const goToLogin = () => navigation.navigate('Auth', { screen: 'Login' } as any);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </View>

        {/* Profile or Guest */}
        {isAuthenticated && user ? (
          <>
            <View style={styles.profileCard}>
              <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size={60} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>{user.fullName}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
                {user.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editBtnText}>Sửa</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{favoriteCount}</Text>
                <Text style={styles.statLabel}>Đã lưu</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Đã xem</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Giao dịch</Text>
              </View>
            </View>
          </>
        ) : (
          <GuestBanner onLogin={goToLogin} />
        )}

        {/* Settings - luôn hiện */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupTitle}>Cài đặt</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="🔔" label="Thông báo" />
            <View style={styles.divider} />
            <MenuItem icon="🔒" label="Bảo mật & Quyền riêng tư" />
            <View style={styles.divider} />
            <MenuItem icon="🌐" label="Ngôn ngữ" value="Tiếng Việt" />
          </View>
        </View>

        <View style={styles.menuGroup}>
          <Text style={styles.groupTitle}>Hỗ trợ</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="❓" label="Trung tâm hỗ trợ" />
            <View style={styles.divider} />
            <MenuItem icon="📞" label="Liên hệ chúng tôi" />
            <View style={styles.divider} />
            <MenuItem icon="⭐" label="Đánh giá ứng dụng" />
          </View>
        </View>

        {/* Auth actions */}
        <View style={styles.menuGroup}>
          <View style={styles.menuCard}>
            {isAuthenticated ? (
              <MenuItem
                icon="🚪"
                label="Đăng xuất"
                danger
                onPress={handleLogout}
                loading={isLoggingOut}
              />
            ) : (
              <>
                <MenuItem icon="🔑" label="Đăng nhập" onPress={goToLogin} />
                <View style={styles.divider} />
                <MenuItem icon="✏️" label="Tạo tài khoản" onPress={() => navigation.navigate('Auth', { screen: 'Register' } as any)} />
              </>
            )}
          </View>
        </View>

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },

  // Authenticated profile
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 2, gap: 14,
  },
  avatarCircle: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#FFFFFF', fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  profilePhone: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  editBtn: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE',
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },

  // Guest banner
  guestBanner: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 18,
    marginBottom: 2, gap: 10,
  },
  guestAvatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 4,
  },
  guestAvatarEmoji: { fontSize: 28 },
  guestInfo: { gap: 4 },
  guestTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  guestSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  loginBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', marginTop: 8,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 16, marginBottom: 16,
  },
  statsRowGuest: { opacity: 0.4 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#2563EB' },
  statNumberGuest: { color: '#9CA3AF' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB', alignSelf: 'center' },

  // Menu
  menuGroup: { marginBottom: 16, paddingHorizontal: 16 },
  groupTitle: {
    fontSize: 12, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 15, color: '#111827', fontWeight: '500' },
  menuLabelDanger: { color: '#EF4444' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuValue: { fontSize: 13, color: '#6B7280' },
  menuArrow: { fontSize: 20, color: '#9CA3AF' },
  menuArrowDanger: { color: '#FCA5A5' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 46 },
  version: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', paddingVertical: 24 },
});

export default MeScreen;