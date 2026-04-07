// filename: src/components/FilterPanel.tsx
import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';

import { useFilterStore } from '../store/useFilterStore';
import { useProvinces } from '../features/province/useProvinces';
import { usePropertyTypeOptions, usePriceRanges, useThemeColors } from '../features/appConfig/useAppConfig';
import { Province, PropertyType } from '../types/property';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  onProvinceSelect?: (province: Province | undefined) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ visible, onClose, onProvinceSelect }) => {
  const filters      = useFilterStore((s) => s.filters);
  const setFilter    = useFilterStore((s) => s.setFilter);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const hasActive    = useFilterStore((s) => s.hasActiveFilters());

  // ── Tất cả data đọc từ API / remote config — không hardcode ──────────────
  const { provinceNames, getDisplayName } = useProvinces();
  const propertyTypes = usePropertyTypeOptions(); // từ server
  const priceRanges   = usePriceRanges();         // từ server
  const theme         = useThemeColors();          // từ server

  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number | null>(null);

  const handleProvince = useCallback(
    (province: Province) => {
      const next = filters.province === province ? undefined : province;
      setFilter('province', next);
      onProvinceSelect?.(next);
    },
    [filters.province, setFilter, onProvinceSelect]
  );

  const handlePropertyType = useCallback(
    (type: PropertyType) => {
      setFilter('propertyType', filters.propertyType === type ? undefined : type);
    },
    [filters.propertyType, setFilter]
  );

  const handlePriceRange = useCallback(
    (index: number) => {
      if (selectedPriceIndex === index) {
        setSelectedPriceIndex(null);
        setFilter('minPrice', undefined);
        setFilter('maxPrice', undefined);
      } else {
        setSelectedPriceIndex(index);
        const range = priceRanges[index];
        setFilter('minPrice', range.min);
        setFilter('maxPrice', range.max);
      }
    },
    [selectedPriceIndex, setFilter, priceRanges]
  );

  const handleReset = useCallback(() => {
    resetFilters();
    setSelectedPriceIndex(null);
  }, [resetFilters]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Province */}
            <Text style={styles.sectionLabel}>Tỉnh / Thành phố</Text>
            <View style={styles.chipRow}>
              {provinceNames.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, filters.province === p && { backgroundColor: '#EFF6FF', borderColor: theme.primary }]}
                  onPress={() => handleProvince(p)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, filters.province === p && { color: theme.primary, fontWeight: '700' }]}>
                    {getDisplayName(p)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Property type — từ server */}
            <Text style={styles.sectionLabel}>Loại bất động sản</Text>
            <View style={styles.chipRow}>
              {propertyTypes.map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.chip, filters.propertyType === value && { backgroundColor: '#EFF6FF', borderColor: theme.primary }]}
                  onPress={() => handlePropertyType(value as PropertyType)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, filters.propertyType === value && { color: theme.primary, fontWeight: '700' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price ranges — từ server */}
            <Text style={styles.sectionLabel}>Mức giá</Text>
            <View style={styles.chipRow}>
              {priceRanges.map((range, i) => (
                <TouchableOpacity
                  key={range.label}
                  style={[styles.chip, selectedPriceIndex === i && { backgroundColor: '#EFF6FF', borderColor: theme.primary }]}
                  onPress={() => handlePriceRange(i)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, selectedPriceIndex === i && { color: theme.primary, fontWeight: '700' }]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {hasActive && (
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>Xoá bộ lọc</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: theme.primary }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeBtn:    { padding: 4 },
  closeBtnText:{ fontSize: 18, color: '#6B7280' },
  content:     { padding: 20, gap: 8 },
  sectionLabel:{ fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 8, marginBottom: 4 },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent',
  },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  footer: {
    flexDirection: 'row', gap: 10, padding: 20,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  resetBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  applyBtn:     { flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default memo(FilterPanel);
