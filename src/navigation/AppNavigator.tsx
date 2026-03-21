// filename: src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, AuthStackParamList } from './types';
import TabNavigator from './TabNavigator';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
    <AuthStack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
  </AuthStack.Navigator>
);

/**
 * AppNavigator KHÔNG còn guard auth tại đây.
 * - MainTabs luôn hiển thị đủ 4 tab (kể cả guest)
 * - Login/Register là modal stack, mở từ tab Me hoặc khi cần
 */
const AppNavigator: React.FC = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app - luôn accessible */}
      <RootStack.Screen 
        name="MainTabs" component={TabNavigator} />

      {/* Detail screens */}
      <RootStack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Chi tiết bất động sản',
          headerBackTitle: 'Quay lại',
          headerTintColor: '#2563EB',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      />
      <RootStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          headerTitle: 'Chỉnh sửa hồ sơ',
          headerBackTitle: 'Quay lại',
          headerTintColor: '#2563EB',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
          animation: 'slide_from_bottom',
        }}
      />

      {/* Auth screens - mở dạng modal từ Me tab */}
      <RootStack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
