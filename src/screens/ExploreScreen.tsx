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
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>;

// Filter Options
const CITIES = ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov', 'Constanța', 'Sibiu', 'Oradea', 'Galați', 'Craiova', 'Ploiești', 'Alba Iulia', 'Târgu Mureș'];
const CATEGORIES = ['Café / Coffee Shop', 'Restaurant', 'Fast-Food', 'Pizzeria / Italian', 'Vegan / Healthy', 'Tea House', 'Bistro', 'Pub / Bar', 'Smoothie Bar', 'Burger Place', 'Gaming Café'];
const CUISINES = ['Romanian', 'Transylvanian', 'Italian / Mediterranean', 'Asian / Wok', 'Vegan / Plant-based', 'Bakery / Breakfast', 'Seafood', 'Burgers', 'Brunch', 'Smoothies / Acai'];
const ATMOSPHERES = ['Quiet / Study-friendly', 'Modern', 'Romantic', 'Student-friendly', 'Group-friendly', 'Traditional', 'Relaxed', 'Social / Gaming'];
const FEATURES = ['Terrace', 'Sea view', 'Live music', 'Specialty coffee', 'Near campus', 'Wood-fired oven', 'Craft beer', 'Board games / consoles', 'Affordable / student menu', 'Healthy options'];
const DISTANCE_OPTIONS = [10, 25, 50, 100, 200, 500];

export default function ExploreScreen({ navigation }: Props) {
  const { theme } = useTheme();
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
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('Details', { venue: item })}>
      <Card.Cover source={{ uri: item.image_url }} />
      <Card.Content>
        <Title style={{ color: theme.colors.onSurface }}>{item.name}</Title>
        <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>{item.short_description}</Paragraph>
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <Paragraph style={{ color: theme.colors.onSurface }}>⭐ {item.rating}</Paragraph>
            <Text style={[styles.cityText, { color: theme.colors.onSurfaceVariant }]}>{item.city}</Text>
          </View>
          {item.distanceFromUser !== undefined && (
            <View style={[styles.distanceBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text style={[styles.distanceText, { color: theme.colors.onSecondaryContainer }]}>📍 {getDistanceLabel(item.distanceFromUser)}</Text>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              <View style={[styles.listHeader, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.listHeaderText, { color: theme.colors.onPrimaryContainer }]}>
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
        <View style={[styles.headerContainer, { top: !locationLoading && !userLocation ? 60 : 0, backgroundColor: theme.colors.surface }]}>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search locations..."
              onChangeText={onChangeSearch}
              value={searchQuery}
              style={[styles.searchbar, { backgroundColor: theme.colors.elevation.level2 }]}
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
              <Text style={[styles.locationIndicatorText, { color: theme.colors.onSurfaceVariant }]}>
                📍 Your location: {userLocation.city}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Toggle Button (FAB) */}
      <FAB
        icon={isHeaderVisible ? "chevron-up" : "magnify"}
        style={[styles.fab, isHeaderVisible ? styles.fabExpanded : styles.fabCollapsed, { backgroundColor: theme.colors.surface }]}
        onPress={() => setIsHeaderVisible(!isHeaderVisible)}
        size="small"
        mode="elevated"
        label={isHeaderVisible ? "Collapse" : "Search"}
      />
      
      {/* Suggestions List */}
      {searchQuery.length > 0 && viewMode === 'map' && !focusedVenue && isHeaderVisible && (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.surface }]}>
          <FlatList
            data={filteredVenues}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleVenueSelect(item)} style={[styles.suggestionItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                <View style={styles.suggestionContent}>
                  <Text style={{ color: theme.colors.onSurface }}>{item.name}</Text>
                  {item.distanceFromUser !== undefined && (
                    <Text style={[styles.suggestionDistance, { color: theme.colors.primary }]}>{getDistanceLabel(item.distanceFromUser)}</Text>
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
        <Card style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.previewContent}>
            <View style={styles.previewText}>
              <Title style={{ color: theme.colors.onSurface }}>{focusedVenue.name}</Title>
              <Paragraph numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{focusedVenue.short_description}</Paragraph>
              <View style={styles.previewMeta}>
                <Paragraph style={{ color: theme.colors.onSurface }}>⭐ {focusedVenue.rating}</Paragraph>
                {focusedVenue.distanceFromUser !== undefined && (
                  <Text style={[styles.previewDistance, { color: theme.colors.primary }]}>
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
          style={[styles.filterFab, { backgroundColor: theme.colors.primaryContainer }]}
          color={theme.colors.onPrimaryContainer}
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
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Title style={{ color: theme.colors.onSurface }}>Filters</Title>
            <IconButton icon="close" onPress={() => setIsFilterVisible(false)} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Distance Filter - Only show if user has location */}
            {userLocation && (
              <>
                <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>📍 Maximum Distance from {userLocation.city}</Text>
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
                <View style={[styles.noLocationWarning, { backgroundColor: theme.colors.errorContainer }]}>
                  <Text style={[styles.noLocationText, { color: theme.colors.onErrorContainer }]}>
                    📍 Set your city in Profile to enable distance filtering!
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => {
                      setIsFilterVisible(false);
                      navigation.getParent()?.navigate('Profile');
                    }}
                    compact
                    style={[styles.setLocationButton, { borderColor: theme.colors.onErrorContainer }]}
                    textColor={theme.colors.onErrorContainer}
                  >
                    Go to Profile
                  </Button>
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            {/* City Filter */}
            <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>City</Text>
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
            <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>Category</Text>
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
            <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>Minimum Rating</Text>
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
            <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>Cuisine</Text>
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
            <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>Atmosphere</Text>
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
            <Text style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>Features</Text>
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

          <View style={[styles.modalFooter, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.background }]}>
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
  container: { flex: 1 },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    paddingTop: 40,
    paddingBottom: 10,
  },
  searchContainer: { paddingHorizontal: 10, paddingBottom: 5 },
  searchbar: { elevation: 0 },
  toggleContainer: { paddingHorizontal: 10 },
  locationIndicator: {
    paddingHorizontal: 15,
    paddingTop: 8,
  },
  locationIndicatorText: {
    fontSize: 12,
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
    borderRadius: 8,
    marginBottom: 10,
  },
  listHeaderText: {
    fontSize: 14,
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
  cityText: { fontSize: 12 },
  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 110,
    left: 10,
    right: 10,
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
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionDistance: {
    fontSize: 12,
  },
  previewCard: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    elevation: 8,
    zIndex: 100,
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
  },
  previewActions: {
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 10,
    zIndex: 200,
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
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
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
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  noLocationWarning: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  setLocationButton: {
    borderWidth: 1,
  },
});
