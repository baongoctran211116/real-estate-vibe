// filename: src/app/AppProviders.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { queryClient } from './queryClient';
import { useRestoreSession } from '../features/auth/useAuth';
import AppConfigInitializer from './AppConfigInitializer';
import { BOOTSTRAP_COLOR } from '../utils/Constants';

// ─── Theme Paper — dùng BOOTSTRAP_COLOR vì PaperProvider khởi tạo trước config load
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:    BOOTSTRAP_COLOR,
    secondary:  '#7C3AED',
    surface:    '#FFFFFF',
    background: '#F8FAFC',
    error:      '#EF4444',
  },
};

// ─── Session restore (chạy sau AppConfigInitializer) ─────────────────────────
const SessionRestorer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useRestoreSession();
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={BOOTSTRAP_COLOR} />
      </View>
    );
  }
  return <>{children}</>;
};

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/*
           * AppConfigInitializer chạy ngay sau QueryClientProvider sẵn sàng.
           * Toàn bộ app bên trong đều có thể dùng useAppConfig() và nhận
           * giá trị đồng bộ — không bao giờ undefined.
           */}
          <AppConfigInitializer>
            <PaperProvider theme={theme}>
              <NavigationContainer>
                <SessionRestorer>
                  {children}
                </SessionRestorer>
              </NavigationContainer>
            </PaperProvider>
          </AppConfigInitializer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex:   { flex: 1 },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default AppProviders;
