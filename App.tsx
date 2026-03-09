// filename: App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import AppProviders from './src/app/AppProviders';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
