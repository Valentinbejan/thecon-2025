import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, UrlTile, Callout } from 'react-native-maps';
import { Venue } from '../types';

interface MapComponentProps {
  venues: Venue[];
  onCalloutPress: (venue: Venue) => void;
  focusedVenue?: Venue | null;
}

export default function MapComponent({ venues, onCalloutPress, focusedVenue }: MapComponentProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (focusedVenue && mapRef.current) {
      // Animate map
      mapRef.current.animateToRegion({
        latitude: focusedVenue.coordinates.lat,
        longitude: focusedVenue.coordinates.long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [focusedVenue]);

  return (
    <MapView
      ref={mapRef}
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
          onPress={() => onCalloutPress(venue)}
          pinColor="red"
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
