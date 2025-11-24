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
  const markerRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (focusedVenue && mapRef.current) {
      // Animate map
      mapRef.current.animateToRegion({
        latitude: focusedVenue.coordinates.lat,
        longitude: focusedVenue.coordinates.long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);

      // Show callout after a short delay to allow animation to start
      setTimeout(() => {
        const markerId = focusedVenue.id || '';
        if (markerRefs.current[markerId]) {
          markerRefs.current[markerId].showCallout();
        }
      }, 500);
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
          ref={(ref) => {
            if (venue.id) markerRefs.current[venue.id] = ref;
          }}
          coordinate={{ latitude: venue.coordinates.lat, longitude: venue.coordinates.long }}
          title={venue.name}
          description={venue.short_description}
          onCalloutPress={() => onCalloutPress(venue)}
          pinColor="red"
        >
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{venue.name}</Text>
              <Text numberOfLines={2} style={styles.calloutDesc}>{venue.short_description}</Text>
              <View style={styles.calloutButton}>
                <Text style={styles.calloutButtonText}>View Details</Text>
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  callout: { width: 200, padding: 10, backgroundColor: 'white', borderRadius: 8, alignItems: 'center' },
  calloutTitle: { fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  calloutDesc: { fontSize: 12, marginBottom: 10, textAlign: 'center' },
  calloutButton: { backgroundColor: '#6200ee', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  calloutButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});
