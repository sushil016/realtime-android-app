import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance, endpoints } from '@/utils/config';
import { icons } from '@/constants';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
  });

  React.useEffect(() => {
    handleSignInResponse();
  }, [response]);

  const handleSignInResponse = async () => {
    if (response?.type === 'success') {
      const { authentication } = response;
      
      try {
        // Send the token to your backend
        const backendResponse = await axiosInstance.post(endpoints.googleAuth, {
          token: authentication.accessToken
        });

        if (backendResponse.data.success) {
          await AsyncStorage.setItem('token', backendResponse.data.token);
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('userData', JSON.stringify(backendResponse.data.user));
          router.replace("/(root)/(tabs)/home");
        }
      } catch (error) {
        console.error('Google sign in error:', error);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={() => promptAsync()}
    >
      <Image source={icons.google} style={styles.icon} />
      <Text style={styles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
}); 