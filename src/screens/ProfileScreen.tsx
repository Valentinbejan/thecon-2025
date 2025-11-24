import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Avatar, Title, TextInput, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
        .select(`username, website, avatar_url, full_name`)
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
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

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

      // Automatically save the new avatar URL to the profile
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
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
        <Title style={styles.email}>{session?.user.email}</Title>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Website"
          value={website}
          onChangeText={setWebsite}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
        />

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
          color="red"
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
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
    marginLeft: -50, // Center horizontally relative to parent
  },
  email: { marginTop: 10, fontSize: 16, color: '#666' },
  form: { width: '100%' },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  button: { marginTop: 10, paddingVertical: 6 },
  signOutButton: { marginTop: 30, borderColor: '#ff4444' },
});
