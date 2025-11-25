import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Disable react-native-screens to fix "addViewAt" crash on Android with Expo Go + New Arch
enableScreens(false);

import NetworkBanner from './src/components/NetworkBanner';

function Main() {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <NetworkBanner />
      <RootNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
}
