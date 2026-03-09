// filename: src/components/MapClusterMarker.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { Property } from '../types/property';
import { formatPrice } from '../utils/formatters';

// ─── Single property marker ───────────────────────────────
interface PropertyMarkerProps {
  property: Property;
  onPress: (property: Property) => void;
  isSelected?: boolean;
}

export const PropertyMarker: React.FC<PropertyMarkerProps> = memo(
  ({ property, onPress, isSelected = false }) => {
    return (
      <Marker
        key={property.id}
        coordinate={{
          latitude: property.latitude,
          longitude: property.longitude,
        }}
        onPress={() => onPress(property)}
        tracksViewChanges={false}
      >
        <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
          <Text style={[styles.markerPrice, isSelected && styles.markerPriceSelected]}>
            {formatPrice(property.price)}
          </Text>
          <View style={[styles.markerTail, isSelected && styles.markerTailSelected]} />
        </View>
      </Marker>
    );
  }
);

// ─── Cluster marker ───────────────────────────────────────
interface ClusterMarkerProps {
  count: number;
  coordinate: { latitude: number; longitude: number };
  onPress?: () => void;
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = memo(
  ({ count, coordinate, onPress }) => {
    const size = count > 50 ? 56 : count > 20 ? 48 : 40;
    return (
      <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
        <TouchableOpacity
          style={[
            styles.cluster,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.clusterCount}>{count > 99 ? '99+' : count}</Text>
        </TouchableOpacity>
      </Marker>
    );
  }
);

const styles = StyleSheet.create({
  // Single marker
  markerContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#1E3A5F',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  markerSelected: {
    backgroundColor: '#1D4ED8',
    transform: [{ scale: 1.1 }],
  },
  markerPrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  markerPriceSelected: {
    fontSize: 13,
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2563EB',
    marginTop: 1,
  },
  markerTailSelected: {
    borderTopColor: '#1D4ED8',
  },
  // Cluster
  cluster: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#1E3A5F',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  clusterCount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
