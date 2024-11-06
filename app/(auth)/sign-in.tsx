import { View, Text, Image, Alert, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { icons, images } from '@/constants'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import Line from '@/components/Line'
import { Link, router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { endpoints } from '@/utils/config'

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

      const response = await axios.post(endpoints.login, {
        email: form.email,
        password: form.password
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
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
        <View style={styles.imageContainer}>
          <Image 
            source={images.signUpCar}
            style={styles.image}
          />
          <Text style={styles.headerText}>
            Enter your Credentials to proceed
          </Text>
        </View>

        <View style={styles.formContainer}>
          <InputField 
            label="Email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField 
            label="Password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />
        </View>

        <CustomButton 
          title="Login"
          style={styles.loginButton}
          onPress={SigninPressHandler}
          loading={loading}
        />
        
        <Line />

        <CustomButton
          title="Login with Google"
          style={styles.googleButton}
          IconLeft={() => (
            <Image
              source={icons.google}
              style={styles.googleIcon}
            />
          )}
          bgVariant="outline"
          textVariant="primary"
        />

        <View style={styles.footer}>
          <Text>
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
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    zIndex: 0,
  },
  headerText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  formContainer: {
    padding: 16,
  },
  loginButton: {
    paddingVertical: 16,
    width: 300,
    marginLeft: 32,
    marginVertical: 16,
  },
  googleButton: {
    marginVertical: 20,
    width: 300,
    marginLeft: 32,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 8,
  },
  footer: {
    alignItems: 'center',
  },
  link: {
    color: '#007AFF',
  },
});

export default SignIn;