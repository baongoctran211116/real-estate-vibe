// filename: src/components/PropertyCard.tsx
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Property } from '../types/property';
import PropertyImageCarousel from './PropertyImageCarousel';
import PriceTag from './PriceTag';
import FavoriteButton from './FavoriteButton';
import {
  formatArea,
  formatRooms,
  formatPropertyType,
  getPropertyTypeColor,
  truncate,
} from '../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const PropertyCard: React.FC<PropertyCardProps> = ({ property, compact = false }) => {
  const navigation = useNavigation<NavProp>();

  const handlePress = useCallback(() => {
    navigation.navigate('PropertyDetail', { propertyId: property.id });
  }, [navigation, property.id]);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compactCard]}
      onPress={handlePress}
      activeOpacity={0.93}
    >
      {/* Image carousel */}
      <View style={styles.imageContainer}>
        <PropertyImageCarousel
          images={property.images}
          height={compact ? 160 : 200}
          borderRadius={12}
          showCounter={!compact}
        />
        {/* Favorite button overlay */}
        <FavoriteButton
          propertyId={property.id}
          style={styles.favoriteBtn}
          variant="circle"
        />
        {/* Property type badge */}
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        <PriceTag price={property.price} size={compact ? 'small' : 'medium'} />

        <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={2}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.location} numberOfLines={1}>
            {property.district}, {property.province}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatChip icon="📐" label={formatArea(property.area)} />
          {property.bedrooms > 0 && (
            <StatChip icon="🛏️" label={`${property.bedrooms} PN`} />
          )}
          {property.bathrooms > 0 && (
            <StatChip icon="🚿" label={`${property.bathrooms} WC`} />
          )}
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {truncate(property.description, 100)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const StatChip: React.FC<{ icon: string; label: string }> = memo(({ icon, label }) => (
  <View style={styles.statChip}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#1E3A5F',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  compactCard: {
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
    marginTop: 2,
  },
  compactTitle: {
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statIcon: { fontSize: 12 },
  statLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 2,
  },
});

export default memo(PropertyCard);
