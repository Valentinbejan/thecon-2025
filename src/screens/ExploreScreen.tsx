import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, SegmentedButtons, FAB } from 'react-native-paper';
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';
import venuesData from '../data/venues.json';
import { Venue } from '../types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

export default function ExploreScreen({ navigation }: Props) {
  const [viewMode, setViewMode] = useState('map');
  const venues: Venue[] = venuesData as Venue[];

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
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.730610,
            longitude: -73.935242,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {venues.map((venue) => (
            <Marker
              key={venue.id}
              coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
              title={venue.name}
              description={venue.short_description}
              onCalloutPress={() => navigation.navigate('Details', { venue })}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{venue.name}</Text>
                  <Text>{venue.rating} ⭐</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <FlatList
          data={venues}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toggleContainer: { padding: 10, backgroundColor: '#fff', zIndex: 1 },
  map: { flex: 1 },
  list: { padding: 10 },
  card: { marginBottom: 10 },
  callout: { width: 150, padding: 5 },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5 },
});
