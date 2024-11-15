import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosInstance, endpoints } from '@/utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { icons } from '@/constants';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface UserProfile {
  userName: string;
  email: string;
  department: string;
  role: string;
  phoneNumber?: string;
  collegeName?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  joinedDate?: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [changePassword, setChangePassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    fetchProfile();
    requestMediaLibraryPermission();
  }, []);

  const requestMediaLibraryPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get(endpoints.profile);
      if (response.data.success) {
        setProfile(response.data.user);
        setEditedProfile(response.data.user);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        } as any);

        const response = await axiosInstance.post(endpoints.uploadAvatar, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setProfile(prev => prev ? { ...prev, avatar: response.data.avatarUrl } : null);
          setEditedProfile(prev => prev ? { ...prev, avatar: response.data.avatarUrl } : null);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!editedProfile) return;

      const updateData: any = {
        userName: editedProfile.userName,
        email: editedProfile.email,
        department: editedProfile.department,
        phoneNumber: editedProfile.phoneNumber,
        collegeName: editedProfile.collegeName,
        organization: editedProfile.organization,
        bio: editedProfile.bio,
        address: editedProfile.address,
        city: editedProfile.city,
        country: editedProfile.country
      };

      if (changePassword.new) {
        if (changePassword.new !== changePassword.confirm) {
          Alert.alert('Error', 'New passwords do not match');
          return;
        }
        updateData.currentPassword = changePassword.current;
        updateData.newPassword = changePassword.new;
      }

      const response = await axiosInstance.put(endpoints.profile, updateData);

      if (response.data.success) {
        setProfile(response.data.user);
        setIsEditing(false);
        setChangePassword({ current: '', new: '', confirm: '' });
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderProfileHeader = () => {
    if (!profile) return null;
    
    return (
      <LinearGradient
        colors={['#0286FF', '#0066CC']}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleImagePick}
            disabled={!isEditing || uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Image
                  source={profile?.avatar ? { uri: profile.avatar } : icons.person}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={1000}
                />
                {isEditing && (
                  <View style={styles.editAvatarOverlay}>
                    <Text style={styles.editAvatarText}>Change</Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.userName || 'User'}</Text>
          <Text style={styles.userRole}>{profile?.role || 'User'}</Text>
        </View>
      </LinearGradient>
    );
  };

  const renderField = (
    label: string,
    value: string | undefined,
    key: keyof UserProfile,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      multiline?: boolean;
    }
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, options?.multiline && styles.multilineInput]}
          value={editedProfile?.[key] || ''}
          onChangeText={(text) => setEditedProfile(prev => ({ ...prev!, [key]: text }))}
          placeholder={options?.placeholder || `Enter ${label.toLowerCase()}`}
          keyboardType={options?.keyboardType || 'default'}
          multiline={options?.multiline}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {value || 'Not set'}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            {renderField('Full Name', profile.userName, 'userName')}
            {renderField('Email', profile.email, 'email', { keyboardType: 'email-address' })}
            {renderField('Phone Number', profile.phoneNumber, 'phoneNumber', { keyboardType: 'phone-pad' })}
            {renderField('Bio', profile.bio, 'bio', { multiline: true })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work & Education</Text>
            {renderField('Department', profile.department, 'department')}
            {renderField('College/University', profile.collegeName, 'collegeName')}
            {renderField('Organization', profile.organization, 'organization')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            {renderField('Address', profile.address, 'address', { multiline: true })}
            {renderField('City', profile.city, 'city')}
            {renderField('Country', profile.country, 'country')}
          </View>

          {isEditing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry
                value={changePassword.current}
                onChangeText={(text) => setChangePassword(prev => ({ ...prev, current: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={changePassword.new}
                onChangeText={(text) => setChangePassword(prev => ({ ...prev, new: text }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={changePassword.confirm}
                onChangeText={(text) => setChangePassword(prev => ({ ...prev, confirm: text }))}
              />
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditedProfile(profile);
                  setChangePassword({ current: '', new: '', confirm: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={handleSignOut}
              >
                <Text style={styles.buttonText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    minHeight: 200,
    paddingTop: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userRole: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0286FF',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8FAFC',
    color: '#333',
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    backgroundColor: '#0286FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#0286FF',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});