import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's local IP address when testing on physical device
export const API_BASE_URL = 'http://192.168.0.108:8080/api/v2';

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      headers: config.headers,
      method: config.method
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    return Promise.reject(error);
  }
);

export const endpoints = {
  login: '/login',
  signup: '/signup',
  updateLocation: '/location/update',
  pinLocation: '/location/pin',
  locationStats: '/location/stats',
  attendance: '/attendance',
  notifications: '/notifications',
  checkIn: '/attendance/check-in',
  checkOut: '/attendance/check-out',
  attendanceHistory: '/attendance/history',
  profile: '/profile',
  settings: '/settings',
  updateSettings: '/settings'
}; 