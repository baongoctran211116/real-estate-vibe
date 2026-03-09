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
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapProperties } from '../features/map/useMapProperties';
import { useFilterStore, PROVINCES } from '../store/useFilterStore';
import PropertyPreviewCard from '../components/PropertyPreviewCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { Property, Province } from '../types/property';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PROVINCE_REGIONS: Record<Province, { lat: number; lng: number; zoom: number }> = {
  Hanoi:              { lat: 21.028, lng: 105.854, zoom: 12 },
  'Ho Chi Minh City': { lat: 10.776, lng: 106.701, zoom: 12 },
  'Da Nang':          { lat: 16.054, lng: 108.202, zoom: 12 },
  'Hai Phong':        { lat: 20.865, lng: 106.684, zoom: 12 },
  'Can Tho':          { lat: 10.034, lng: 105.788, zoom: 12 },
};

const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const previewAnim = useRef(new Animated.Value(0)).current;

  const filters = useFilterStore((s) => s.filters);
  const setFilter = useFilterStore((s) => s.setFilter);
  const hasActive = useFilterStore((s) => s.hasActiveFilters());

  const { properties, isLoading } = useMapProperties();

  // ─── Filter properties locally ───────────────────────────
  const filteredProperties = React.useMemo(() => {
    let list = properties;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.province.toLowerCase().includes(q)
      );
    }
    return list;
  }, [properties, searchText]);

  // ─── Build Leaflet HTML ───────────────────────────────────
  const buildMapHTML = useCallback(
    (props: Property[]) => {
      const markersJson = JSON.stringify(
        props.map((p) => ({
          id: p.id,
          lat: p.latitude,
          lng: p.longitude,
          price: formatPriceShort(p.price),
          title: p.title,
          district: p.district,
          province: p.province,
          type: p.propertyType,
        }))
      );

      return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }

    /* Custom price marker */
    .price-marker {
      background: #2563EB;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 9px;
      border-radius: 8px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(37,99,235,0.45);
      border: 2px solid white;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .price-marker:hover { transform: scale(1.08); }
    .price-marker.selected {
      background: #1D4ED8;
      transform: scale(1.12);
      z-index: 999 !important;
    }
    .price-marker::after {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 7px solid #2563EB;
    }
    .price-marker.selected::after {
      border-top-color: #1D4ED8;
    }

    /* Cluster override */
    .marker-cluster-small,
    .marker-cluster-medium,
    .marker-cluster-large {
      background-color: rgba(37,99,235,0.25) !important;
    }
    .marker-cluster-small div,
    .marker-cluster-medium div,
    .marker-cluster-large div {
      background-color: #2563EB !important;
      color: white !important;
      font-weight: 700 !important;
      font-size: 13px !important;
    }

    /* OSM attribution tweak */
    .leaflet-control-attribution {
      font-size: 9px;
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  // Init map centered on Vietnam
  const map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
  }).setView([16.0, 106.5], 6);

  // OpenStreetMap tile layer — no API key needed
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Zoom control bottom-right
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Marker cluster group
  const clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      return L.divIcon({
        html: '<div>' + count + '</div>',
        className: 'marker-cluster marker-cluster-' + (count < 10 ? 'small' : count < 50 ? 'medium' : 'large'),
        iconSize: [40, 40],
      });
    },
  });

  const markers = ${markersJson};
  let selectedId = null;
  const markerMap = {};

  // Create custom price markers
  markers.forEach(function(p) {
    const icon = L.divIcon({
      html: '<div class="price-marker" id="marker-' + p.id + '">' + p.price + '</div>',
      className: '',
      iconSize: null,
      iconAnchor: [0, 28],
    });

    const marker = L.marker([p.lat, p.lng], { icon });

    marker.on('click', function() {
      // Deselect previous
      if (selectedId && markerMap[selectedId]) {
        const prevEl = document.getElementById('marker-' + selectedId);
        if (prevEl) prevEl.classList.remove('selected');
      }

      // Select current
      selectedId = p.id;
      const el = document.getElementById('marker-' + p.id);
      if (el) el.classList.add('selected');

      // Send to React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MARKER_PRESS',
        propertyId: p.id,
      }));
    });

    markerMap[p.id] = marker;
    clusterGroup.addLayer(marker);
  });

  map.addLayer(clusterGroup);

  // Tap on map to deselect
  map.on('click', function() {
    if (selectedId) {
      const el = document.getElementById('marker-' + selectedId);
      if (el) el.classList.remove('selected');
      selectedId = null;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_PRESS' }));
  });

  // Ready signal
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));

  // Receive commands from React Native
  window.addEventListener('message', function(e) {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'FLY_TO') {
        map.flyTo([msg.lat, msg.lng], msg.zoom, { duration: 0.8 });
      }
      if (msg.type === 'DESELECT') {
        if (selectedId) {
          const el = document.getElementById('marker-' + selectedId);
          if (el) el.classList.remove('selected');
          selectedId = null;
        }
      }
    } catch(err) {}
  });
</script>
</body>
</html>
      `;
    },
    []
  );

  // ─── Handle messages from WebView ────────────────────────
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);

        if (msg.type === 'MAP_READY') {
          setMapReady(true);
        }

        if (msg.type === 'MARKER_PRESS') {
          const property = filteredProperties.find((p) => p.id === msg.propertyId);
          if (property) {
            setSelectedProperty(property);
            Animated.spring(previewAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 60,
              friction: 10,
            }).start();
          }
        }

        if (msg.type === 'MAP_PRESS') {
          hidePreview();
        }
      } catch (e) {}
    },
    [filteredProperties, previewAnim]
  );

  // ─── Hide preview ─────────────────────────────────────────
  const hidePreview = useCallback(() => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedProperty(null));

    // Deselect marker in WebView
    webViewRef.current?.postMessage(JSON.stringify({ type: 'DESELECT' }));
  }, [previewAnim]);

  // ─── Fly to province ──────────────────────────────────────
  const flyToProvince = useCallback(
    (province: Province) => {
      const region = PROVINCE_REGIONS[province];
      setFilter('province', filters.province === province ? undefined : province);
      if (filters.province !== province) {
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'FLY_TO', lat: region.lat, lng: region.lng, zoom: region.zoom })
        );
      }
    },
    [filters.province, setFilter]
  );

  // ─── Rebuild HTML when filtered properties change ─────────
  const mapHTML = React.useMemo(
    () => buildMapHTML(filteredProperties),
    [filteredProperties, buildMapHTML]
  );

  return (
    <View style={styles.container}>
      {/* OSM Map via WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={StyleSheet.absoluteFillObject}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
      />

      {/* Loading overlay */}
      {(isLoading || !mapReady) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      )}

      {/* Top search + filter */}
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

      {/* Province pills */}
      <View style={[styles.provincePills, { top: insets.top + 70 }]}>
        {PROVINCES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.provincePill,
              filters.province === p && styles.provincePillActive,
            ]}
            onPress={() => flyToProvince(p as Province)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.provincePillText,
                filters.province === p && styles.provincePillTextActive,
              ]}
              numberOfLines={1}
            >
              {p.replace('Ho Chi Minh City', 'HCM')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Count badge */}
      <View style={[styles.countBadge, { top: insets.top + 120 }]}>
        <Text style={styles.countBadgeText}>
          🏠 {filteredProperties.length} bất động sản
        </Text>
      </View>

      {/* Reset view button */}
      <TouchableOpacity
        style={[styles.resetBtn, { bottom: 100 + insets.bottom }]}
        onPress={() =>
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'FLY_TO', lat: 16.0, lng: 106.5, zoom: 6 })
          )
        }
      >
        <Text style={styles.resetBtnIcon}>🎯</Text>
      </TouchableOpacity>

      {/* Property preview card */}
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

      <FilterPanel visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
};

// ─── Helper ───────────────────────────────────────────────
function formatPriceShort(price: number): string {
  if (price >= 1_000_000_000) {
    return parseFloat((price / 1_000_000_000).toFixed(1)) + ' tỷ';
  }
  if (price >= 1_000_000) {
    return Math.round(price / 1_000_000) + ' tr';
  }
  return price.toString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 99,
  },
  loadingText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
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
    zIndex: 10,
    flexWrap: 'nowrap',
  },
  provincePill: {
    paddingHorizontal: 10,
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
  provincePillText: { fontSize: 11, color: '#374151', fontWeight: '600' },
  provincePillTextActive: { color: '#FFFFFF' },
  countBadge: {
    position: 'absolute',
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
    zIndex: 10,
  },
  countBadgeText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  resetBtn: {
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
    zIndex: 10,
  },
  resetBtnIcon: { fontSize: 22 },
  previewContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 20,
  },
});

export default MapScreen;
