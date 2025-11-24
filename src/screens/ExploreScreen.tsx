import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

export default function ExploreScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>Explore Screen</Text>
      <Button 
        title="Go to Details" 
        onPress={() => navigation.navigate('Details', { 
          venue: { 
            id: '1', 
            name: 'Test Venue', 
            address: '123 Test St', 
            latitude: 0, 
            longitude: 0, 
            image_url: '', 
            short_description: 'Test', 
            rating: 5 
          } 
        })} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
