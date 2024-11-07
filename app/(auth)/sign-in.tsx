import { View, Text, ScrollView, Alert, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import { icons } from '@/constants'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import Line from '@/components/Line'
import { Link, router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { endpoints, axiosInstance } from '@/utils/config'

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  async function SigninPressHandler() {
    try {
      setLoading(true);
      if (!form.email || !form.password) {
        Alert.alert("Error", "Please fill all the details");
        return;
      }

      const maxRetries = 3;
      let retryCount = 0;
      let lastError;

      while (retryCount < maxRetries) {
        try {
          const response = await axiosInstance.post(endpoints.login, {
            email: form.email,
            password: form.password
          });

          if (response.data.success) {
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('isLoggedIn', 'true');
            router.replace("/(root)/(tabs)/home");
            return;
          } else {
            Alert.alert("Error", response.data.message || "Login failed");
            return;
          }
        } catch (error: any) {
          lastError = error;
          if (error.response) {
            // If we got a response, don't retry
            throw error;
          }
          retryCount++;
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        "Error",
        error.response?.data?.message || 
        error.message || 
        "Unable to connect to server. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField 
            label="Email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />
          <InputField 
            label="Password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value: string) => setForm({ ...form, password: value })}
          />
          
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </View>

        <CustomButton 
          title="Login"
          style={styles.loginButton}
          onPress={SigninPressHandler}
          loading={loading}
        />
        
        <Line label="or continue with" />

        <CustomButton
          title="Login with Google"
          style={styles.googleButton}
          IconLeft={() => (
            <View style={styles.googleIconContainer}>
              <Image source={icons.google} style={styles.googleIcon} />
            </View>
          )}
          bgVariant="outline"
          textVariant="primary"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't Have an account?{" "}
            <Link href="/(auth)/sign-up" style={styles.link}>
              Sign-up
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 128,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#007AFF',
    marginTop: 8,
  },
  loginButton: {
    marginTop: 8,
  },
  googleButton: {
    marginTop: 24,
    backgroundColor: "#fff",
  },
  googleIconContainer: {
    marginRight: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SignIn;