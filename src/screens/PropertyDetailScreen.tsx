// filename: src/screens/PropertyDetailScreen.tsx
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, Share, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { usePropertyDetail } from '../features/property/usePropertyDetail';
import { useFilterStore, PROVINCE_REGIONS } from '../store/useFilterStore';
import PropertyImageCarousel from '../components/PropertyImageCarousel';
import PriceTag from '../components/PriceTag';
import FavoriteButton from '../components/FavoriteButton';
import {
  formatArea, formatDate, formatPropertyType, getPropertyTypeColor,
} from '../utils/formatters';

type DetailRouteProp = RouteProp<RootStackParamList, 'PropertyDetail'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PropertyDetailScreen: React.FC = () => {
  const insets    = useSafeAreaInsets();
  const route     = useRoute<DetailRouteProp>();
  const navigation = useNavigation();
  const { propertyId } = route.params;

  const { property, isLoading, isError } = usePropertyDetail(propertyId);

  const flyMapTo   = useFilterStore((s) => s.flyMapTo);
  const setFilter  = useFilterStore((s) => s.setFilter);

  // ─── Jump to this property on the Map tab ────────────────
  const handleViewOnMap = useCallback(() => {
    if (!property) return;

    // 1. Set province filter so map shows the right markers
    setFilter('province', property.province);

    // 2. Tell MapScreen to fly to this exact property coordinate
    flyMapTo(property.latitude, property.longitude, 16);

    // 3. Navigate to Map tab
    (navigation as any).navigate('MainTabs', { screen: 'Map' });
  }, [property, flyMapTo, setFilter, navigation]);

  const handleShare = useCallback(async () => {
    if (!property) return;
    try {
      await Share.share({
        title: property.title,
        message: `${property.title}\n${property.address}\nGiá: ${property.price.toLocaleString()} VND`,
      });
    } catch {
      Alert.alert('Lỗi', 'Không thể chia sẻ bất động sản này');
    }
  }, [property]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (isError || !property) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Không tìm thấy bất động sản</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        bounces
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <PropertyImageCarousel
            images={property.images}
            height={300}
            borderRadius={0}
            showCounter
          />
          <View style={styles.carouselOverlay}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Text style={styles.iconBtnText}>↗️</Text>
            </TouchableOpacity>
            <FavoriteButton propertyId={property.id} size={24} variant="circle" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Price + type */}
          <View style={styles.priceRow}>
            <PriceTag price={property.price} size="large" />
            <View style={[styles.typeTag, { backgroundColor: getPropertyTypeColor(property.propertyType) }]}>
              <Text style={styles.typeTagText}>{formatPropertyType(property.propertyType)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Address */}
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.address}>{property.address}</Text>
          </View>

          {/* ── View on Map button ── */}
          <TouchableOpacity style={styles.viewOnMapBtn} onPress={handleViewOnMap} activeOpacity={0.85}>
            <Text style={styles.viewOnMapIcon}>🗺️</Text>
            <Text style={styles.viewOnMapText}>Xem vị trí trên bản đồ</Text>
            <Text style={styles.viewOnMapArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Stats grid */}
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.statsGrid}>
            <StatItem icon="📐" label="Diện tích"   value={formatArea(property.area)} />
            {property.bedrooms > 0 && (
              <StatItem icon="🛏️" label="Phòng ngủ"  value={`${property.bedrooms} phòng`} />
            )}
            {property.bathrooms > 0 && (
              <StatItem icon="🚿" label="Phòng tắm"  value={`${property.bathrooms} phòng`} />
            )}
            <StatItem icon="🏙️" label="Quận/Huyện"  value={property.district} />
            <StatItem icon="🗺️" label="Thành phố"   value={property.province} />
            <StatItem icon="📅" label="Ngày đăng"   value={formatDate(property.createdAt)} />
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{property.description}</Text>

          <View style={styles.divider} />

          {/* Location card */}
          <Text style={styles.sectionTitle}>Vị trí</Text>
          <TouchableOpacity
            style={styles.locationBox}
            onPress={handleViewOnMap}
            activeOpacity={0.85}
          >
            <Text style={styles.locationBoxIcon}>🗺️</Text>
            <View style={styles.locationBoxContent}>
              <Text style={styles.locationBoxTitle}>{property.district}</Text>
              <Text style={styles.locationBoxSubtitle}>{property.province}</Text>
              <Text style={styles.locationBoxCoords}>
                {property.latitude.toFixed(5)}°N, {property.longitude.toFixed(5)}°E
              </Text>
            </View>
            <View style={styles.locationBoxArrow}>
              <Text style={styles.locationBoxArrowText}>Xem bản đồ ›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CTA bar */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.ctaPriceBox}>
          <Text style={styles.ctaPriceLabel}>Giá</Text>
          <PriceTag price={property.price} size="medium" />
        </View>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() =>
            Alert.alert('Liên hệ môi giới', 'Tính năng này sẽ được kết nối với backend.', [{ text: 'OK' }])
          }
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>📞 Liên hệ ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── StatItem ─────────────────────────────────────────────
const StatItem: React.FC<{ icon: string; label: string; value: string }> = React.memo(
  ({ icon, label, value }) => (
    <View style={styles.statItem}>
      <Text style={styles.statItemIcon}>{icon}</Text>
      <Text style={styles.statItemLabel}>{label}</Text>
      <Text style={styles.statItemValue}>{value}</Text>
    </View>
  )
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F8FAFC' },
  loadingText: { fontSize: 14, color: '#6B7280' },
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#EFF6FF', borderRadius: 12, marginTop: 8 },
  backBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },

  carouselContainer: { position: 'relative' },
  carouselOverlay: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  iconBtnText: { fontSize: 18 },

  content: { padding: 20, gap: 14 },

  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeTag: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  typeTagText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  title: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 30 },

  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressIcon: { fontSize: 14, marginTop: 1 },
  address: { fontSize: 14, color: '#6B7280', flex: 1, lineHeight: 20 },

  // ── View on Map button ──
  viewOnMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    gap: 10,
    marginTop: 4,
  },
  viewOnMapIcon: { fontSize: 20 },
  viewOnMapText: { flex: 1, fontSize: 15, color: '#2563EB', fontWeight: '600' },
  viewOnMapArrow: { fontSize: 20, color: '#2563EB', fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: {
    width: (SCREEN_WIDTH - 60) / 3,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  statItemIcon: { fontSize: 22 },
  statItemLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  statItemValue: { fontSize: 13, color: '#111827', fontWeight: '700', textAlign: 'center' },

  description: { fontSize: 15, color: '#4B5563', lineHeight: 24 },

  // Location box — tappable
  locationBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  locationBoxIcon: { fontSize: 32 },
  locationBoxContent: { flex: 1, gap: 3 },
  locationBoxTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locationBoxSubtitle: { fontSize: 14, color: '#6B7280' },
  locationBoxCoords: { fontSize: 11, color: '#9CA3AF' },
  locationBoxArrow: {
    backgroundColor: '#2563EB', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  locationBoxArrowText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // CTA
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: -3 }, elevation: 8,
  },
  ctaPriceBox: { gap: 2 },
  ctaPriceLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  ctaBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default PropertyDetailScreen;
