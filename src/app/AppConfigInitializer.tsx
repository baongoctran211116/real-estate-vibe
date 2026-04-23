// filename: src/app/AppConfigInitializer.tsx
// ─── Config Initializer — chạy sớm nhất trong cây component ──────────────────
//
// Vị trí trong tree:
//   <QueryClientProvider>
//     <AppConfigInitializer>       ← ở đây
//       <SessionRestorer>
//         <AppNavigator />
//       </SessionRestorer>
//     </AppConfigInitializer>
//   </QueryClientProvider>
//
// Chiến lược:
// 1. Gọi fetchAppConfig ngay khi mount (prefetch đã seed cache trước đó).
// 2. Trong khi chờ: hiện splash nhỏ với BOOTSTRAP_COLOR (màu cứng duy nhất).
// 3. Nếu server lỗi: fetchAppConfig tự fallback → vẫn render children bình thường.
// 4. Config sẵn sàng → render children. Từ đây mọi useAppConfig() đều sync.

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchAppConfig } from '../services/appConfigService';
import { FALLBACK_CONFIG, QUERY_KEYS, STALE_TIME, BOOTSTRAP_COLOR } from '../utils/Constants';
import { AppConfig } from '../types/appConfig';

interface Props {
  children: React.ReactNode;
}

const AppConfigInitializer: React.FC<Props> = ({ children }) => {
  const { isLoading } = useQuery<AppConfig>({
    queryKey:  QUERY_KEYS.appConfig,
    queryFn:   fetchAppConfig,
    staleTime: STALE_TIME.appConfig,
    retry:     false,
    // fetchAppConfig không throw — isLoading sẽ false ngay sau lần fetch đầu
    placeholderData: FALLBACK_CONFIG,
  });

  if (isLoading) {
    console.log('AppConfigInitializer: loading config...');
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={BOOTSTRAP_COLOR} />
        <Text style={styles.label}>Đang khởi động...</Text>
      </View>
    );
  }else{
    console.log('AppConfigInitializer: config ready, rendering app');
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default AppConfigInitializer;
