import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, SegmentedButtons, FAB, Searchbar, Button } from 'react-native-paper';
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', '4.5', '4.0'
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Map data to add IDs since locatii.json doesn't have them
  const allVenues: Venue[] = (venuesData as any[]).map((item, index) => ({
    ...item,
    id: (index + 1).toString(),
  }));

  useEffect(() => {
    let filtered = allVenues;

    // Apply Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(lowerQuery) ||
          venue.address.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply Filter
    if (activeFilter !== 'all') {
      const minRating = parseFloat(activeFilter);
      filtered = filtered.filter((venue) => venue.rating >= minRating);
    }

    setFilteredVenues(filtered);
  }, [searchQuery, activeFilter]);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (focusedVenue) setFocusedVenue(null);
  };

  const handleVenueSelect = (venue: Venue) => {
    setFocusedVenue(venue);
    setViewMode('map');
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

  // Hide the navigation header
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Map is always full screen now */}
      {viewMode === 'map' ? (
        <MapComponent 
          venues={filteredVenues} 
          onCalloutPress={(venue) => setFocusedVenue(venue)}
          focusedVenue={focusedVenue}
        />
      ) : (
        <FlatList
          data={filteredVenues}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={[
            styles.list, 
            { paddingBottom: isFilterVisible ? 100 : 80 } // Add padding for filter bar
          ]}
          style={{ marginTop: isHeaderVisible ? 160 : 0 }} // Push list down if header is visible
        />
      )}

      {/* Header Container - Absolute Positioned */}
      {isHeaderVisible && (
        <View style={styles.headerContainer}>
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
        </View>
      )}

      {/* Toggle Button (FAB) */}
      <FAB
        icon={isHeaderVisible ? "chevron-up" : "magnify"}
        style={[styles.fab, isHeaderVisible ? styles.fabExpanded : styles.fabCollapsed]}
        onPress={() => setIsHeaderVisible(!isHeaderVisible)}
        size="small"
        mode="elevated"
        label={isHeaderVisible ? "Collapse" : "Search"}
      />
      
      {/* Suggestions List */}
      {searchQuery.length > 0 && viewMode === 'map' && !focusedVenue && isHeaderVisible && (
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

      {/* Persistent Details Bar */}
      {focusedVenue && viewMode === 'map' && (
        <Card style={styles.previewCard}>
          <Card.Content style={styles.previewContent}>
            <View style={styles.previewText}>
              <Title>{focusedVenue.name}</Title>
              <Paragraph numberOfLines={1}>{focusedVenue.short_description}</Paragraph>
              <Paragraph>⭐ {focusedVenue.rating}</Paragraph>
            </View>
            <View style={styles.previewActions}>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Details', { venue: focusedVenue })}
                compact
              >
                Details
              </Button>
              <Button 
                mode="text" 
                onPress={() => setFocusedVenue(null)}
                compact
              >
                Close
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* List Filter Section */}
      {viewMode === 'list' && (
        <>
          {isFilterVisible && (
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Filter by Rating</Text>
              <SegmentedButtons
                value={activeFilter}
                onValueChange={setActiveFilter}
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: '4.0', label: '4.0+ ⭐' },
                  { value: '4.5', label: '4.5+ ⭐' },
                ]}
              />
            </View>
          )}

          <FAB
            icon={isFilterVisible ? "chevron-down" : "filter-variant"}
            style={styles.filterFab}
            onPress={() => setIsFilterVisible(!isFilterVisible)}
            size="small"
            mode="elevated"
            label={isFilterVisible ? "Hide Filters" : "Filters"}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 2,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    paddingTop: 40, // Status bar padding
    paddingBottom: 10,
  },
  searchContainer: { paddingHorizontal: 10, paddingBottom: 5 },
  searchbar: { elevation: 0, backgroundColor: '#f0f0f0' },
  toggleContainer: { paddingHorizontal: 10 },
  list: { padding: 10 },
  card: { marginBottom: 10 },
  suggestionsContainer: {
    position: 'absolute',
    top: 110, // Right below search bar, covering toggle
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 20,
    maxHeight: 300,
    zIndex: 1000,
  },
  suggestionsList: {
    padding: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewCard: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    elevation: 8,
    zIndex: 100,
    backgroundColor: 'white',
  },
  previewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    flex: 1,
    marginRight: 10,
  },
  previewActions: {
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 10,
    zIndex: 200,
    backgroundColor: 'white',
  },
  fabCollapsed: {
    top: 50,
  },
  fabExpanded: {
    top: 170, // Below the header
  },
  filterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 15,
    paddingBottom: 20,
    elevation: 20,
    zIndex: 100,
  },
  filterTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterFab: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    zIndex: 101,
    backgroundColor: 'white',
  },
});
