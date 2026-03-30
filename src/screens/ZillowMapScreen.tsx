import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PropertyPreviewCard from '../components/PropertyPreviewCard';
import { Property } from '../types/property';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Fake data đúng type Property ─────────────────────────────────────────────
const DISTRICTS = ['Beverly Hills', 'Santa Monica', 'Bel Air', 'Westwood', 'Malibu'];
const PROVINCES = ['Los Angeles', 'California'];
const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'townhouse'];
const ADDRESSES = [
  '123 Sunset Blvd', '456 Wilshire Blvd', '789 Rodeo Dr',
  '321 Ocean Ave', '654 Mulholland Dr', '987 Hollywood Blvd',
];
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
];

const formatPriceLabel = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}K`;
  return `${price}`;
};

const generateFakeProperties = (): Property[] => {
  const centerLat = 34.0195;
  const centerLng = -118.4912;
  const props: Property[] = [];

  for (let i = 0; i < 200; i++) {
    const latitude  = centerLat + (Math.random() - 0.5) * 0.04;
    const longitude = centerLng + (Math.random() - 0.5) * 0.06;

    const priceRand = Math.random();
    let price: number;
    if (priceRand < 0.05)      price = Math.round((Math.random() * 500 + 400) * 1000);
    else if (priceRand < 0.15) price = Math.round((Math.random() * 0.5 + 0.8) * 1_000_000);
    else if (priceRand < 0.5)  price = Math.round((Math.random() * 1 + 1.2) * 1_000_000);
    else if (priceRand < 0.8)  price = Math.round((Math.random() * 1.5 + 2) * 1_000_000);
    else                        price = Math.round((Math.random() * 3 + 3.5) * 1_000_000);

    const imageCount = Math.floor(Math.random() * 4) + 1;
    const images = Array.from({ length: imageCount }, (_, idx) =>
      PLACEHOLDER_IMAGES[(i + idx) % PLACEHOLDER_IMAGES.length],
    );

    props.push({
      id:           `zillow-${i}`,
      title:        `${ADDRESSES[i % ADDRESSES.length]}, ${DISTRICTS[i % DISTRICTS.length]}`,
      price,
      address:      `${Math.floor(100 + Math.random() * 8900)} ${ADDRESSES[i % ADDRESSES.length]}`,
      district:     DISTRICTS[i % DISTRICTS.length],
      province:     PROVINCES[i % PROVINCES.length],
      area:         Math.floor(Math.random() * 300) + 80,       // m²
      bedrooms:     Math.floor(Math.random() * 4) + 1,
      bathrooms:    Math.floor(Math.random() * 3) + 1,
      propertyType: PROPERTY_TYPES[i % PROPERTY_TYPES.length] as any,
      images,
      latitude,
      longitude,
      // các field optional khác để thoả mãn type
      isHighlighted: Math.random() < 0.15,
      priceLabel:   formatPriceLabel(price),
    } as any);
  }

  return props;
};

const PROPERTIES = generateFakeProperties();

// ─── Map markers data (chỉ gửi id + toạ độ + label lên WebView) ──────────────
const MARKERS = PROPERTIES.map((p: any) => ({
  id:            p.id,
  lat:           p.latitude,
  lng:           p.longitude,
  label:         p.priceLabel,
  isHighlighted: p.isHighlighted,
}));

// ─── Leaflet HTML ─────────────────────────────────────────────────────────────
const getLeafletHTML = (markers: any[]) => {
  const markersJSON = JSON.stringify(markers);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }

    .price-marker {
      background: rgba(30,30,30,0.88); color: #fff;
      border-radius: 20px; padding: 4px 10px;
      font-family: -apple-system,'Helvetica Neue',sans-serif;
      font-size: 13px; font-weight: 600; white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.45); cursor: pointer;
      border: 1.5px solid rgba(255,255,255,0.12);
      transition: transform 0.1s, background 0.1s;
      letter-spacing: 0.2px; line-height: 1;
    }
    .price-marker:hover  { transform: scale(1.1); z-index: 9999 !important; }
    .price-marker.highlighted {
      background: #f5e6c8; color: #1a1a1a;
      border: 1.5px solid rgba(180,140,70,0.4);
      box-shadow: 0 2px 8px rgba(180,140,70,0.35);
    }
    .price-marker.selected {
      background: #006aff; color: #fff;
      border: 2px solid rgba(255,255,255,0.8);
      transform: scale(1.15); z-index: 9999 !important;
    }
    .leaflet-div-icon {
      background: transparent !important; border: none !important; overflow: visible !important;
    }
    .leaflet-control-zoom a { border-radius: 8px !important; }
    .leaflet-control-zoom { border-radius: 10px !important; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const markers = ${markersJSON};
  let selectedMarkerEl = null;

  const map = L.map('map', {
    center: [34.0195, -118.4912], zoom: 15,
    zoomControl: false, attributionControl: false,
  });
  L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', { maxZoom: 19 }).addTo(map);

  markers.forEach(function(m) {
    const cls = 'price-marker' + (m.isHighlighted ? ' highlighted' : '');
    const html = '<span class="' + cls + '" style="display:inline-flex;align-items:center;">' + m.label + '</span>';
    const icon = L.divIcon({ html: html, className: '', iconSize: null, iconAnchor: null });
    const marker = L.marker([m.lat, m.lng], { icon: icon, zIndexOffset: m.isHighlighted ? 100 : 0 });

    marker.on('click', function(e) {
      if (selectedMarkerEl) selectedMarkerEl.classList.remove('selected');
      const iconEl = e.target._icon && e.target._icon.querySelector('.price-marker');
      if (iconEl) { iconEl.classList.add('selected'); selectedMarkerEl = iconEl; }
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_PRESS', propertyId: m.id }));
      }
    });
    marker.addTo(map);
  });

  map.on('click', function() {
    if (selectedMarkerEl) { selectedMarkerEl.classList.remove('selected'); selectedMarkerEl = null; }
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_PRESS' }));
    }
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  [100, 300, 600, 1200].forEach(function(ms) {
    setTimeout(function() { map.invalidateSize(true); }, ms);
  });

  function handleMessage(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'INVALIDATE_SIZE') map.invalidateSize(true);
      if (msg.type === 'DESELECT') {
        if (selectedMarkerEl) { selectedMarkerEl.classList.remove('selected'); selectedMarkerEl = null; }
      }
    } catch(err) {}
  }
  document.addEventListener('message', handleMessage);
  window.addEventListener('message', handleMessage);
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));

  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function() { map.invalidateSize(true); });
    ro.observe(document.getElementById('map'));
  }
</script>
</body>
</html>
  `;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
const ZillowMapScreen = () => {
  const insets    = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapReady, setMapReady]                  = useState(false);
  const [containerSize, setContainerSize]        = useState({ w: SCREEN_W, h: SCREEN_H });

  const previewAnim = useRef(new Animated.Value(0)).current;

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerSize({ w: width, h: height });
      webViewRef.current?.postMessage(JSON.stringify({ type: 'INVALIDATE_SIZE' }));
    }
  }, []);

  const showPreview = useCallback((property: Property) => {
    setSelectedProperty(property);
    Animated.spring(previewAnim, {
      toValue: 1, useNativeDriver: true, tension: 60, friction: 10,
    }).start();
  }, [previewAnim]);

  const hidePreview = useCallback(() => {
    Animated.timing(previewAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setSelectedProperty(null));
    webViewRef.current?.postMessage(JSON.stringify({ type: 'DESELECT' }));
  }, [previewAnim]);

  // Giống MapScreen: nhận propertyId, lookup trong PROPERTIES
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'MAP_READY')    setMapReady(true);
      if (msg.type === 'MAP_PRESS')    hidePreview();
      if (msg.type === 'MARKER_PRESS') {
        const property = PROPERTIES.find((p: any) => p.id === msg.propertyId);
        if (property) showPreview(property);
      }
    } catch (_) {}
  }, [showPreview, hidePreview]);

  const mapHTML = getLeafletHTML(MARKERS);

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      {/* ── Map WebView ── */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={[
          StyleSheet.absoluteFillObject,
          { width: containerSize.w, height: containerSize.h },
        ]}
        androidLayerType="hardware"
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
        scalesPageToFit={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback
      />

      {/* ── Search Bar ── */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Home feature, school, location..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.micBtn}>
            <Text style={{ fontSize: 16 }}>🎙</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Result count badge ── */}
      <View style={[styles.countBadge, { top: insets.top + 68 }]}>
        <Text style={styles.countBadgeText}>🏠 {PROPERTIES.length} recently sold homes</Text>
      </View>

      {/* ── Bottom toolbar ── */}
      <View style={[styles.bottomToolbar, { bottom: 20 + insets.bottom }]}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity style={styles.toolbarCircleBtn}>
            <Text style={styles.toolbarBtnIcon}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarCircleBtn}>
            <Text style={styles.toolbarBtnIcon}>✋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarCircleBtn}>
            <Text style={styles.toolbarBtnIcon}>➤</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveSearchBtn}>
          <Text style={styles.saveSearchText}>Save Search</Text>
        </TouchableOpacity>
      </View>

      {/* ── Property preview card (giống hệt MapScreen) ── */}
      {selectedProperty && (
        <Animated.View
          style={[
            styles.previewContainer,
            { bottom: 2 },
            {
              opacity: previewAnim,
              transform: [{
                translateY: previewAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }),
              }],
            },
          ]}
        >
          <PropertyPreviewCard property={selectedProperty} onClose={hidePreview} />
        </Animated.View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },

  topBar: {
    position: 'absolute', left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 24,
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: '#222', padding: 0 },
  micBtn: { padding: 2 },
  filterBtn: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  filterIcon: { fontSize: 20 },

  countBadge: {
    position: 'absolute', left: 12,
    backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 4, elevation: 3, zIndex: 10,
  },
  countBadgeText: { fontSize: 12, color: '#374151', fontWeight: '700' },

  bottomToolbar: {
    position: 'absolute', left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10,
  },
  toolbarLeft: { flexDirection: 'row', gap: 8 },
  toolbarCircleBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  toolbarBtnIcon: { fontSize: 20 },
  saveSearchBtn: {
    flex: 1, backgroundColor: '#006aff', borderRadius: 30,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#006aff', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  saveSearchText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  previewContainer: {
    position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 20,
  },
});

export default ZillowMapScreen;