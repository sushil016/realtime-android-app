import axios from 'axios';
import { Platform } from 'react-native';

export interface ApiEndpoints {
  login: string;
  signup: string;
  googleAuth: string;
  updateLocation: string;
  pinLocation: string;
  locationStats: string;
  activities: string;
  [key: string]: string;
}

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

export const endpoints: ApiEndpoints = {
  login: '/login',
  signup: '/signup',
  googleAuth: '/auth/google',
  updateLocation: '/location/update',
  pinLocation: '/location/pin',
  locationStats: '/location/stats',
  activities: '/activities',
}; 