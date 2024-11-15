import { Tabs } from "expo-router";
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { checkAuthStatus } from '@/utils/auth';
import { icons } from '@/constants';

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      }
    };

    checkAuth();
  }, []);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { paddingBottom: 10, height: 70 },
      tabBarActiveTintColor: '#0286FF',
    }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <Image 
              source={icons.home}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#0286FF' : '#64748B'
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ focused }) => (
            <Image 
              source={icons.history}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#0286FF' : '#64748B'
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: "Alerts",
          tabBarIcon: ({ focused }) => (
            <Image 
              source={icons.bell}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#0286FF' : '#64748B'
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <Image 
              source={icons.user}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#0286FF' : '#64748B'
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}