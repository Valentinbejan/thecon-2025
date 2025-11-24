import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, SegmentedButtons, FAB } from 'react-native-paper';
import MapComponent from '../components/MapComponent';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';
import venuesData from '../data/locatii.json';
import { Venue } from '../types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

export default function ExploreScreen({ navigation }: Props) {
  const [viewMode, setViewMode] = useState('map');
  // Map data to add IDs since locatii.json doesn't have them
  const venues: Venue[] = (venuesData as any[]).map((item, index) => ({
    ...item,
    id: (index + 1).toString(),
  }));

  const renderItem = ({ item }: { item: Venue }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('Details', { venue: item })}>
      <Card.Cover source={{ uri: item.image_url }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.short_description}</Paragraph>
        <Paragraph>⭐ {item.rating}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'map', label: 'Map', icon: 'map' },
            { value: 'list', label: 'List', icon: 'format-list-bulleted' },
          ]}
        />
      </View>

      {viewMode === 'map' ? (
        <MapComponent 
          venues={venues} 
          onCalloutPress={(venue) => navigation.navigate('Details', { venue })} 
        />
      ) : (
        <FlatList
          data={venues}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toggleContainer: { padding: 10, backgroundColor: '#fff', zIndex: 1 },
  list: { padding: 10 },
  card: { marginBottom: 10 },
});
