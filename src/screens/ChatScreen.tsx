import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Avatar, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChatResponse, ChatMessage } from '../lib/ai';
import venuesData from '../data/locatii.json';
import venueMetadata from '../data/venue_metadata.json';
import { supabase } from '../lib/supabase';
import { UserLocation } from '../types';
import { calculateDistance } from '../lib/distance';
import { useTheme } from '../context/ThemeContext';

export default function ChatScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Fetch user location
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      async function fetchUserLocation() {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data } = await supabase
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
            } else if (isActive) {
              setUserLocation(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user location:', error);
        }
      }

      fetchUserLocation();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Prepare context data with distances
  const prepareVenueContext = () => {
    const allVenues = (venuesData as any[]).map((item, index) => {
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
        ...metadata,
        distanceFromUser,
      };
    });

    return JSON.stringify(allVenues.map(v => ({
      name: v.name,
      city: v.city,
      category: v.category,
      rating: v.rating,
      description: v.short_description,
      features: v.features,
      atmosphere: v.atmosphere,
      distanceKm: v.distanceFromUser,
    })));
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const venueContext = prepareVenueContext();
    const locationContext = userLocation 
      ? `\n\nIMPORTANT: The user is located in ${userLocation.city}. When recommending places, prioritize venues that are closer to ${userLocation.city} and mention the distance. The distanceKm field shows how far each venue is from the user in kilometers.`
      : '\n\nNote: The user has not set their location yet. You can suggest they set it in their profile for distance-based recommendations.';

    const fullContext = venueContext + locationContext;

    const response = await getChatResponse([...messages, userMessage], fullContext);
    
    const aiMessage: ChatMessage = { role: 'assistant', content: response };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);

    // Scroll to bottom again
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageContainer, 
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        {!isUser && (
          <Avatar.Icon size={32} icon="robot" style={[styles.avatar, { backgroundColor: theme.colors.primary }]} />
        )}
        <View style={[
          styles.messageBubble,
          isUser ? [styles.userBubble, { backgroundColor: theme.colors.primary }] : [styles.aiBubble, { backgroundColor: theme.colors.surface }]
        ]}>
          <Text style={isUser ? [styles.userText, { color: theme.colors.onPrimary }] : [styles.aiText, { color: theme.colors.onSurface }]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
          <Title style={{ color: theme.colors.onSurface }}>VibeBot 🤖</Title>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Ask me anything about our locations!</Text>
          {userLocation && (
            <View style={[styles.locationBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text style={[styles.locationText, { color: theme.colors.onSecondaryContainer }]}>📍 Your location: {userLocation.city}</Text>
            </View>
          )}
          {!userLocation && (
            <View style={[styles.noLocationBadge, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={[styles.noLocationText, { color: theme.colors.onErrorContainer }]}>Set your city in Profile for personalized recommendations!</Text>
            </View>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Avatar.Icon size={64} icon="robot-excited" style={{ backgroundColor: theme.colors.surfaceVariant }} />
              <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>Hi! I'm VibeBot.</Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                {userLocation 
                  ? `I see you're in ${userLocation.city}! Ask me for recommendations like "What's close to me?" or "Find a coffee shop nearby."`
                  : 'Ask me for recommendations like "Where can I find good coffee?" or "I need a quiet place to study."'}
              </Text>
              {userLocation && (
                <View style={[styles.suggestionChips, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text style={[styles.suggestionsTitle, { color: theme.colors.onSurfaceVariant }]}>Try asking:</Text>
                  <Text style={[styles.suggestionChip, { color: theme.colors.onSurfaceVariant }]}>• "What's the closest café to me?"</Text>
                  <Text style={[styles.suggestionChip, { color: theme.colors.onSurfaceVariant }]}>• "Find restaurants within 50km"</Text>
                  <Text style={[styles.suggestionChip, { color: theme.colors.onSurfaceVariant }]}>• "Best rated places near {userLocation.city}"</Text>
                </View>
              )}
            </View>
          }
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Thinking...</Text>
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
          <TextInput
            mode="outlined"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
            textColor={theme.colors.onSurface}
            right={<TextInput.Icon icon="send" onPress={handleSend} disabled={isLoading || !inputText.trim()} />}
            onSubmitEditing={handleSend}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
  },
  locationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noLocationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  noLocationText: {
    fontSize: 11,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  userText: {
  },
  aiText: {
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  suggestionChips: {
    marginTop: 20,
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  suggestionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionChip: {
    marginVertical: 4,
    fontSize: 13,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
  },
});

// Helper component for Title
function Title({ children, style }: { children: React.ReactNode, style?: any }) {
  return <Text style={[{ fontSize: 20, fontWeight: 'bold' }, style]}>{children}</Text>;
}
