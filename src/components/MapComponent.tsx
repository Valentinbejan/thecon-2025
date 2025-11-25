import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Venue } from '../types';

interface MapComponentProps {
  venues: Venue[];
  onCalloutPress: (venue: Venue) => void;
  focusedVenue?: Venue | null;
}

export default function MapComponent({ venues, onCalloutPress, focusedVenue }: MapComponentProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const markersJson = JSON.stringify(
    venues.map((venue, index) => ({
      id: venue.id || index.toString(),
      lat: venue.coordinates.lat,
      lng: venue.coordinates.long,
      name: venue.name,
      description: venue.short_description,
      rating: venue.rating,
    }))
  );

  useEffect(() => {
    if (focusedVenue && webViewRef.current) {
      const message = JSON.stringify({
        type: 'flyTo',
        lat: focusedVenue.coordinates.lat,
        lng: focusedVenue.coordinates.long,
      });
      webViewRef.current.postMessage(message);
    }
  }, [focusedVenue]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') {
        const venue = venues.find(
          (v, index) => (v.id || index.toString()) === data.id
        );
        if (venue) {
          onCalloutPress(venue);
        }
      }
    } catch (error) {
      console.log('WebView message error:', error);
    }
  };

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 0;
    }
    .custom-popup .leaflet-popup-content {
      margin: 12px;
    }
    .popup-title {
      font-weight: bold;
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }
    .popup-description {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    .popup-rating {
      font-size: 12px;
      color: #f59e0b;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([45.9432, 24.9668], 7);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const markers = {};
    const venuesData = ${markersJson};

    venuesData.forEach(venue => {
      const marker = L.marker([venue.lat, venue.lng])
        .addTo(map)
        .bindPopup(
          '<div class="popup-title">' + venue.name + '</div>' +
          '<div class="popup-description">' + venue.description + '</div>' +
          '<div class="popup-rating">⭐ ' + venue.rating + '</div>',
          { className: 'custom-popup' }
        );

      marker.on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerClick',
          id: venue.id
        }));
      });

      markers[venue.id] = marker;
    });

    if (venuesData.length > 0) {
      const group = L.featureGroup(Object.values(markers));
      map.fitBounds(group.getBounds().pad(0.1));
    }

    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'flyTo') {
          map.flyTo([data.lat, data.lng], 15, { duration: 1.5 });
        }
      } catch (e) {}
    });

    document.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'flyTo') {
          map.flyTo([data.lat, data.lng], 15, { duration: 1.5 });
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
  `;

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>🗺️ Map unavailable</Text>
        <Text style={styles.errorSubtext}>Please check your internet connection</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.webview}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        cacheEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});
