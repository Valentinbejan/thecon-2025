import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Avatar, Title, TextInput, ActivityIndicator, Menu, Divider, Switch } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { ROMANIAN_CITIES, CityData } from '../data/cities';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { isDarkTheme, toggleTheme, theme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [city, setCity] = useState<string>('');
  const [cityLat, setCityLat] = useState<number | null>(null);
  const [cityLong, setCityLong] = useState<number | null>(null);
  const [cityMenuVisible, setCityMenuVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getProfile(session);
    });
  }, []);

  async function getProfile(session: Session) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, full_name, city, city_lat, city_long`)
        .eq('id', session.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || '');
        setWebsite(data.website || '');
        setAvatarUrl(data.avatar_url);
        setFullName(data.full_name || '');
        setCity(data.city || '');
        setCityLat(data.city_lat || null);
        setCityLong(data.city_long || null);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCitySelect = (selectedCity: CityData) => {
    setCity(selectedCity.name);
    setCityLat(selectedCity.lat);
    setCityLong(selectedCity.long);
    setCityMenuVisible(false);
  };

  const justCleared = React.useRef(false);

  const clearCity = () => {
    setCity('');
    setCityLat(null);
    setCityLong(null);
    setCityMenuVisible(false);
    justCleared.current = true;
    setTimeout(() => {
      justCleared.current = false;
    }, 100);
  };

  const openCityMenu = () => {
    if (!justCleared.current) {
      setCityMenuVisible(true);
    }
  };



  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        username,
        website,
        full_name: fullName,
        avatar_url: avatarUrl,
        city: city || null,
        city_lat: cityLat,
        city_long: cityLong,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          uploadAvatar(asset.base64, asset.uri.split('.').pop()?.toLowerCase() || 'jpg');
        }
      }
    } catch (error) {
      Alert.alert('Error picking image');
    }
  }

  async function uploadAvatar(base64: string, fileExt: string) {
    try {
      setUploading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const filePath = `${session.user.id}/${new Date().getTime()}.${fileExt}`;
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);

      const updates = {
        id: session.user.id,
        avatar_url: data.publicUrl,
        updated_at: new Date(),
      };

      const { error: updateError } = await supabase.from('profiles').upsert(updates);
      if (updateError) throw updateError;
      
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert(error.message);
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Icon size={100} icon="account" style={{ backgroundColor: theme.colors.primaryContainer }} />
          )}
          {uploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Button mode="text" onPress={pickImage} disabled={uploading}>
          Change Photo
        </Button>
        <Title style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>{session?.user.email}</Title>
      </View>

      <View style={styles.form}>
        {/* Theme Toggle Section */}
        <View style={styles.themeRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Dark Mode</Text>
            <Text style={[styles.sectionSubtitle, { marginBottom: 0 }]}>
              Switch between light and dark themes
            </Text>
          </View>
          <Switch value={isDarkTheme} onValueChange={toggleTheme} />
        </View>
        <Divider style={styles.sectionDivider} />

        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          mode="outlined"
          textColor={theme.colors.onSurface}
        />
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          mode="outlined"
          textColor={theme.colors.onSurface}
        />
        <TextInput
          label="Website"
          value={website}
          onChangeText={setWebsite}
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          mode="outlined"
          textColor={theme.colors.onSurface}
          autoCapitalize="none"
        />

        {/* City Location Section */}
        <Divider style={styles.sectionDivider} />
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>📍 My Location</Text>
        <Text style={styles.sectionSubtitle}>
          Set your city to see distances to venues and get personalized recommendations
        </Text>
        


          <Menu
            visible={cityMenuVisible}
            onDismiss={() => setCityMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={openCityMenu} disabled={!!city}>
                <TextInput
                  label="City"
                  value={city}
                  style={[styles.input, { backgroundColor: theme.colors.surface }]}
                  mode="outlined"
                  textColor={theme.colors.onSurface}
                  editable={false}
                  right={
                    city ? (
                      <TextInput.Icon icon="close" onPress={clearCity} />
                    ) : (
                      <TextInput.Icon icon="chevron-down" onPress={openCityMenu} />
                    )
                  }
                  placeholder="Select your city..."
                />
              </TouchableOpacity>
            }
            contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
          >
          <ScrollView style={styles.menuScroll}>
            {ROMANIAN_CITIES.map((cityItem) => (
              <Menu.Item
                key={cityItem.name}
                onPress={() => handleCitySelect(cityItem)}
                title={cityItem.name}
                leadingIcon={city === cityItem.name ? 'check' : undefined}
              />
            ))}
          </ScrollView>
        </Menu>

        {city && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              ✅ Location set to {city}
            </Text>
            {cityLat && cityLong && (
              <Text style={styles.coordsText}>
                Coordinates: {cityLat.toFixed(4)}, {cityLong.toFixed(4)}
              </Text>
            )}
          </View>
        )}

        <Divider style={styles.sectionDivider} />

        <Button 
          mode="contained" 
          onPress={updateProfile} 
          loading={loading} 
          disabled={loading || uploading}
          style={styles.button}
        >
          {loading ? 'Saving...' : 'Update Profile'}
        </Button>

        <Button 
          mode="outlined" 
          onPress={signOut} 
          style={[styles.button, styles.signOutButton]}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    width: 100,
    height: 100,
    left: '50%',
    marginLeft: -50,
  },
  email: { marginTop: 10, fontSize: 16 },
  form: { width: '100%' },
  input: { marginBottom: 15 },
  button: { marginTop: 10, paddingVertical: 6 },
  signOutButton: { marginTop: 30, borderColor: '#ff4444' },
  sectionDivider: { marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 15 },
  menuContent: { maxHeight: 300 },
  menuScroll: { maxHeight: 280 },
  locationInfo: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: -5,
    marginBottom: 15,
  },
  locationText: { fontSize: 14, fontWeight: '500', color: '#2e7d32' },
  coordsText: { fontSize: 12, color: '#666', marginTop: 4 },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
