import { View, Text, ScrollView, Alert, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import { icons } from '@/constants'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import Line from '@/components/Line'
import { Link, router } from 'expo-router'
import axios from 'axios'
import { endpoints } from '@/utils/config'

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: ""
  });

  async function handleSubmit() {
    try {
      setLoading(true);
      if (!form.userName || !form.email || !form.password) {
        Alert.alert("Error", "Please fill all details");
        return;
      }

      const response = await axios.post(endpoints.signup, {
        userName: form.userName,
        email: form.email,
        password: form.password
      });

      if (response.data.success) {
        Alert.alert("Success", "Account created successfully", [
          { text: "OK", onPress: () => router.replace("/(auth)/sign-in") }
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Signup failed");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField 
            label="Full Name"
            icon={icons.person}
            value={form.userName}
            onChangeText={(value: string) => setForm({...form, userName: value})}
          />
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
        </View>

        <CustomButton 
          title="Sign up"
          style={styles.signupButton}
          onPress={handleSubmit}
          loading={loading}
        />
        
        <Line label="or continue with" />

        <CustomButton
          title="Sign up with Google"
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
            Already have an account?{" "}
            <Link href="/(auth)/sign-in" style={styles.link}>
              Sign in
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
  signupButton: {
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

export default Signup;