// filename: src/screens/FavoritesScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ListRenderItemInfo,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavorites } from '../features/favorite/useFavorites';
import { useAuthStore } from '../store/useAuthStore';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types/property';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Guest prompt ─────────────────────────────────────────────────────────────
const GuestPrompt: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <View style={styles.guestPrompt}>
    <Text style={styles.guestEmoji}>🔐</Text>
    <Text style={styles.guestTitle}>Đăng nhập để xem danh sách yêu thích</Text>
    <Text style={styles.guestSubtitle}>
      Lưu những bất động sản bạn thích và truy cập từ bất kỳ thiết bị nào
    </Text>
    <TouchableOpacity style={styles.guestBtn} onPress={onLogin} activeOpacity={0.85}>
      <Text style={styles.guestBtnText}>Đăng nhập ngay</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const FavoritesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { favoriteProperties, favoriteCount } = useFavorites();

  const goToLogin = () => navigation.navigate('Auth', { screen: 'Login' } as any);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Property>) => <PropertyCard property={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Property) => item.id, []);

  const ListHeader = useCallback(
    () => (
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Đã lưu ❤️</Text>
        <Text style={styles.headerSubtitle}>
          {isAuthenticated
            ? favoriteCount > 0
              ? `${favoriteCount} bất động sản đã lưu`
              : 'Chưa có bất động sản nào'
            : 'Đăng nhập để xem danh sách'}
        </Text>
      </View>
    ),
    [insets.top, favoriteCount, isAuthenticated],
  );

  const ListEmpty = useCallback(
    () =>
      isAuthenticated ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={styles.emptyTitle}>Chưa có bất động sản yêu thích</Text>
          <Text style={styles.emptySubtitle}>
            Nhấn vào biểu tượng ❤️ trên các tin đăng để lưu lại
          </Text>
        </View>
      ) : (
        <GuestPrompt onLogin={goToLogin} />
      ),
    [isAuthenticated],
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={isAuthenticated ? favoriteProperties : []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={320}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },

  // Guest prompt
  guestPrompt: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 40, gap: 12 },
  guestEmoji: { fontSize: 64, marginBottom: 4 },
  guestTitle: { fontSize: 18, fontWeight: '700', color: '#374151', textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  guestBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 32, marginTop: 8,
  },
  guestBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default FavoritesScreen;
