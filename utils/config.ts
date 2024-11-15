import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './auth'; // Import the getToken function
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's actual IP address here
const DEV_API_URL = Platform.select({
  ios: 'http://localhost:8080/api/v2',
  android: 'http://192.168.0.106:8080/api/v2',
});

export const API_BASE_URL = __DEV__ ? DEV_API_URL : 'https://your-production-url.com/api/v2';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Updated request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No auth token found');
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401
      await AsyncStorage.multiRemove(['token', 'user', 'isLoggedIn']);
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Redirect to login
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  // Auth
  login: '/login',
  signup: '/signup',
  googleAuth: '/auth/google',
  
  // Location
  updateLocation: '/location/update',
  pinLocation: '/location/pin',
  locationStats: '/location/stats',
  
  // Attendance
  attendance: '/attendance',
  checkIn: '/attendance/check-in',
  checkOut: '/attendance/check-out',
  attendanceHistory: '/attendance/history',
  
  // Profile
  profile: '/profile',
  updateProfile: '/profile',
  uploadAvatar: '/profile/avatar',
  
  // History
  locationHistory: '/history/location',
  activities: '/activities',
  activitySummary: '/history/summary',
  
  // Notifications
  notifications: '/notifications',
  markNotificationRead: '/notifications/:id/read'
}; 