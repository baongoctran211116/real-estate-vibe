// filename: src/components/PriceTag.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPrice } from '../utils/formatters';

interface PriceTagProps {
  price: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'overlay';
}

const PriceTag: React.FC<PriceTagProps> = ({
  price,
  size = 'medium',
  variant = 'default',
}) => {
  return (
    <View style={[styles.container, styles[variant], styles[`${size}Container`]]}>
      <Text style={[styles.price, styles[`${size}Text`], variant === 'overlay' && styles.overlayText]}>
        {formatPrice(price)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: '#EFF6FF',
  },
  overlay: {
    backgroundColor: 'rgba(37, 99, 235, 0.92)',
  },
  smallContainer: { paddingHorizontal: 7, paddingVertical: 3 },
  mediumContainer: { paddingHorizontal: 10, paddingVertical: 4 },
  largeContainer: { paddingHorizontal: 14, paddingVertical: 6 },
  price: {
    fontWeight: '700',
    color: '#2563EB',
  },
  overlayText: { color: '#FFFFFF' },
  smallText: { fontSize: 12 },
  mediumText: { fontSize: 15 },
  largeText: { fontSize: 20 },
});

export default memo(PriceTag);
