// filename: src/screens/MapScreen.tsx
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';

//import MapView, { Region } from 'react-native-maps';

import MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapProperties } from '../features/map/useMapProperties';
import { useFilterStore, PROVINCES } from '../store/useFilterStore';
import { PropertyMarker } from '../components/MapClusterMarker';
import PropertyPreviewCard from '../components/PropertyPreviewCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { Property, Province } from '../types/property';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INITIAL_REGION: Region = {
  latitude: 16.0,
  longitude: 106.5,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const previewAnim = useRef(new Animated.Value(0)).current;

  const filters = useFilterStore((s) => s.filters);
  const setFilter = useFilterStore((s) => s.setFilter);
  const hasActive = useFilterStore((s) => s.hasActiveFilters());

  const { properties, isLoading } = useMapProperties();

  // Show/hide preview card with animation
  const showPreview = useCallback((property: Property) => {
    setSelectedProperty(property);
    Animated.spring(previewAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();

    // Pan map to selected property
    mapRef.current?.animateToRegion(
      {
        latitude: property.latitude - 0.005,
        longitude: property.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      400
    );
  }, [previewAnim]);

  const hidePreview = useCallback(() => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedProperty(null));
  }, [previewAnim]);

  const handleMarkerPress = useCallback(
    (property: Property) => {
      if (selectedProperty?.id === property.id) {
        hidePreview();
      } else {
        showPreview(property);
      }
    },
    [selectedProperty, showPreview, hidePreview]
  );

  const handleMapPress = useCallback(() => {
    if (selectedProperty) hidePreview();
  }, [selectedProperty, hidePreview]);

  // Zoom to province
  const zoomToProvince = useCallback(
    (province: Province) => {
      const regionMap: Record<Province, Region> = {
        Hanoi: { latitude: 21.028, longitude: 105.854, latitudeDelta: 0.4, longitudeDelta: 0.4 },
        'Ho Chi Minh City': { latitude: 10.776, longitude: 106.701, latitudeDelta: 0.3, longitudeDelta: 0.3 },
        'Da Nang': { latitude: 16.054, longitude: 108.202, latitudeDelta: 0.25, longitudeDelta: 0.25 },
        'Hai Phong': { latitude: 20.865, longitude: 106.684, latitudeDelta: 0.3, longitudeDelta: 0.3 },
        'Can Tho': { latitude: 10.034, longitude: 105.788, latitudeDelta: 0.25, longitudeDelta: 0.25 },
      };
      setFilter('province', filters.province === province ? undefined : province);
      if (filters.province !== province) {
        mapRef.current?.animateToRegion(regionMap[province], 600);
      }
    },
    [filters.province, setFilter]
  );

  const filteredProperties = React.useMemo(() => {
    if (!searchText.trim()) return properties;
    const q = searchText.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q)
    );
  }, [properties, searchText]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {filteredProperties.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            onPress={handleMarkerPress}
            isSelected={selectedProperty?.id === property.id}
          />
        ))}
      </MapView>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      )}

      {/* Top search + filter bar */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm trên bản đồ..."
            style={styles.mapSearchBar}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasActive && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {hasActive && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Province quick-select pills */}
      <View style={[styles.provincePills, { top: insets.top + 70 }]}>
        {PROVINCES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.provincePill,
              filters.province === p && styles.provincePillActive,
            ]}
            onPress={() => zoomToProvince(p as Province)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.provincePillText,
                filters.province === p && styles.provincePillTextActive,
              ]}
              numberOfLines={1}
            >
              {p.replace(' City', '').replace('Ho Chi Minh', 'HCM')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Property count badge */}
      <View style={[styles.countBadge, { top: insets.top + 118 }]}>
        <Text style={styles.countBadgeText}>
          🏠 {filteredProperties.length} bất động sản
        </Text>
      </View>

      {/* My location button */}
      <TouchableOpacity
        style={[styles.myLocationBtn, { bottom: 100 + insets.bottom }]}
        onPress={() =>
          mapRef.current?.animateToRegion(INITIAL_REGION, 600)
        }
      >
        <Text style={styles.myLocationIcon}>🎯</Text>
      </TouchableOpacity>

      {/* Preview card */}
      {selectedProperty && (
        <Animated.View
          style={[
            styles.previewContainer,
            { bottom: 20 + insets.bottom },
            {
              opacity: previewAnim,
              transform: [
                {
                  translateY: previewAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <PropertyPreviewCard
            property={selectedProperty}
            onClose={hidePreview}
          />
        </Animated.View>
      )}

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchWrapper: { flex: 1 },
  mapSearchBar: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  filterBtnActive: { backgroundColor: '#EFF6FF' },
  filterBtnIcon: { fontSize: 20 },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  provincePills: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
  },
  provincePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  provincePillActive: { backgroundColor: '#2563EB' },
  provincePillText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  provincePillTextActive: { color: '#FFFFFF' },
  countBadge: {
    position: 'absolute',
    alignSelf: 'center',
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  countBadgeText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  myLocationIcon: { fontSize: 22 },
  previewContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
});

export default MapScreen;
