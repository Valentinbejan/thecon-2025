import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import { Venue } from '../types';

interface MapComponentProps {
  venues: Venue[];
  onCalloutPress: (venue: Venue) => void;
}

export default function MapComponent({ venues, onCalloutPress }: MapComponentProps) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 45.9432,
        longitude: 24.9668,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}
    >
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />
      {venues.map((venue, index) => (
        <Marker
          key={venue.id || index.toString()}
          coordinate={{ latitude: venue.coordinates.lat, longitude: venue.coordinates.long }}
          title={venue.name}
          description={venue.short_description}
          onCalloutPress={() => onCalloutPress(venue)}
        >
          <View style={styles.markerContainer}>
            <View style={styles.markerPin} />
            <View style={styles.markerLabel}>
              <Text style={styles.markerText}>{venue.name}</Text>
            </View>
          </View>
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{venue.name}</Text>
              <Text>{venue.rating} ⭐</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  callout: { width: 150, padding: 5 },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5 },
  markerContainer: { alignItems: 'center' },
  markerPin: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'red', borderWidth: 2, borderColor: 'white' },
  markerLabel: { backgroundColor: 'white', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginTop: 2, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 },
  markerText: { fontSize: 10, fontWeight: 'bold' },
});
