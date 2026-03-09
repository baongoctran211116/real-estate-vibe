// filename: src/utils/FastImageShim.tsx
import React from 'react';
import { ImageBackground, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

interface FastImageProps {
  source: { uri: string; priority?: string };
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  children?: React.ReactNode;
  fallback?: boolean;
}

const FastImageShim: React.FC<FastImageProps> & {
  priority: { low: string; normal: string; high: string };
  resizeMode: { cover: 'cover'; contain: 'contain'; stretch: 'stretch'; center: 'center' };
} = ({ source, style, resizeMode = 'cover', children }) => {
  if (children) {
    return (
      <ImageBackground
        source={{ uri: source.uri }}
        style={style as any}
        resizeMode={resizeMode}
        imageStyle={StyleSheet.flatten(style) as ImageStyle}
      >
        {children}
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={{ uri: source.uri }}
      style={style as any}
      resizeMode={resizeMode}
      imageStyle={StyleSheet.flatten(style) as ImageStyle}
    />
  );
};

FastImageShim.priority = { low: 'low', normal: 'normal', high: 'high' };
FastImageShim.resizeMode = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'stretch',
  center: 'center',
};

export default FastImageShim;
