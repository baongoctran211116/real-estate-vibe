
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PropertyPreviewCard from '../components/PropertyPreviewCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';

import { Property, Province } from '../types/property';
import { useFilterStore } from '../store/useFilterStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMapProperties } from '../features/map/useMapProperties';
import { useProvinces } from '../features/province/useProvinces';
import { useMapConfig, useThemeColors, useSearchConfig } from '../features/appConfig/useAppConfig';
import { SPACING, RADIUS } from '../utils/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitLocation } from '../services/locationService';

// ─── Screen dimensions (init value — layout thực tính qua onLayout) ───────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Price formatter ──────────────────────────────────────────────────────────
function formatPriceShort(price: number): string {
  if (price >= 1_000_000_000) return parseFloat((price / 1_000_000_000).toFixed(1)) + ' tỷ';
  if (price >= 1_000_000) return Math.round(price / 1_000_000) + ' tr';
  return price.toString();
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

// ─── Leaflet HTML builder — nhận config từ server, không hardcode ─────────────
const buildLeafletHtml = (
  lat: number,
  lng: number,
  zoom: number,
  primaryColor: string,
  mapBg: string,
) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body,#map{width:100%;height:100%;background:${mapBg}}
  .pm{
    background:rgba(28,28,28,0.90);color:#fff;
    border-radius:20px;padding:5px 11px;
    font-family:-apple-system,'SF Pro Text','Helvetica Neue',sans-serif;
    font-size:12.5px;font-weight:600;white-space:nowrap;
    box-shadow:0 2px 8px rgba(0,0,0,0.35),0 1px 2px rgba(0,0,0,0.2);
    border:1.5px solid rgba(255,255,255,0.10);letter-spacing:0.15px;line-height:1;
    will-change:transform;
    transition:transform 0.15s ease,background 0.15s ease,box-shadow 0.15s ease;
    display:inline-flex;align-items:center;cursor:pointer;
  }
  .pm.hi{background:#f5e6c8;color:#1a1a1a;border-color:rgba(180,140,70,0.35);box-shadow:0 2px 8px rgba(180,140,70,0.30)}
  .pm.sel{background:${primaryColor};color:#fff;border:2px solid rgba(255,255,255,0.85);transform:scale(1.18);box-shadow:0 4px 16px rgba(0,106,255,0.45);z-index:9999!important}
  .leaflet-div-icon{background:transparent!important;border:none!important;overflow:visible!important}
  .leaflet-control-zoom{border-radius:12px!important;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.18)!important;border:none!important}
  .leaflet-control-zoom a{border-radius:0!important;border-bottom:1px solid #e5e7eb!important;color:#374151!important;font-weight:600!important}
  .leaflet-control-zoom a:last-child{border-bottom:none!important}
  .leaflet-tile-pane{will-change:transform}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  var selEl=null, markerMap={}, markerGroup=L.layerGroup();
  var map=L.map('map',{
    center:[${lat},${lng}],zoom:${zoom},
    zoomControl:false,attributionControl:false,
    zoomAnimation:true,fadeAnimation:true,markerZoomAnimation:true,
  });
  L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',{
    maxZoom:19,updateWhenIdle:false,updateWhenZooming:false,keepBuffer:4,
  }).addTo(map);
  L.control.zoom({position:'bottomright'}).addTo(map);
  markerGroup.addTo(map);

  function makeIcon(label,isHi){
    return L.divIcon({html:'<span class="pm'+(isHi?' hi':'')+'" >'+label+'</span>',className:'',iconSize:null,iconAnchor:null});
  }
  function updateMarkers(props){
    var newIds={};
    props.forEach(function(p){newIds[p.id]=true;});
    Object.keys(markerMap).forEach(function(id){
      if(!newIds[id]){markerGroup.removeLayer(markerMap[id]);delete markerMap[id];}
    });
    if(selEl&&!document.body.contains(selEl))selEl=null;
    props.forEach(function(p){
      if(markerMap[p.id])return;
      var mk=L.marker([p.lat,p.lng],{icon:makeIcon(p.label,p.isHighlighted),zIndexOffset:p.isHighlighted?100:0});
      (function(prop,m){
        m.on('click',function(e){
          if(selEl)selEl.classList.remove('sel');
          var el=e.target._icon&&e.target._icon.querySelector('.pm');
          if(el){el.classList.add('sel');selEl=el;}
          if(window.ReactNativeWebView)
            window.ReactNativeWebView.postMessage(JSON.stringify({type:'MARKER_PRESS',propertyId:prop.id}));
        });
      })(p,mk);
      markerGroup.addLayer(mk);
      markerMap[p.id]=mk;
    });
  }
  map.on('click',function(){
    if(selEl){selEl.classList.remove('sel');selEl=null;}
    if(window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_PRESS'}));
  });
  function flyTo(lat,lng,zoom,topPad,bottomPad){
    var offsetY=Math.round(((topPad||0)-(bottomPad||0))/2);
    map.flyTo([lat,lng],zoom,{duration:0.75,easeLinearity:0.4});
    if(offsetY!==0)map.once('moveend',function(){map.panBy([0,offsetY],{animate:true,duration:0.2});});
  }
  function onMsg(e){
    var msg;try{msg=JSON.parse(e.data);}catch(err){return;}
    if(msg.type==='UPDATE_MARKERS')      updateMarkers(msg.markers);
    else if(msg.type==='FLY_TO')         flyTo(msg.lat,msg.lng,msg.zoom,msg.topPad||0,msg.bottomPad||0);
    else if(msg.type==='INVALIDATE_SIZE')map.invalidateSize(true);
    else if(msg.type==='RESET_VIEW'){
      if(selEl){selEl.classList.remove('sel');selEl=null;}
      map.flyTo([${lat},${lng}],${zoom},{duration:0.75});
    }
    else if(msg.type==='DESELECT'){
      if(selEl){selEl.classList.remove('sel');selEl=null;}
    }
  }
  document.addEventListener('message',onMsg);
  window.addEventListener('message',onMsg);
  setTimeout(function(){map.invalidateSize(true);},150);
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_READY'}));
})();
</script>
</body>
</html>`;

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BDSMapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  // ── Remote config ──────────────────────────────────────────────────────────
  const mapConfig = useMapConfig();       // { defaultLat, defaultLng, defaultZoom }
  const theme = useThemeColors();     // { primary, mapBackground, ... }
  const searchConfig = useSearchConfig();   // { debounceMs }

  // ── Store ──────────────────────────────────────────────────────────────────
  const filters = useFilterStore((s) => s.filters);
  const setFilter = useFilterStore((s) => s.setFilter);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const hasActive = useFilterStore((s) =>
    s.searchKeyword.trim().length > 0 ||
    Object.values(s.filters).some((v) => v !== undefined && v !== null && v !== '')
  );
  const mapFlyToTarget = useFilterStore((s) => s.mapFlyToTarget);
  const clearMapFlyTo = useFilterStore((s) => s.clearMapFlyTo);
  const user = useAuthStore((s) => s.user);

  // ── Data từ API ────────────────────────────────────────────────────────────
  const { properties: allProperties, isLoading: propertiesLoading } = useMapProperties();
  const { provinceNames, getProvinceView, getDisplayName, isLoading: provincesLoading } = useProvinces();

  // ── Local state ────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: SCREEN_W, h: SCREEN_H });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sortedProvinces, setSortedProvinces] = useState<Province[]>([]);

  const previewAnim = useRef(new Animated.Value(0)).current;
  const mapReadyRef = useRef(false);
  const insetsRef = useRef(insets);
  const selPropRef = useRef(selectedProperty);
  const containerSizeRef = useRef({ w: SCREEN_W, h: SCREEN_H });
  const hasPromptedLoc = useRef(false);

  useEffect(() => { insetsRef.current = insets; }, [insets]);
  useEffect(() => { selPropRef.current = selectedProperty; }, [selectedProperty]);

  // ── Location check & confirm modal ───────────────────────────────────────
  // Tỉnh mặc định khi user từ chối cấp quyền vị trí
  const DEFAULT_PROVINCE: Province = 'ho-chi-minh';

  useEffect(() => {
    if (provinceNames.length > 0 && !hasPromptedLoc.current) {
      hasPromptedLoc.current = true;
      (async () => {
        let currentLoc = null;
        let locationGranted = false;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            locationGranted = true;
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            currentLoc = loc.coords;
          }
        } catch (e) {
          console.warn('Location error:', e);
        }

        if (!locationGranted || !currentLoc) {
          // User từ chối hoặc lỗi → mặc định TP.HCM, không show modal
          setFilter('province', DEFAULT_PROVINCE);
          const r = getProvinceView(DEFAULT_PROVINCE);
          if (r) flyTo(r.lat, r.lng, r.zoom);
          return;
        }

        // Có location → submit + sắp xếp + show modal chọn tỉnh
        submitLocation(currentLoc.latitude, currentLoc.longitude, user?.id);

        const sorted = [...provinceNames].sort((a, b) => {
          const infoA = getProvinceView(a);
          const infoB = getProvinceView(b);
          if (!infoA) return 1;
          if (!infoB) return -1;
          const distA = getDistance(currentLoc.latitude, currentLoc.longitude, infoA.lat, infoA.lng);
          const distB = getDistance(currentLoc.latitude, currentLoc.longitude, infoB.lat, infoB.lng);
          return distA - distB;
        });

        setSortedProvinces(sorted.slice(0, 4));
        setShowConfirmModal(true);
      })();
    }
  }, [provinceNames, getProvinceView]);



  // ── Leaflet HTML — build từ server config, chỉ rebuild khi config đổi ─────
  const leafletHtml = useMemo(
    () => buildLeafletHtml(
      mapConfig.defaultLat,
      mapConfig.defaultLng,
      mapConfig.defaultZoom,
      theme.primary,
      theme.mapBackground,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mapConfig.defaultLat, mapConfig.defaultLng, mapConfig.defaultZoom, theme.primary, theme.mapBackground]
  );

  // ── Messaging ─────────────────────────────────────────────────────────────
  const send = useCallback((msg: object) => {
    if (!mapReadyRef.current) return;
    webViewRef.current?.postMessage(JSON.stringify(msg));
  }, []);

  const getMapPadding = useCallback(() => ({
    topPad: insetsRef.current.top + 150,
    bottomPad: 20 + insetsRef.current.bottom + (selPropRef.current ? 140 : 0),
  }), []);

  const flyTo = useCallback((lat: number, lng: number, zoom: number) => {
    const { topPad, bottomPad } = getMapPadding();
    send({ type: 'FLY_TO', lat, lng, zoom, topPad, bottomPad });
  }, [send, getMapPadding]);

  // ── Handle cross-screen map fly request ──────────────────────────────
  useEffect(() => {
    if (mapReady && mapFlyToTarget) {
      flyTo(mapFlyToTarget.lat, mapFlyToTarget.lng, mapFlyToTarget.zoom);
      clearMapFlyTo();
    }
  }, [mapFlyToTarget, mapReady, flyTo, clearMapFlyTo]);

  // ── Filter client-side ────────────────────────────────────────────────────
  const filteredProperties = useMemo<Property[]>(() => {
    let list = allProperties;
    if (filters.minPrice) list = list.filter(p => p.price >= (filters.minPrice as number));
    if (filters.maxPrice) list = list.filter(p => p.price <= (filters.maxPrice as number));
    if (filters.minBedrooms) list = list.filter(p => p.bedrooms >= (filters.minBedrooms as number));
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProperties, filters, searchText]);

  const markers = useMemo(() =>
    filteredProperties.map(p => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      label: formatPriceShort(p.price),
      isHighlighted: !!p.isHighlighted,
    })),
    [filteredProperties]
  );

  const markersRef = useRef(markers);
  useEffect(() => { markersRef.current = markers; }, [markers]);

  const filteredPropertiesRef = useRef(filteredProperties);
  useEffect(() => { filteredPropertiesRef.current = filteredProperties; }, [filteredProperties]);

  useEffect(() => {
    send({ type: 'UPDATE_MARKERS', markers });
  }, [markers, send]);

  // ── Preview ───────────────────────────────────────────────────────────────
  const showPreview = useCallback((property: Property) => {
    setSelectedProperty(property);
    Animated.spring(previewAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, [previewAnim]);

  const hidePreview = useCallback(() => {
    Animated.timing(previewAnim, { toValue: 0, duration: 180, useNativeDriver: true })
      .start(() => setSelectedProperty(null));
    send({ type: 'DESELECT' });
  }, [previewAnim, send]);

  // ── WebView handler ───────────────────────────────────────────────────────
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'MAP_READY') {
        mapReadyRef.current = true;
        setMapReady(true);
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'UPDATE_MARKERS', markers: markersRef.current })
        );
      }
      if (msg.type === 'MAP_PRESS') hidePreview();
      if (msg.type === 'MARKER_PRESS') {
        const prop = filteredPropertiesRef.current.find(p => p.id === msg.propertyId);
        if (prop) showPreview(prop);
      }
    } catch (_) { }
  }, [showPreview, hidePreview]);

  // ── Province handlers ─────────────────────────────────────────────────────
  const handleProvincePill = useCallback((province: Province) => {
    const isDeselect = filters.province === province;
    setFilter('province', isDeselect ? undefined : province);
    const r = !isDeselect ? getProvinceView(province) : null;
    if (r) flyTo(r.lat, r.lng, r.zoom);
    else flyTo(mapConfig.defaultLat, mapConfig.defaultLng, mapConfig.defaultZoom);
  }, [filters.province, setFilter, flyTo, getProvinceView, mapConfig]);

  const handleFilterProvinceSelect = useCallback((province: Province | undefined) => {
    const r = province ? getProvinceView(province) : null;
    if (r) flyTo(r.lat, r.lng, r.zoom);
    else flyTo(mapConfig.defaultLat, mapConfig.defaultLng, mapConfig.defaultZoom);
  }, [flyTo, getProvinceView, mapConfig]);

  const handleResetView = useCallback(() => {
    resetFilters();
    setSearchText('');
    hidePreview();
    send({ type: 'RESET_VIEW' });
  }, [send, resetFilters, hidePreview]);

  // ── Search debounce — dùng debounceMs từ server config ───────────────────
  useEffect(() => {
    if (!mapReady || !searchText.trim()) return;
    const t = setTimeout(() => {
      const q = searchText.toLowerCase();
      const matched = provinceNames.find(p => p.toLowerCase().includes(q));
      if (matched) {
        const r = getProvinceView(matched);
        if (r) flyTo(r.lat, r.lng, r.zoom);
      }
    }, searchConfig.debounceMs);
    return () => clearTimeout(t);
  }, [searchText, mapReady, flyTo, provinceNames, getProvinceView, searchConfig.debounceMs]);

  // ── Layout ────────────────────────────────────────────────────────────────
  const handleContainerLayout = useCallback((e: any) => {
    const { width, height } = e.nativeEvent.layout;
    if (
      width > 0 && height > 0 &&
      (width !== containerSizeRef.current.w || height !== containerSizeRef.current.h)
    ) {
      containerSizeRef.current = { w: width, h: height };
      setContainerSize({ w: width, h: height });
      send({ type: 'INVALIDATE_SIZE' });
    }
  }, [send]);

  const isLoading = propertiesLoading || provincesLoading;
  const resultCount = filteredProperties.length;

  // ── Styles phụ thuộc theme (inline — không dùng StyleSheet.create vì dynamic) ─
  const dynamicStyles = useMemo(() => ({
    filterBtnActive: {
      backgroundColor: theme.primaryLight ?? '#EFF6FF',
      borderWidth: 1.5,
      borderColor: theme.primary,
    },
    filterDot: { backgroundColor: theme.primary },
    provincePillActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    applyBtnBg: { backgroundColor: theme.primary },
    countBadgeText: { color: '#374151' },
    modalItemHighlight: { backgroundColor: theme.primaryLight ?? '#EFF6FF', borderColor: theme.primary, borderWidth: 1 },
    modalItemTextHighlight: { color: theme.primary, fontWeight: '700' as any },
  }), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.mapBackground }]} onLayout={handleContainerLayout}>

      {/* ── Map WebView ── */}
      <WebView
        ref={webViewRef}
        source={{ html: leafletHtml }}
        style={[StyleSheet.absoluteFillObject, { width: containerSize.w, height: containerSize.h }]}
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
        overScrollMode="never"
      />

      {/* ── Loading overlay ── */}
      {(isLoading || !mapReady) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>
            {!mapReady ? 'Đang tải bản đồ...' : 'Đang tải bất động sản...'}
          </Text>
        </View>
      )}

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm tỉnh, thành phố, khu vực..."
            style={styles.mapSearchBar}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasActive && dynamicStyles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {hasActive && <View style={[styles.filterDot, dynamicStyles.filterDot]} />}
        </TouchableOpacity>
      </View>

      {/* ── Province pills ── */}
      {provinceNames.length > 0 && (
        <View style={[styles.pillsWrapper, { top: insets.top + 68 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
            decelerationRate="fast"
            removeClippedSubviews
          >
            {provinceNames.map((p) => {
              const isActive = filters.province === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.provincePill, isActive && dynamicStyles.provincePillActive]}
                  onPress={() => handleProvincePill(p)}
                  activeOpacity={0.75}
                >
                  {isActive && <Text style={styles.pillCheck}>✓ </Text>}
                  <Text
                    style={[styles.provincePillText, isActive && styles.provincePillTextActive]}
                    numberOfLines={1}
                  >
                    {getDisplayName(p)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Result count ── */}
      <View style={[styles.countBadge, { top: insets.top + 118 }]}>
        <Text style={styles.countBadgeText}>🏠 {resultCount} bất động sản</Text>
      </View>

      {/* ── Bottom toolbar ── */}
      <View style={[styles.bottomToolbar, { bottom: 20 + insets.bottom }]}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity style={styles.toolbarCircleBtn} activeOpacity={0.8}>
            <Text style={styles.toolbarBtnIcon}>🗂️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarCircleBtn} onPress={handleResetView} activeOpacity={0.8}>
            <Text style={styles.toolbarBtnIcon}>🎯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Property preview card ── */}
      {selectedProperty && (
        <Animated.View
          style={[
            styles.previewContainer,
            { bottom: 2 },
            {
              opacity: previewAnim,
              transform: [{ translateY: previewAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
            },
          ]}
        >
          <PropertyPreviewCard property={selectedProperty} onClose={hidePreview} />
        </Animated.View>
      )}

      {/* ── Filter panel ── */}
      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onProvinceSelect={handleFilterProvinceSelect}
      />

      {/* ── Confirm Modal ── */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bạn muốn xem bất động sản ở đâu?</Text>
            {sortedProvinces.map((p, index) => {
              const isCurrent = index === 0;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.modalItem, isCurrent && dynamicStyles.modalItemHighlight]}
                  onPress={() => {
                    setShowConfirmModal(false);
                    setFilter('province', p);
                    const r = getProvinceView(p);
                    if (r) flyTo(r.lat, r.lng, r.zoom);
                    else flyTo(mapConfig.defaultLat, mapConfig.defaultLng, mapConfig.defaultZoom);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalItemText, isCurrent && dynamicStyles.modalItemTextHighlight]}>
                    {getDisplayName(p)}
                    {isCurrent && ' (Gần bạn nhất)'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Styles tĩnh (không phụ thuộc theme) ─────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 99,
  },
  loadingText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },

  topBar: {
    position: 'absolute', left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10,
  },
  searchWrapper: { flex: 1 },
  mapSearchBar: {
    backgroundColor: '#FFFFFF', borderRadius: RADIUS.full,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  filterBtn: {
    width: 46, height: 46, borderRadius: RADIUS.lg, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  filterBtnIcon: { fontSize: 20 },
  filterDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
  },

  pillsWrapper: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  pillsScroll: { paddingHorizontal: SPACING.md, gap: 7, flexDirection: 'row', alignItems: 'center' },
  provincePill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.97)',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
    borderWidth: 1, borderColor: 'transparent',
  },
  pillCheck: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  provincePillText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  provincePillTextActive: { color: '#FFFFFF' },

  countBadge: {
    position: 'absolute', left: 12,
    backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base, paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 3, zIndex: 10,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700' },

  bottomToolbar: {
    position: 'absolute', left: SPACING.base, right: SPACING.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', zIndex: 10,
  },
  toolbarLeft: { flexDirection: 'row', gap: 10 },
  toolbarCircleBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  toolbarBtnIcon: { fontSize: 22 },

  previewContainer: {
    position: 'absolute', left: SPACING.base, right: SPACING.base,
    alignItems: 'center', zIndex: 20,
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modalContent: {
    width: '80%', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: SPACING.md, textAlign: 'center', color: '#1F2937' },
  modalItem: { paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center', borderRadius: RADIUS.md, marginBottom: 8 },
  modalItemText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
});

export default BDSMapScreen;
