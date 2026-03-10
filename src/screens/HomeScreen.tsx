// filename: src/screens/HomeScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { usePropertyList } from '../features/property/usePropertyList';
import { useFilterStore, PROVINCES, PROVINCE_REGIONS } from '../store/useFilterStore';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { Property, Province } from '../types/property';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const filters   = useFilterStore((s) => s.filters);
  const setFilter = useFilterStore((s) => s.setFilter);
  const hasActive = useFilterStore((s) => s.hasActiveFilters());
  const flyMapTo  = useFilterStore((s) => s.flyMapTo);

  const {
    properties,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = usePropertyList();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleProvinceSelect = useCallback(
    (province: Province) => {
      const isDeselect = filters.province === province;
      setFilter('province', isDeselect ? undefined : province);

      if (!isDeselect && PROVINCE_REGIONS[province]) {
        const region = PROVINCE_REGIONS[province];
        flyMapTo(region.lat, region.lng, region.zoom);
      }
    },
    [filters.province, setFilter, flyMapTo]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Property>) => <PropertyCard property={item} />,
    []
  );

  const keyExtractor = useCallback((item: Property) => item.id, []);

  const ListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Xin chào 👋</Text>
              <Text style={styles.heroTitle}>Tìm nhà mơ ước</Text>
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, hasActive && styles.filterBtnActive]}
              onPress={() => setFilterVisible(true)}
            >
              <Text style={styles.filterBtnIcon}>⚙️</Text>
              {hasActive && <View style={styles.filterDot} />}
            </TouchableOpacity>
          </View>

          {/* Search bar — taps navigate to Search tab */}
          <TouchableOpacity
            onPress={() =>
              (navigation as any).navigate('MainTabs', { screen: 'Search' })
            }
            activeOpacity={0.85}
          >
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="Tìm theo tên, quận, thành phố..."
              editable={false}
            />
          </TouchableOpacity>
        </View>

        {/* Province quick filters */}
        <View style={styles.quickFilters}>
          <Text style={styles.quickFiltersLabel}>Thành phố</Text>
          <View style={styles.provinceRow}>
            <ProvinceChip
              label="Tất cả"
              selected={!filters.province}
              onPress={() => setFilter('province', undefined)}
            />
            {PROVINCES.map((p) => (
              <ProvinceChip
                key={p}
                label={p}
                selected={filters.province === p}
                onPress={() => handleProvinceSelect(p as Province)}
              />
            ))}
          </View>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filters.province
              ? `BĐS tại ${filters.province}`
              : 'Tất cả bất động sản'}
          </Text>
          <Text style={styles.sectionCount}>{properties.length}+ tin</Text>
        </View>
      </View>
    ),
    [
      insets.top,
      hasActive,
      filters.province,
      properties.length,
      navigation,
      setFilter,
      handleProvinceSelect,
    ]
  );

  const ListFooter = useCallback(
    () =>
      isFetchingNextPage ? (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.footerText}>Đang tải thêm...</Text>
        </View>
      ) : null,
    [isFetchingNextPage]
  );

  const ListEmpty = useCallback(
    () =>
      !isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏘️</Text>
          <Text style={styles.emptyTitle}>Không có kết quả</Text>
          <Text style={styles.emptySubtitle}>
            Thử thay đổi bộ lọc để xem thêm
          </Text>
        </View>
      ) : null,
    [isLoading]
  );

  if (isLoading && properties.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải bất động sản...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={properties}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={320}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
};

// ─── Province chip ────────────────────────────────────────
const ProvinceChip: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
}> = React.memo(({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.provinceChip, selected && styles.provinceChipSelected]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text
      style={[
        styles.provinceChipText,
        selected && styles.provinceChipTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { paddingBottom: 24 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  loadingText: { fontSize: 14, color: '#6B7280' },

  // Hero
  hero: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 2,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  filterBtnIcon: { fontSize: 20 },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },

  // Province chips
  quickFilters: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
    gap: 10,
  },
  quickFiltersLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  provinceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  provinceChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  provinceChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  provinceChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  provinceChipTextSelected: { color: '#FFFFFF', fontWeight: '700' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  sectionCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  listHeader: { marginBottom: 4 },

  // Footer / empty
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  footerText: { fontSize: 13, color: '#6B7280' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default HomeScreen;
