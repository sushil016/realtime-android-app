import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { checkAuthStatus } from '@/utils/auth';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/welcome');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return null; // Or a loading spinner
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
