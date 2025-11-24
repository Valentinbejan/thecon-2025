import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
}

export default function MapComponent({ venues, onCalloutPress }: MapComponentProps) {
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
          center={[40.730610, -73.935242]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {venues.map((venue) => (
            <Marker 
              key={venue.id} 
              position={[venue.latitude, venue.longitude]}
            >
              <Popup>
                <div 
                  onClick={() => onCalloutPress(venue)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{venue.name}</strong><br />
                  {venue.rating} ⭐<br />
                  <small>Click for details</small>
                </div>
              </Popup>
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
