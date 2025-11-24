import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Venue } from '../types';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Metro
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  venues: Venue[];
  onCalloutPress: (venue: Venue) => void;
  focusedVenue?: Venue | null;
}

// Component to handle map movement
function MapController({ focusedVenue }: { focusedVenue?: Venue | null }) {
  const map = useMap();

  useEffect(() => {
    if (focusedVenue) {
      map.flyTo([focusedVenue.coordinates.lat, focusedVenue.coordinates.long], 15, {
        duration: 1.5
      });
    }
  }, [focusedVenue, map]);

  return null;
}

export default function MapComponent({ venues, onCalloutPress, focusedVenue }: MapComponentProps) {
  useEffect(() => {
    // Inject Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <View style={styles.container}>
      <div style={{ height: '100%', width: '100%' }}>
        <MapContainer 
          center={[45.9432, 24.9668]} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
        >
          <MapController focusedVenue={focusedVenue} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {venues.map((venue, index) => (
            <Marker 
              key={venue.id || index.toString()} 
              position={[venue.coordinates.lat, venue.coordinates.long]}
              eventHandlers={{
                click: () => onCalloutPress(venue),
              }}
            >
              <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
                {venue.name}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
