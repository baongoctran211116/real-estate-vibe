// filename: src/navigation/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import { TabParamList } from './types';
import ZillowMapScreen from '../screens/ZillowMapScreen';

import FavoritesScreen from '../screens/FavoritesScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import MeScreen from '../screens/MeScreen';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useAuthStore } from '../store/useAuthStore';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_CONFIG: Record<string, { icon: string; activeColor: string }> = {  
  ZillowMap:   { icon: '🗺️', activeColor: '#2563EB' },
  Favorites:   { icon: '❤️', activeColor: '#EF4444' },
  AIAssistant: { icon: '🤖', activeColor: '#7C3AED' },
  Me:          { icon: '👤', activeColor: '#059669' },
};

interface TabIconProps {
  tabKey: string;
  focused: boolean;
  badgeCount?: number;
  dotBadge?: boolean; // chấm xanh nhỏ (dùng cho Me khi chưa login)
}

const TabIcon: React.FC<TabIconProps> = ({ tabKey, focused, badgeCount, dotBadge }) => {
  const { icon } = TAB_CONFIG[tabKey];
  return (
    <View style={styles.iconWrapper}>
      <Text style={[styles.emoji, !focused && styles.emojiInactive]}>{icon}</Text>

      {/* Number badge (Favorites) */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}

      {/* Dot badge (Me tab khi chưa đăng nhập) */}
      {dotBadge && (
        <View style={styles.dotBadge} />
      )}
    </View>
  );
};

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Badge chỉ đếm favorites của user hiện tại (guest hoặc logged-in)
  const favoriteCount = useFavoriteStore((s) => s.getFavoriteCount(userId));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.10,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >      
      <Tab.Screen
        name="ZillowMap"
        component={ZillowMapScreen}
        options={{
          tabBarLabel: 'Bản đồ Zillow',
          tabBarIcon: ({ focused }) => <TabIcon tabKey="ZillowMap" focused={focused} />,
          tabBarActiveTintColor: TAB_CONFIG.ZillowMap.activeColor,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Đã lưu',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              tabKey="Favorites"
              focused={focused}
              // Chỉ show badge khi đã login
              badgeCount={isAuthenticated ? favoriteCount : undefined}
            />
          ),
          tabBarActiveTintColor: TAB_CONFIG.Favorites.activeColor,
        }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          tabBarLabel: 'Trợ lý AI',
          tabBarIcon: ({ focused }) => <TabIcon tabKey="AIAssistant" focused={focused} />,
          tabBarActiveTintColor: TAB_CONFIG.AIAssistant.activeColor,
        }}
      />
      <Tab.Screen
        name="Me"
        component={MeScreen}
        options={{
          tabBarLabel: 'Tôi',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              tabKey="Me"
              focused={focused}
              // Dot badge trên Me khi chưa đăng nhập → gợi ý đăng nhập
              dotBadge={!isAuthenticated}
            />
          ),
          tabBarActiveTintColor: TAB_CONFIG.Me.activeColor,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  emoji: { fontSize: 22 },
  emojiInactive: { opacity: 0.5 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  dotBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

export default TabNavigator;
