// filename: src/components/PropertyPreviewCard.tsx
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FastImage from '../utils/FastImageShim';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Property } from '../types/property';
import PriceTag from './PriceTag';
import FavoriteButton from './FavoriteButton';
import {
  formatArea,
  formatPropertyType,
  getPropertyTypeColor,
} from '../utils/formatters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WRAPPER_PADDING_TOP = 0; // chỗ cho close btn
const CARD_WIDTH  = SCREEN_WIDTH - 32;
// Card height vừa khít: không quá cao, để card nằm gọn phía trên tab bar
// ~42% màn hình là đủ hiển thị đầy đủ nội dung mà không bị tràn
const CARD_HEIGHT = Math.round(SCREEN_HEIGHT * 0.50) - WRAPPER_PADDING_TOP;
// Ảnh chiếm 45% card
const IMAGE_HEIGHT = Math.round(CARD_HEIGHT * 0.45);

interface PropertyPreviewCardProps {
  property: Property;
  onClose?: () => void;
}

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const PropertyPreviewCard: React.FC<PropertyPreviewCardProps> = ({
  property,
  onClose,
}) => {
  const navigation = useNavigation<NavProp>();

  const handlePress = useCallback(() => {
    onClose?.();
    navigation.navigate('PropertyDetail', { propertyId: property.id });
  }, [navigation, property.id, onClose]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        {/* ── Ảnh lớn trên ── */}
        <View style={styles.imageContainer}>
          <FastImage
            source={{ uri: property.images[0], priority: FastImage.priority.high }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />

          {/* Gradient overlay phía dưới ảnh */}
          <View style={styles.imageGradient} />

          {/* Type badge đè trên ảnh */}
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getPropertyTypeColor(property.propertyType) },
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {formatPropertyType(property.propertyType)}
            </Text>
          </View>

          {/* Ảnh count */}
          {property.images.length > 1 && (
            <View style={styles.imageCount}>
              <Text style={styles.imageCountText}>
                📷 {property.images.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── Nội dung dưới ── */}
        <View style={styles.content}>
          {/* Hàng giá + favorite */}
          <View style={styles.topRow}>
            <PriceTag price={property.price} size="large" />
            <FavoriteButton propertyId={property.id} size={22} variant="bare" />
          </View>

          {/* Tiêu đề */}
          <Text style={styles.title} numberOfLines={2}>
            {property.title}
          </Text>

          {/* Địa chỉ */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location} numberOfLines={1}>
              {property.address
                ? property.address
                : `${property.district}, ${property.province}`}
            </Text>
          </View>

          {/* Stats: diện tích, phòng ngủ, phòng tắm */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipIcon}>📐</Text>
              <Text style={styles.statChipText}>{formatArea(property.area)}</Text>
            </View>
            {property.bedrooms > 0 && (
              <View style={styles.statChip}>
                <Text style={styles.statChipIcon}>🛏️</Text>
                <Text style={styles.statChipText}>{property.bedrooms} PN</Text>
              </View>
            )}
            {property.bathrooms > 0 && (
              <View style={styles.statChip}>
                <Text style={styles.statChipIcon}>🚿</Text>
                <Text style={styles.statChipText}>{property.bathrooms} WC</Text>
              </View>
            )}
          </View>

          {/* CTA button */}
          <TouchableOpacity style={styles.detailBtn} onPress={handlePress}>
            <Text style={styles.detailBtnText}>Xem chi tiết</Text>
            <Text style={styles.detailBtnArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Nút đóng */}
      {onClose && (
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + WRAPPER_PADDING_TOP, // tổng = đúng 1/2 màn hình
    paddingTop: WRAPPER_PADDING_TOP,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  // ── Ảnh ──
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    // gradient thủ công bằng opacity layers
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  imageCount: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Nội dung ──
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 5,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: { fontSize: 12 },
  location: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statChipIcon: { fontSize: 12 },
  statChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // ── CTA ──
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 11,
    gap: 6,
  },
  detailBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailBtnArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Close btn ──
  closeBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 12,
    zIndex: 99,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default memo(PropertyPreviewCard);
