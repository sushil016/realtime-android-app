import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { checkAuthStatus } from "@/utils/auth";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const authStatus = await checkAuthStatus();
      setIsLoggedIn(authStatus);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoggedIn(false);
    }
  };

  // Show loading while checking auth status
  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  // Redirect based on auth status
  return isLoggedIn ? (
    <Redirect href="/(root)/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  );
}