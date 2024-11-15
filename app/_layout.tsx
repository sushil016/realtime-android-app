import { useEffect, useState } from 'react';
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { getToken } from '@/utils/auth';
import { axiosInstance } from '@/utils/config';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  
  // Always call useFonts hook, regardless of isReady state
  const [fontsLoaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        const token = await getToken();
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get token:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  // Wait for both fonts to load and initial preparation
  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="(auth)" options={{headerShown: false}}/>
        <Stack.Screen name="(root)/(tabs)" options={{headerShown: false}}/>
      </Stack>
    </AuthProvider>
  );
}
