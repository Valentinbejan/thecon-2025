import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './src/navigation/RootNavigator';

// Disable react-native-screens to fix "addViewAt" crash on Android with Expo Go + New Arch
enableScreens(false);

export default function App() {
  return (
    <PaperProvider>
      <RootNavigator />
    </PaperProvider>
  );
}
