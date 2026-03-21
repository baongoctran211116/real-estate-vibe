// filename: src/screens/MapScreen.tsx
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useMapProperties } from '../features/map/useMapProperties';
import {
  useFilterStore,
  PROVINCES,
  PROVINCE_REGIONS,
} from '../store/useFilterStore';
import PropertyPreviewCard from '../components/PropertyPreviewCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { Property, Province } from '../types/property';

const INIT_LAT  = 16.0;
const INIT_LNG  = 106.5;
const INIT_ZOOM = 6;

const MapScreen: React.FC = () => {
  const insets    = useSafeAreaInsets();
  const isFocused  = useIsFocused();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filterVisible, setFilterVisible]        = useState(false);
  const [searchText, setSearchText]              = useState('');
  const [mapReady, setMapReady]                  = useState(false);
  const [resultCount, setResultCount]            = useState(0);
  // FIX grey overlay root cause: dùng kích thước đo được từ onLayout thay vì SCREEN_W/H tĩnh
  const [containerSize, setContainerSize]        = useState({ w: SCREEN_W, h: SCREEN_H });

  //hoatt 
  
  const [layoutTick, setLayoutTick] = useState(0);
  useEffect(() => {
    if (isFocused) {
      setLayoutTick((v) => v + 1);
    }
  }, [isFocused]);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerSize({ w: width, h: height });
      // Ngay khi layout xác định lại → invalidate Leaflet
      webViewRef.current?.postMessage(JSON.stringify({ type: 'INVALIDATE_SIZE' }));
    }
  }, []);

  const prevFocused   = useRef(false);
  const isFirstMount  = useRef(true);
  // true chỉ khi user bấm tab Map (không phải back từ PropertyDetail)
  const tabPressedRef = useRef(false);

  // Lắng nghe sự kiện tabPress — chỉ fire khi user bấm đúng tab icon
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      tabPressedRef.current = true;
    });
    return unsubscribe;
  }, [navigation]);

  // FIX grey overlay: invalidate WebView size ở nhiều mốc thời gian sau khi focus
  // (navigation transition kéo dài ~300ms, cần invalidate sau khi hoàn tất)
  useEffect(() => {
    if (!isFocused || !mapReady) return;

    let raf1: any;
    let raf2: any;

    const run = () => {
      // đợi animation frame ổn định
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'INVALIDATE_SIZE' })
          );
        });
      });
    };

    // delay đúng thời điểm navigation animation xong (~300ms)
    const t = setTimeout(run, 320);

    return () => {
      clearTimeout(t);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [isFocused, mapReady]);

  // useEffect(() => {
  //   if (isFocused && mapReady) {
  //     const timers = [50, 200, 450, 800].map((ms) =>
  //       setTimeout(() => {
  //         webViewRef.current?.postMessage(JSON.stringify({ type: 'INVALIDATE_SIZE' }));
  //       }, ms)
  //     );
  //     return () => timers.forEach(clearTimeout);
  //   }
  // }, [isFocused, mapReady]);

  const previewAnim  = useRef(new Animated.Value(0)).current;

  const filters        = useFilterStore((s) => s.filters);
  const setFilter      = useFilterStore((s) => s.setFilter);
  const mapFlyToTarget = useFilterStore((s) => s.mapFlyToTarget);
  const clearMapFlyTo  = useFilterStore((s) => s.clearMapFlyTo);
  const resetFilters   = useFilterStore((s) => s.resetFilters);

  // ✅ FIX 1: Tính hasActive trực tiếp từ state thay vì gọi hàm trong selector
  // (gọi hàm trong selector tạo giá trị mới mỗi render → infinite loop)
  const hasActive = useFilterStore((s) => {
    return (
      s.searchKeyword.trim().length > 0 ||
      Object.values(s.filters).some((v) => v !== undefined && v !== null && v !== '')
    );
  });

  const { properties, isLoading } = useMapProperties();

  // ─── Filtered properties ───────────────────────────────────
  const filteredProperties = useMemo(() => {
    if (!searchText.trim()) return properties;
    const q = searchText.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q),
    );
  }, [properties, searchText]);

  // ✅ FIX 2: Bỏ useEffect setResultCount riêng biệt → dùng useMemo/derived value
  // Trước: useEffect([filteredProperties]) → setState → re-render → loop
  const currentResultCount = filteredProperties.length;

  // Sync resultCount chỉ khi thực sự thay đổi (tránh setState trong render)
  useEffect(() => {
    setResultCount(currentResultCount);
  }, [currentResultCount]);

  // ─── Animate helpers ───────────────────────────────────────
  const showPreview = useCallback((property: Property) => {
    setSelectedProperty(property);    
    Animated.spring(previewAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [previewAnim]);

  const hidePreview = useCallback(() => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedProperty(null));
    webViewRef.current?.postMessage(JSON.stringify({ type: 'DESELECT' }));
  }, [previewAnim]);

  // ─── Tab focus reset ───────────────────────────────────────
  // ✅ FIX 3: Dùng ref để lưu hidePreview/resetFilters thay vì đưa vào deps
  // Trước: [isFocused, mapReady, mapFlyToTarget, resetFilters, hidePreview]
  // → resetFilters/hidePreview là hàm mới mỗi render → loop
  const hidePreviewRef  = useRef(hidePreview);
  const resetFiltersRef = useRef(resetFilters);
  useEffect(() => { hidePreviewRef.current  = hidePreview; },  [hidePreview]);
  useEffect(() => { resetFiltersRef.current = resetFilters; }, [resetFilters]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevFocused.current  = isFocused;
      return;
    }

    // Transition từ không focus → focus
    if (isFocused && !prevFocused.current && mapReady) {
      if (tabPressedRef.current && !mapFlyToTarget) {
        // Chỉ reset khi user chủ động bấm tab Map
        // (KHÔNG reset khi back từ PropertyDetail/màn hình khác)
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'FLY_TO', lat: INIT_LAT, lng: INIT_LNG, zoom: INIT_ZOOM }),
        );
        resetFiltersRef.current();
        setSearchText('');
        hidePreviewRef.current();
      }
      // Luôn reset flag sau khi xử lý
      tabPressedRef.current = false;
    }

    prevFocused.current = isFocused;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, mapReady, mapFlyToTarget]);

  // ─── External fly-to ──────────────────────────────────────
  // ✅ FIX 4: Dùng ref cho filteredProperties thay vì đưa vào deps
  // (array mới mỗi render → infinite loop)
  const filteredPropertiesRef = useRef(filteredProperties);
  useEffect(() => { filteredPropertiesRef.current = filteredProperties; }, [filteredProperties]);

  useEffect(() => {
    if (!mapFlyToTarget || !mapReady) return;

    // FIX flyTo timing: nếu screen chưa focus (vd đang ở detail), delay để chờ transition xong
    const delay = isFocused ? 0 : 420;
    const flyTimer = setTimeout(() => {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type:   'FLY_TO',
          lat:    mapFlyToTarget.lat,
          lng:    mapFlyToTarget.lng,
          zoom:   mapFlyToTarget.zoom,
          topPad: 0,
        }),
      );

      const matchProp = filteredPropertiesRef.current.find(
        (p) =>
          Math.abs(p.latitude  - mapFlyToTarget.lat) < 0.0001 &&
          Math.abs(p.longitude - mapFlyToTarget.lng) < 0.0001,
      );
      if (matchProp) {
        setTimeout(() => {
          webViewRef.current?.postMessage(
            JSON.stringify({ type: 'JUMP_TO_PROPERTY', propertyId: matchProp.id }),
          );
        }, 950);
      }
    }, delay);

    clearMapFlyTo();
    return () => clearTimeout(flyTimer);
  // clearMapFlyTo stable (zustand action), mapFlyToTarget dùng timestamp để re-trigger
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapFlyToTarget, mapReady, isFocused]);

  // ─── Province filter change → fly ─────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    if (filters.province && PROVINCE_REGIONS[filters.province]) {
      const region = PROVINCE_REGIONS[filters.province];
      webViewRef.current?.postMessage(
        JSON.stringify({
          type:   'FLY_TO',
          lat:    region.lat,
          lng:    region.lng,
          zoom:   region.zoom,
          topPad: 150,
        }),
      );
    }
  }, [filters.province, mapReady]);

  // ─── Search text → province match → fly ───────────────────
  useEffect(() => {
    if (!mapReady || !searchText.trim()) return;
    const q = searchText.trim().toLowerCase();
    const matchedProvince = PROVINCES.find((p) => p.toLowerCase().includes(q));
    if (matchedProvince && PROVINCE_REGIONS[matchedProvince as Province]) {
      const region = PROVINCE_REGIONS[matchedProvince as Province];
      webViewRef.current?.postMessage(
        JSON.stringify({ type: 'FLY_TO', lat: region.lat, lng: region.lng, zoom: region.zoom, topPad: 150 }),
      );
    }
  }, [searchText, mapReady]);

  // ─── Build Leaflet HTML ────────────────────────────────────
  const buildMapHTML = useCallback((props: Property[]) => {
    const markersJson = JSON.stringify(
      props.map((p) => ({
        id:       p.id,
        lat:      p.latitude,
        lng:      p.longitude,
        price:    formatPriceShort(p.price),
        title:    p.title,
        district: p.district,
        province: p.province,
        type:     p.propertyType,
      })),
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .price-marker {
      background: #F5A623; color: #1A1A1A; font-size: 12px; font-weight: 800;
      padding: 5px 10px; border-radius: 20px; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.28); border: 2.5px solid #FFFFFF;
      cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
      letter-spacing: -0.2px;
    }
    .price-marker::after {
      content: ''; position: absolute; bottom: -8px; left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent; border-right: 6px solid transparent;
      border-top: 7px solid #F5A623;
    }
    .price-marker.selected {
      background: #006AFF; color: #FFFFFF; transform: scale(1.18);
      box-shadow: 0 4px 16px rgba(0,106,255,0.55); z-index: 1000 !important;
      border-color: #FFFFFF;
    }
    .price-marker.selected::after { border-top-color: #006AFF; }
    @keyframes popIn {
      0%   { transform: scale(0.5); opacity: 0; }
      80%  { transform: scale(1.1); }
      100% { transform: scale(1);   opacity: 1; }
    }
    .price-marker { animation: popIn 0.25s ease forwards; }
    @keyframes pulse {
      0%   { box-shadow: 0 0 0 0 rgba(0,106,255,0.6); }
      70%  { box-shadow: 0 0 0 14px rgba(0,106,255,0); }
      100% { box-shadow: 0 0 0 0 rgba(0,106,255,0); }
    }
    .price-marker.pulse { animation: pulse 1s ease-in-out 3; }
    .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
      background-color: rgba(245,166,35,0.25) !important;
    }
    .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
      background-color: #F5A623 !important; color: #1A1A1A !important;
      font-weight: 800 !important; font-size: 13px !important;
    }
    .leaflet-control-zoom a { border-radius: 8px !important; }
    .leaflet-control-zoom { border-radius: 10px !important; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const INIT_LAT=${INIT_LAT}, INIT_LNG=${INIT_LNG}, INIT_ZOOM=${INIT_ZOOM};
  const map = L.map('map', { zoomControl: false }).setView([INIT_LAT, INIT_LNG], INIT_ZOOM);
  L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
    attribution: '© OpenStreetMap', maxZoom: 19,
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  const clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50, showCoverageOnHover: false,
    spiderfyOnMaxZoom: true, zoomToBoundsOnClick: true,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
      return L.divIcon({ html: '<div>'+count+'</div>', className: 'marker-cluster marker-cluster-'+size, iconSize: [40,40] });
    },
  });
  const markers=${markersJson};
  let selectedId=null;
  const markerMap={};
  function deselectAll() {
    if (selectedId) {
      const el=document.getElementById('marker-'+selectedId);
      if(el) el.classList.remove('selected','pulse');
      selectedId=null;
    }
  }
  function selectMarker(id) {
    deselectAll(); selectedId=id;
    const el=document.getElementById('marker-'+id);
    if(el) el.classList.add('selected');
  }
  markers.forEach(function(p) {
    const icon=L.divIcon({
      html:'<div class="price-marker" id="marker-'+p.id+'">'+p.price+'</div>',
      className:'', iconSize:null, iconAnchor:[0,28],
    });
    const marker=L.marker([p.lat,p.lng],{icon});
    marker.on('click',function(e){
      L.DomEvent.stopPropagation(e);
      selectMarker(p.id);
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'MARKER_PRESS',propertyId:p.id}));
    });
    markerMap[p.id]={leafletMarker:marker,data:p};
    clusterGroup.addLayer(marker);
  });
  map.addLayer(clusterGroup);
  map.on('click',function(){
    deselectAll();
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_PRESS'}));
  });
  function flyToWithOffset(lat,lng,zoom,topPad){
    topPad=topPad||0;
    map.flyTo([lat,lng],zoom,{duration:0.85,easeLinearity:0.35});
    if(topPad>0){
      map.once('moveend',function(){
        map.panBy([0,Math.round(topPad/2)],{animate:true,duration:0.25,easeLinearity:0.5});
      });
    }
  }
  function handleMessage(e){
    try{
      const msg=JSON.parse(e.data);
      console.log('[WebView message]', msg);      
      if(msg.type==='FLY_TO') flyToWithOffset(msg.lat,msg.lng,msg.zoom,msg.topPad||0);
      if(msg.type==='INVALIDATE_SIZE'){ map.invalidateSize(true); }
      if(msg.type==='RESET_VIEW'){
        deselectAll();
        map.flyTo([INIT_LAT,INIT_LNG],INIT_ZOOM,{duration:0.85,easeLinearity:0.35});
      }
      if(msg.type==='DESELECT') deselectAll();
      if(msg.type==='JUMP_TO_PROPERTY'){
        const target=markerMap[msg.propertyId];
        if(!target) return;
        map.flyTo([target.data.lat,target.data.lng],16,{duration:1.0});
        map.once('moveend',function(){
          clusterGroup.zoomToShowLayer(target.leafletMarker,function(){
            selectMarker(msg.propertyId);
            const el=document.getElementById('marker-'+msg.propertyId);
            if(el){ el.classList.add('pulse'); setTimeout(function(){el.classList.remove('pulse');},3500); }
          });
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'JUMP_DONE',propertyId:msg.propertyId}));
        });
      }
    }catch(err){}
  }
  document.addEventListener('message',handleMessage);
  window.addEventListener('message',handleMessage);
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_READY'}));
  // Force Leaflet to recalculate its container size at multiple checkpoints
  [100, 300, 600, 1200].forEach(function(ms){
    setTimeout(function(){ map.invalidateSize(true); }, ms);
    // setTimeout(() => {
    //   map.invalidateSize(true);
    //   //map._onResize(); //
    // }, 0);
  });
  // ResizeObserver: tự invalidate bất cứ khi nào container thay đổi kích thước
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function() { map.invalidateSize(true); });
    ro.observe(document.getElementById('map'));
  }
</script>
</body>
</html>`;
  }, []);

  // ─── WebView message handler ──────────────────────────────
  // ✅ FIX 5: Dùng ref cho filteredProperties trong callback
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'MAP_READY') setMapReady(true);
      if (msg.type === 'MARKER_PRESS') {
        const property = filteredPropertiesRef.current.find((p) => p.id === msg.propertyId);
        if (property) showPreview(property);
      }
      if (msg.type === 'MAP_PRESS') hidePreview();
    } catch (e) {}
  }, [showPreview, hidePreview]);

  // ─── Province pill ────────────────────────────────────────
  const handleProvincePill = useCallback(
    (province: Province) => {
      const isDeselect = filters.province === province;
      setFilter('province', isDeselect ? undefined : province);
      if (!isDeselect) {
        const region = PROVINCE_REGIONS[province];
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'FLY_TO', lat: region.lat, lng: region.lng, zoom: region.zoom, topPad: 150 }),
        );
      } else {
        webViewRef.current?.postMessage(
          JSON.stringify({ type: 'FLY_TO', lat: INIT_LAT, lng: INIT_LNG, zoom: INIT_ZOOM }),
        );
      }
    },
    [filters.province, setFilter],
  );

  const handleResetView = useCallback(() => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'RESET_VIEW' }));
    resetFilters();
    setSearchText('');
    hidePreview();
  }, [resetFilters, hidePreview]);

  const mapHTML = useMemo(
    () => buildMapHTML(filteredProperties),
    [filteredProperties, buildMapHTML],
  );

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={[StyleSheet.absoluteFillObject, 
        {width: containerSize.w, height: containerSize.h , opacity: layoutTick % 2 === 0 ? 1 : 0.999}]}        
        androidLayerType="hardware"
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
        scalesPageToFit={false}
      />

      {(isLoading || !mapReady) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#006AFF" />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      )}

      {/* Search + filter bar */}
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
          style={[styles.filterBtn, hasActive && styles.filterBtnActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {hasActive && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Province pills */}
      <View style={[styles.pillsWrapper, { top: insets.top + 68 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {PROVINCES.map((p) => {
            const isActive = filters.province === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.provincePill, isActive && styles.provincePillActive]}
                onPress={() => handleProvincePill(p as Province)}
                activeOpacity={0.75}
              >
                {isActive && <Text style={styles.pillCheck}>✓ </Text>}
                <Text style={[styles.provincePillText, isActive && styles.provincePillTextActive]} numberOfLines={1}>
                  {p.replace('Ho Chi Minh City', 'TP.HCM')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Result count */}
      <View style={[styles.countBadge, { top: insets.top + 118 }]}>
        <Text style={styles.countBadgeText}>🏠 {resultCount} bất động sản</Text>
      </View>

      {/* Bottom toolbar */}
      <View style={[styles.bottomToolbar, { bottom: 20 + insets.bottom }]}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity style={styles.toolbarCircleBtn}>
            <Text style={styles.toolbarBtnIcon}>🗂️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarCircleBtn} onPress={handleResetView}>
            <Text style={styles.toolbarBtnIcon}>🎯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Property preview card */}
      {selectedProperty && (
        <Animated.View
          style={[
            styles.previewContainer,
            // FIX preview position: giảm bottom để card nằm gọn trên tab bar, tránh bị che khuất khi có insets lớn
            //{ bottom: 64 + insets.bottom },
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

      <FilterPanel visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </View>
  );
};

function formatPriceShort(price: number): string {
  if (price >= 1_000_000_000) return parseFloat((price / 1_000_000_000).toFixed(1)) + ' tỷ';
  if (price >= 1_000_000)     return Math.round(price / 1_000_000) + ' tr';
  return price.toString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.93)',
    alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 99,
  },
  loadingText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  topBar: { position: 'absolute', left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  searchWrapper: { flex: 1 },
  mapSearchBar: { backgroundColor: '#FFFFFF', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  filterBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  filterBtnActive: { backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#006AFF' },
  filterBtnIcon: { fontSize: 20 },
  filterDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#006AFF' },
  pillsWrapper: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  pillsScroll: { paddingHorizontal: 12, gap: 7, flexDirection: 'row', alignItems: 'center' },
  provincePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.97)', shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3, borderWidth: 1, borderColor: 'transparent' },
  provincePillActive: { backgroundColor: '#006AFF', borderColor: '#006AFF' },
  pillCheck: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  provincePillText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  provincePillTextActive: { color: '#FFFFFF' },
  countBadge: { position: 'absolute', alignSelf: 'center', left: 12, backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3, zIndex: 10 },
  countBadgeText: { fontSize: 12, color: '#374151', fontWeight: '700' },
  bottomToolbar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', zIndex: 10 },
  toolbarLeft: { flexDirection: 'row', gap: 10 },
  toolbarCircleBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  toolbarBtnIcon: { fontSize: 22 },
  previewContainer: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 20 },
});

export default MapScreen;