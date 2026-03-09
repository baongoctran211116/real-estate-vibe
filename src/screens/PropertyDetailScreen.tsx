// filename: src/screens/PropertyDetailScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { usePropertyDetail } from '../features/property/usePropertyDetail';
import PropertyImageCarousel from '../components/PropertyImageCarousel';
import PriceTag from '../components/PriceTag';
import FavoriteButton from '../components/FavoriteButton';
import {
  formatArea,
  formatDate,
  formatPropertyType,
  getPropertyTypeColor,
} from '../utils/formatters';

type DetailRouteProp = RouteProp<RootStackParamList, 'PropertyDetail'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PropertyDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation();
  const { propertyId } = route.params;

  const { property, isLoading, isError } = usePropertyDetail(propertyId);

  const handleShare = useCallback(async () => {
    if (!property) return;
    try {
      await Share.share({
        title: property.title,
        message: `${property.title}\n${property.address}\nGiá: ${property.price.toLocaleString()} VND`,
      });
    } catch (e) {
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
          {/* Overlay actions */}
          <View style={styles.carouselOverlay}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnIcon}>↗️</Text>
            </TouchableOpacity>
            <FavoriteButton
              propertyId={property.id}
              size={24}
              variant="circle"
            />
          </View>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Price + type */}
          <View style={styles.priceRow}>
            <PriceTag price={property.price} size="large" />
            <View
              style={[
                styles.typeTag,
                { backgroundColor: getPropertyTypeColor(property.propertyType) },
              ]}
            >
              <Text style={styles.typeTagText}>
                {formatPropertyType(property.propertyType)}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{property.title}</Text>

          {/* Address */}
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.address}>{property.address}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Key stats grid */}
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.statsGrid}>
            <StatItem icon="📐" label="Diện tích" value={formatArea(property.area)} />
            {property.bedrooms > 0 && (
              <StatItem icon="🛏️" label="Phòng ngủ" value={`${property.bedrooms} phòng`} />
            )}
            {property.bathrooms > 0 && (
              <StatItem icon="🚿" label="Phòng tắm" value={`${property.bathrooms} phòng`} />
            )}
            <StatItem icon="🏙️" label="Quận/Huyện" value={property.district} />
            <StatItem icon="🗺️" label="Thành phố" value={property.province} />
            <StatItem icon="📅" label="Ngày đăng" value={formatDate(property.createdAt)} />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{property.description}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Location section */}
          <Text style={styles.sectionTitle}>Vị trí</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationBoxIcon}>🗺️</Text>
            <View style={styles.locationBoxContent}>
              <Text style={styles.locationBoxTitle}>{property.district}</Text>
              <Text style={styles.locationBoxSubtitle}>{property.province}</Text>
              <Text style={styles.locationBoxCoords}>
                {property.latitude.toFixed(4)}°N, {property.longitude.toFixed(4)}°E
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA footer */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.ctaPriceBox}>
          <Text style={styles.ctaPriceLabel}>Giá</Text>
          <PriceTag price={property.price} size="medium" />
        </View>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() =>
            Alert.alert(
              'Liên hệ môi giới',
              'Tính năng này sẽ được kết nối với backend.',
              [{ text: 'OK' }]
            )
          }
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>📞 Liên hệ ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Sub-components ───────────────────────────────────────
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  loadingText: { fontSize: 14, color: '#6B7280' },
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginTop: 8,
  },
  backBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },

  // Carousel
  carouselContainer: { position: 'relative' },
  carouselOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  shareBtnIcon: { fontSize: 18 },

  // Content
  content: { padding: 20, gap: 14 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTag: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeTagText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 30 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressIcon: { fontSize: 14, marginTop: 1 },
  address: { fontSize: 14, color: '#6B7280', flex: 1, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: (SCREEN_WIDTH - 60) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItemIcon: { fontSize: 22 },
  statItemLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  statItemValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
    textAlign: 'center',
  },

  // Description
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },

  // Location
  locationBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  locationBoxIcon: { fontSize: 32 },
  locationBoxContent: { flex: 1, gap: 3 },
  locationBoxTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locationBoxSubtitle: { fontSize: 14, color: '#6B7280' },
  locationBoxCoords: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },

  // CTA bar
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  ctaPriceBox: { gap: 2 },
  ctaPriceLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  ctaBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default PropertyDetailScreen;
