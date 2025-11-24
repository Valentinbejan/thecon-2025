import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, SegmentedButtons, FAB, Searchbar } from 'react-native-paper';
import MapComponent from '../components/MapComponent';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';
import venuesData from '../data/locatii.json';
import { Venue } from '../types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

export default function ExploreScreen({ navigation }: Props) {
  const [viewMode, setViewMode] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [focusedVenue, setFocusedVenue] = useState<Venue | null>(null);

  // Map data to add IDs since locatii.json doesn't have them
  const allVenues: Venue[] = (venuesData as any[]).map((item, index) => ({
    ...item,
    id: (index + 1).toString(),
  }));

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = allVenues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(lowerQuery) ||
          venue.address.toLowerCase().includes(lowerQuery)
      );
      setFilteredVenues(filtered);
    } else {
      setFilteredVenues(allVenues);
    }
  }, [searchQuery]);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const handleVenueSelect = (venue: Venue) => {
    setFocusedVenue(venue);
    setViewMode('map');
    // Optional: Navigate to details directly or just zoom map?
    // User asked: "once selected it will zoom in on the location and alow me to go to the respective details of that location from that list"
    // So zooming is primary. Details access is secondary (via marker).
  };

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
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search locations..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

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
          venues={filteredVenues} 
          onCalloutPress={(venue) => navigation.navigate('Details', { venue })}
          focusedVenue={focusedVenue}
        />
      ) : (
        <FlatList
          data={filteredVenues}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      
      {/* Suggestions List when searching and in Map mode */}
      {searchQuery.length > 0 && viewMode === 'map' && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredVenues}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleVenueSelect(item)} style={styles.suggestionItem}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: { padding: 10, backgroundColor: '#fff', zIndex: 2 },
  searchbar: { elevation: 2 },
  toggleContainer: { paddingHorizontal: 10, paddingBottom: 10, backgroundColor: '#fff', zIndex: 1 },
  list: { padding: 10 },
  card: { marginBottom: 10 },
  suggestionsContainer: {
    position: 'absolute',
    top: 130, // Adjust based on header + searchbar height
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    maxHeight: 200,
    zIndex: 10,
  },
  suggestionsList: {
    padding: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
