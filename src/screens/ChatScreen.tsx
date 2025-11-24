import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Avatar, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChatResponse, ChatMessage } from '../lib/ai';
import venuesData from '../data/locatii.json';
import venueMetadata from '../data/venue_metadata.json';

// Prepare context data once
const allVenues = (venuesData as any[]).map((item, index) => {
  const id = (index + 1).toString();
  const metadata = venueMetadata.find((m) => m.id === id);
  return { ...item, ...metadata };
});
const VENUE_CONTEXT = JSON.stringify(allVenues.map(v => ({
  name: v.name,
  city: v.city,
  category: v.category,
  rating: v.rating,
  description: v.short_description,
  features: v.features,
  atmosphere: v.atmosphere
})));

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const response = await getChatResponse([...messages, userMessage], VENUE_CONTEXT);
    
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
          <Avatar.Icon size={32} icon="robot" style={styles.avatar} />
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <Text style={isUser ? styles.userText : styles.aiText}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Title>VibeBot 🤖</Title>
        <Text style={styles.subtitle}>Ask me anything about our locations!</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Avatar.Icon size={64} icon="robot-excited" style={{ backgroundColor: '#e0e0e0' }} />
            <Text style={styles.emptyText}>Hi! I'm VibeBot.</Text>
            <Text style={styles.emptySubtext}>Ask me for recommendations like "Where can I find good coffee?" or "I need a quiet place to study."</Text>
          </View>
        }
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color="#6200ee" />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={styles.input}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  subtitle: {
    color: 'gray',
    fontSize: 12,
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
    backgroundColor: '#6200ee',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#6200ee',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    backgroundColor: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: 'gray',
    fontSize: 12,
  },
});

// Helper component for Title since it's not exported directly from paper sometimes
function Title({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{children}</Text>;
}
