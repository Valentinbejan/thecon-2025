import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text, Card, Title, Paragraph, SegmentedButtons, FAB, Searchbar, Button, Chip, Divider, IconButton, Banner } from 'react-native-paper';
import MapComponent from '../components/MapComponent';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ExploreStackParamList } from '../navigation/types';
import venuesData from '../data/locatii.json';
import venueMetadata from '../data/venue_metadata.json';
import { Venue, UserLocation } from '../types';
import { supabase } from '../lib/supabase';
import { calculateDistance, getDistanceLabel } from '../lib/distance';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

// Filter Options
const CITIES = ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Sibiu', 'Oradea', 'Galați', 'Craiova', 'Ploiești', 'Alba Iulia', 'Târgu Mureș'];
const CATEGORIES = ['Café / Coffee Shop', 'Restaurant', 'Fast-Food', 'Pizzeria / Italian', 'Vegan / Healthy', 'Tea House', 'Bistro', 'Pub / Bar', 'Smoothie Bar', 'Burger Place', 'Gaming Café'];
const CUISINES = ['Romanian', 'Transylvanian', 'Italian / Mediterranean', 'Asian / Wok', 'Vegan / Plant-based', 'Bakery / Breakfast', 'Seafood', 'Burgers', 'Brunch', 'Smoothies / Acai'];
const ATMOSPHERES = ['Quiet / Study-friendly', 'Modern', 'Romantic', 'Student-friendly', 'Group-friendly', 'Traditional', 'Relaxed', 'Social / Gaming'];
const FEATURES = ['Terrace', 'Sea view', 'Live music', 'Specialty coffee', 'Near campus', 'Wood-fired oven', 'Craft beer', 'Board games / consoles', 'Affordable / student menu', 'Healthy options'];
const DISTANCE_OPTIONS = [10, 25, 50, 100, 200, 500];

export default function ExploreScreen({ navigation }: Props) {
  const [viewMode, setViewMode] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [focusedVenue, setFocusedVenue] = useState<Venue | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // User Location State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Filter States
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAtmospheres, setSelectedAtmospheres] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);



// ...

  // Fetch user location from profile
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      async function fetchUserLocation() {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data, error } = await supabase
              .from('profiles')
              .select('city, city_lat, city_long')
              .eq('id', session.user.id)
              .single();

            if (isActive && data && data.city && data.city_lat && data.city_long) {
              setUserLocation({
                city: data.city,
                lat: data.city_lat,
                long: data.city_long,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user location:', error);
        } finally {
          if (isActive) setLocationLoading(false);
        }
      }

      fetchUserLocation();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Merge Data and calculate distances
  const allVenues: Venue[] = useMemo(() => {
    return (venuesData as any[]).map((item, index) => {
      const id = (index + 1).toString();
      const metadata = venueMetadata.find((m) => m.id === id);
      
      let distanceFromUser: number | undefined;
      if (userLocation) {
        distanceFromUser = calculateDistance(
          userLocation.lat,
          userLocation.long,
          item.coordinates.lat,
          item.coordinates.long
        );
      }

      return {
        ...item,
        id,
        ...metadata,
        distanceFromUser,
      };
    });
  }, [userLocation]);

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

    // Apply Filters
    if (selectedCities.length > 0) {
      filtered = filtered.filter((venue) => venue.city && selectedCities.includes(venue.city));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((venue) => venue.category && selectedCategories.includes(venue.category));
    }
    if (minRating) {
      filtered = filtered.filter((venue) => venue.rating >= minRating);
    }
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter((venue) => venue.cuisine && venue.cuisine.some(c => selectedCuisines.includes(c)));
    }
    if (selectedAtmospheres.length > 0) {
      filtered = filtered.filter((venue) => venue.atmosphere && venue.atmosphere.some(a => selectedAtmospheres.includes(a)));
    }
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((venue) => venue.features && venue.features.some(f => selectedFeatures.includes(f)));
    }
    
    // Apply Distance Filter
    if (maxDistance && userLocation) {
      filtered = filtered.filter((venue) => 
        venue.distanceFromUser !== undefined && venue.distanceFromUser <= maxDistance
      );
    }

    // Sort by distance if user has location set
    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        const distA = a.distanceFromUser ?? Infinity;
        const distB = b.distanceFromUser ?? Infinity;
        return distA - distB;
      });
    }

    setFilteredVenues(filtered);
  }, [searchQuery, selectedCities, selectedCategories, minRating, selectedCuisines, selectedAtmospheres, selectedFeatures, maxDistance, userLocation, allVenues]);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (focusedVenue) setFocusedVenue(null);
  };

  const handleVenueSelect = (venue: Venue) => {
    setFocusedVenue(venue);
    setViewMode('map');
  };

  const toggleFilter = (list: string[], item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const resetFilters = () => {
    setSelectedCities([]);
    setSelectedCategories([]);
    setMinRating(null);
    setSelectedCuisines([]);
    setSelectedAtmospheres([]);
    setSelectedFeatures([]);
    setMaxDistance(null);
  };

  const activeFiltersCount = [
    selectedCities.length > 0,
    selectedCategories.length > 0,
    minRating !== null,
    selectedCuisines.length > 0,
    selectedAtmospheres.length > 0,
    selectedFeatures.length > 0,
    maxDistance !== null,
  ].filter(Boolean).length;

  const renderItem = ({ item }: { item: Venue }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('Details', { venue: item })}>
      <Card.Cover source={{ uri: item.image_url }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.short_description}</Paragraph>
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <Paragraph>⭐ {item.rating}</Paragraph>
            <Text style={styles.cityText}>{item.city}</Text>
          </View>
          {item.distanceFromUser !== undefined && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>📍 {getDistanceLabel(item.distanceFromUser)}</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  // Hide the navigation header
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Location Banner */}
      {!locationLoading && !userLocation && (
        <Banner
          visible={true}
          actions={[
            {
              label: 'Set Location',
              onPress: () => navigation.getParent()?.navigate('Profile'),
            },
          ]}
          icon="map-marker"
          style={styles.locationBanner}
        >
          Set your city in Profile to see distances and filter by proximity!
        </Banner>
      )}

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
            { paddingBottom: 80 }
          ]}
          style={{ marginTop: isHeaderVisible ? (userLocation ? 160 : 220) : 0 }}
          ListHeaderComponent={
            userLocation ? (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  📍 Showing venues from {userLocation.city}
                  {maxDistance ? ` within ${maxDistance} km` : ''}
                </Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Header Container - Absolute Positioned */}
      {isHeaderVisible && (
        <View style={[styles.headerContainer, { top: !locationLoading && !userLocation ? 60 : 0 }]}>
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

          {userLocation && (
            <View style={styles.locationIndicator}>
              <Text style={styles.locationIndicatorText}>
                📍 Your location: {userLocation.city}
              </Text>
            </View>
          )}
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
                <View style={styles.suggestionContent}>
                  <Text>{item.name}</Text>
                  {item.distanceFromUser !== undefined && (
                    <Text style={styles.suggestionDistance}>{getDistanceLabel(item.distanceFromUser)}</Text>
                  )}
                </View>
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
              <View style={styles.previewMeta}>
                <Paragraph>⭐ {focusedVenue.rating}</Paragraph>
                {focusedVenue.distanceFromUser !== undefined && (
                  <Text style={styles.previewDistance}>
                    📍 {getDistanceLabel(focusedVenue.distanceFromUser)} from you
                  </Text>
                )}
              </View>
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

      {/* Filter FAB */}
      {viewMode === 'list' && (
        <FAB
          icon="filter-variant"
          style={styles.filterFab}
          onPress={() => setIsFilterVisible(true)}
          size="small"
          mode="elevated"
          label={activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : 'Filters'}
        />
      )}

      {/* Advanced Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Title>Filters</Title>
            <IconButton icon="close" onPress={() => setIsFilterVisible(false)} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Distance Filter - Only show if user has location */}
            {userLocation && (
              <>
                <Text style={styles.filterSectionTitle}>📍 Maximum Distance from {userLocation.city}</Text>
                <View style={styles.chipContainer}>
                  {DISTANCE_OPTIONS.map((distance) => (
                    <Chip
                      key={distance}
                      selected={maxDistance === distance}
                      onPress={() => setMaxDistance(maxDistance === distance ? null : distance)}
                      style={styles.chip}
                      showSelectedOverlay
                    >
                      {distance} km
                    </Chip>
                  ))}
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {!userLocation && (
              <>
                <View style={styles.noLocationWarning}>
                  <Text style={styles.noLocationText}>
                    📍 Set your city in Profile to enable distance filtering!
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => {
                      setIsFilterVisible(false);
                      navigation.getParent()?.navigate('Profile');
                    }}
                    compact
                    style={styles.setLocationButton}
                  >
                    Go to Profile
                  </Button>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {/* City Filter */}
            <Text style={styles.filterSectionTitle}>City</Text>
            <View style={styles.chipContainer}>
              {CITIES.map((city) => (
                <Chip
                  key={city}
                  selected={selectedCities.includes(city)}
                  onPress={() => toggleFilter(selectedCities, city, setSelectedCities)}
                  style={styles.chip}
                  showSelectedOverlay
                >
                  {city}
                </Chip>
              ))}
            </View>
            <Divider style={styles.divider} />

            {/* Category Filter */}
            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  selected={selectedCategories.includes(cat)}
                  onPress={() => toggleFilter(selectedCategories, cat, setSelectedCategories)}
                  style={styles.chip}
                  showSelectedOverlay
                >
                  {cat}
                </Chip>
              ))}
            </View>
            <Divider style={styles.divider} />

            {/* Rating Filter */}
            <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
            <View style={styles.chipContainer}>
              {[4.0, 4.5, 4.8].map((rating) => (
                <Chip
                  key={rating}
                  selected={minRating === rating}
                  onPress={() => setMinRating(minRating === rating ? null : rating)}
                  style={styles.chip}
                  showSelectedOverlay
                >
                  {rating}+ ⭐
                </Chip>
              ))}
            </View>
            <Divider style={styles.divider} />

            {/* Cuisine Filter */}
            <Text style={styles.filterSectionTitle}>Cuisine</Text>
            <View style={styles.chipContainer}>
              {CUISINES.map((cuisine) => (
                <Chip
                  key={cuisine}
                  selected={selectedCuisines.includes(cuisine)}
                  onPress={() => toggleFilter(selectedCuisines, cuisine, setSelectedCuisines)}
                  style={styles.chip}
                  showSelectedOverlay
                >
                  {cuisine}
                </Chip>
              ))}
            </View>
            <Divider style={styles.divider} />

            {/* Atmosphere Filter */}
            <Text style={styles.filterSectionTitle}>Atmosphere</Text>
            <View style={styles.chipContainer}>
              {ATMOSPHERES.map((atm) => (
                <Chip
                  key={atm}
                  selected={selectedAtmospheres.includes(atm)}
                  onPress={() => toggleFilter(selectedAtmospheres, atm, setSelectedAtmospheres)}
                  style={styles.chip}
                  showSelectedOverlay
                >
                  {atm}
                </Chip>
              ))}
            </View>
            <Divider style={styles.divider} />

            {/* Features Filter */}
            <Text style={styles.filterSectionTitle}>Features</Text>
            <View style={styles.chipContainer}>
              {FEATURES.map((feat) => (
                <Chip
                  key={feat}
                  selected={selectedFeatures.includes(feat)}
                  onPress={() => toggleFilter(selectedFeatures, feat, setSelectedFeatures)}
                  style={styles.chip}
                  showSelectedOverlay
                >
                  {feat}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button mode="outlined" onPress={resetFilters} style={styles.footerButton}>
              Reset
            </Button>
            <Button mode="contained" onPress={() => setIsFilterVisible(false)} style={styles.footerButton}>
              Apply
            </Button>
          </View>
        </View>
      </Modal>
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
    paddingTop: 40,
    paddingBottom: 10,
  },
  searchContainer: { paddingHorizontal: 10, paddingBottom: 5 },
  searchbar: { elevation: 0, backgroundColor: '#f0f0f0' },
  toggleContainer: { paddingHorizontal: 10 },
  locationIndicator: {
    paddingHorizontal: 15,
    paddingTop: 8,
  },
  locationIndicatorText: {
    fontSize: 12,
    color: '#666',
  },
  locationBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  list: { padding: 10 },
  listHeader: {
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginBottom: 10,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#1976d2',
  },
  card: { marginBottom: 10 },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 5 
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cityText: { color: 'gray', fontSize: 12 },
  distanceBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 110,
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
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionDistance: {
    fontSize: 12,
    color: '#1976d2',
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
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewDistance: {
    fontSize: 12,
    color: '#1976d2',
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
    top: 190,
  },
  filterFab: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    zIndex: 101,
    backgroundColor: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 5,
  },
  divider: {
    marginVertical: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  noLocationWarning: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 14,
    color: '#e65100',
    textAlign: 'center',
    marginBottom: 10,
  },
  setLocationButton: {
    borderColor: '#e65100',
  },
});
