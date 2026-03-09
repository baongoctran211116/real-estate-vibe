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
import { useFavorites } from '../features/favorite/useFavorites';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types/property';

const FavoritesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { favoriteProperties, favoriteCount } = useFavorites();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Property>) => <PropertyCard property={item} />,
    []
  );

  const keyExtractor = useCallback((item: Property) => item.id, []);

  const ListHeader = useCallback(
    () => (
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Yêu thích ❤️</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteCount > 0
            ? `${favoriteCount} bất động sản đã lưu`
            : 'Chưa có bất động sản nào'}
        </Text>
      </View>
    ),
    [insets.top, favoriteCount]
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🤍</Text>
        <Text style={styles.emptyTitle}>Chưa có bất động sản yêu thích</Text>
        <Text style={styles.emptySubtitle}>
          Nhấn vào biểu tượng ❤️ trên các tin đăng để lưu lại
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={favoriteProperties}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FavoritesScreen;
