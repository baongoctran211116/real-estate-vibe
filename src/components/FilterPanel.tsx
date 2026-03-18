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

import { useFilterStore, PROVINCES, PROPERTY_TYPES, PRICE_RANGES } from '../store/useFilterStore';
import { Province, PropertyType } from '../types/property';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ visible, onClose }) => {
  const filters = useFilterStore((s) => s.filters);
  const setFilter = useFilterStore((s) => s.setFilter);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const hasActive = useFilterStore((s) => s.hasActiveFilters());

  // Local state for price range selection
  const [selectedPriceIndex, setSelectedPriceIndex] = useState<number | null>(null);

  const handleProvince = useCallback(
    (province: Province) => {
      setFilter('province', filters.province === province ? undefined : province);
    },
    [filters.province, setFilter]
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
        const range = PRICE_RANGES[index];
        setFilter('minPrice', range.min);
        setFilter('maxPrice', range.max);
      }
    },
    [selectedPriceIndex, setFilter]
  );

  const handleReset = useCallback(() => {
    resetFilters();
    setSelectedPriceIndex(null);
  }, [resetFilters]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset} disabled={!hasActive}>
            <Text style={[styles.resetText, !hasActive && styles.disabledText]}>
              Đặt lại
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bộ lọc</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneText}>Xong</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Province filter */}
          <FilterSection title="📍 Thành phố">
            <View style={styles.chipGrid}>
              {PROVINCES.map((province) => (
                <FilterChip
                  key={province}
                  label={province}
                  selected={filters.province === province}
                  onPress={() => handleProvince(province)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Property type filter */}
          <FilterSection title="🏠 Loại bất động sản">
            <View style={styles.chipGrid}>
              {PROPERTY_TYPES.map(({ label, value }) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={filters.propertyType === value}
                  onPress={() => handlePropertyType(value)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Price range filter */}
          <FilterSection title="💰 Khoảng giá">
            <View style={styles.chipGrid}>
              {PRICE_RANGES.map((range, index) => (
                <FilterChip
                  key={range.label}
                  label={range.label}
                  selected={selectedPriceIndex === index}
                  onPress={() => handlePriceRange(index)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Bedrooms filter */}
          <FilterSection title="🛏️ Số phòng ngủ (tối thiểu)">
            <View style={styles.chipRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <FilterChip
                  key={n}
                  label={`${n}+`}
                  selected={filters.minBedrooms === n}
                  onPress={() =>
                    setFilter('minBedrooms', filters.minBedrooms === n ? undefined : n)
                  }
                />
              ))}
            </View>
          </FilterSection>
        </ScrollView>

        {/* Apply button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Sub-components ───────────────────────────────────────

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = memo(
  ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
);

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = memo(({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    activeOpacity={0.75}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  resetText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '500',
  },
  doneText: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },
  disabledText: {
    color: '#D1D5DB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  applyBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default memo(FilterPanel);
