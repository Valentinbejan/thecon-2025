import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Linking, Platform } from 'react-native';
import { Text, Button, Title, Paragraph, ActivityIndicator, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';
import { generateVibeDescription } from '../lib/ai';

type Props = NativeStackScreenProps<ExploreStackParamList, 'Details'>;

export default function DetailsScreen({ route }: Props) {
  const { venue } = route.params;
  const [vibeDescription, setVibeDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReserve = () => {
    // Replace with a real number or dynamic number if available
    Linking.openURL('https://wa.me/1234567890');
  };

  const handleVibeCheck = async () => {
    setLoading(true);
    const vibe = await generateVibeDescription(venue.short_description);
    setVibeDescription(vibe);
    setLoading(false);
  };

  const handleGetDirections = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const lat = venue.coordinates.lat;
    const lng = venue.coordinates.long;
    const label = venue.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${lat},${lng}`,
      android: `${scheme}${lat},${lng}(${label})`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: venue.image_url }} style={styles.image} />
      <View style={styles.content}>
        <Title style={styles.title}>{venue.name}</Title>
        <Paragraph style={styles.address}>{venue.address}</Paragraph>
        <Paragraph style={styles.rating}>⭐ {venue.rating}</Paragraph>
        
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Title>Description</Title>
            <Paragraph>{venue.short_description}</Paragraph>
          </Card.Content>
        </Card>

        {vibeDescription && (
          <Card style={[styles.descriptionCard, styles.vibeCard]}>
            <Card.Content>
              <Title style={styles.vibeTitle}>✨ The Vibe ✨</Title>
              <Paragraph>{vibeDescription}</Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handleGetDirections} 
            icon="map-marker-radius"
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
          >
            Get Directions
          </Button>

          <Button 
            mode="contained" 
            onPress={handleVibeCheck} 
            loading={loading} 
            disabled={loading}
            icon="auto-fix"
            style={styles.button}
          >
            Generate Vibe Description
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleReserve} 
            icon="whatsapp"
            style={styles.button}
          >
            Reserve Table
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  address: { color: '#666', marginBottom: 5 },
  rating: { marginBottom: 20 },
  descriptionCard: { marginBottom: 15 },
  vibeCard: { backgroundColor: '#f0f4ff', borderColor: '#d0daff', borderWidth: 1 },
  vibeTitle: { color: '#4a6ee0' },
  actions: { marginTop: 10 },
  button: { marginBottom: 10 },
});
