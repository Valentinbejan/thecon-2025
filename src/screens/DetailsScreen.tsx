import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Details'>;

export default function DetailsScreen({ route }: Props) {
  const { venue } = route.params;
  return (
    <View style={styles.container}>
      <Text>Details Screen</Text>
      <Text>{venue.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
