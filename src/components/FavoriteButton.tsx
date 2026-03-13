// filename: src/components/FavoriteButton.tsx
import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useAuthStore } from '../store/useAuthStore';

interface FavoriteButtonProps {
  propertyId: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'circle' | 'bare';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  size = 22,
  style,
  variant = 'circle',
}) => {
  const userId = useAuthStore((s) => s.user?.id);

  // Reactive per-user isFavorite
  const isFav = useFavoriteStore((s) => s.isFavorite(propertyId, userId));
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    toggleFavorite(propertyId, userId);
  }, [propertyId, userId, toggleFavorite, scaleAnim]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[variant === 'circle' && styles.circle, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.Text style={{ fontSize: size, transform: [{ scale: scaleAnim }] }}>
        {isFav ? '❤️' : '🤍'}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});

export default memo(FavoriteButton);
