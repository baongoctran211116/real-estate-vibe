// filename: src/components/PropertyImageCarousel.tsx
import React, { memo, useRef, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from 'react-native';
import FastImage from '../utils/FastImageShim';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PropertyImageCarouselProps {
  images: string[];
  height?: number;
  showCounter?: boolean;
  borderRadius?: number;
}

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({
  images,
  height = 220,
  showCounter = true,
  borderRadius = 12,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  // FIX: dùng dynamic width đo từ onLayout thay vì SCREEN_WIDTH tĩnh
  // → tránh ảnh bị xám/sai size khi navigate back
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);
  const scrollRef = useRef<ScrollView>(null);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== containerWidth) {
      setContainerWidth(w);
      // Scroll lại đúng vị trí sau khi width thay đổi
      if (activeIndex > 0) {
        scrollRef.current?.scrollTo({ x: w * activeIndex, animated: false });
      }
    }
  }, [containerWidth, activeIndex]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
      setActiveIndex(index);
    },
    [containerWidth]
  );

  return (
    <View style={[styles.container, { height, borderRadius }]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        scrollEventThrottle={16}
        style={{ borderRadius }}
      >
        {images.map((uri, index) => (
          <FastImage
            key={`${uri}-${index}`}
            source={{
              uri,
              priority: index === 0
                ? FastImage.priority.high
                : FastImage.priority.low,
            }}
            style={[styles.image, { width: containerWidth, height }]}
            resizeMode={FastImage.resizeMode.cover}
          />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}

      {/* Counter badge */}
      {showCounter && images.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {activeIndex + 1}/{images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  image: {
    backgroundColor: '#D1D5DB',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  counterText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default memo(PropertyImageCarousel);
