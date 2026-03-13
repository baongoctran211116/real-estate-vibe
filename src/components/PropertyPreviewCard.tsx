// filename: src/components/PropertyPreviewCard.tsx
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

//import FastImage from 'react-native-fast-image';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

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
        activeOpacity={0.93}
      >
        {/* Thumbnail */}
        <FastImage
          source={{
            uri: property.images[0],
            priority: FastImage.priority.high,
          }}
          style={styles.thumbnail}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <PriceTag price={property.price} size="medium" />
            <FavoriteButton propertyId={property.id} size={18} variant="bare" />
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {property.title}
          </Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location} numberOfLines={1}>
              {property.district}, {property.province}
            </Text>
          </View>

          <View style={styles.statsRow}>
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
            <Text style={styles.stat}>📐 {formatArea(property.area)}</Text>
            {property.bedrooms > 0 && (
              <Text style={styles.stat}>🛏️ {property.bedrooms}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Close button — outside card so it's never overlapped */}
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
    paddingTop: 14,      // space for close btn overflowing top edge
    paddingRight: 14,    // space for close btn overflowing right edge
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#1E3A5F',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  thumbnail: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    padding: 11,
    gap: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationIcon: { fontSize: 11 },
  location: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  stat: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
    zIndex: 99,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default memo(PropertyPreviewCard);