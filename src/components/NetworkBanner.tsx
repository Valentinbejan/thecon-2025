import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../context/ThemeContext';

export default function NetworkBanner() {
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected !== false) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Banner
        visible={true}
        actions={[]}
        icon="wifi-off"
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>
          No internet connection. Some features may not work.
        </Text>
      </Banner>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
