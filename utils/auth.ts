import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from './config';

export const TOKEN_KEY = '@auth_token';

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem('userData'),
      AsyncStorage.removeItem('isLoggedIn')
    ]);
    delete axiosInstance.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const [token, isLoggedIn] = await Promise.all([
      getToken(),
      AsyncStorage.getItem('isLoggedIn')
    ]);
    return !!(token && isLoggedIn === 'true');
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
}; 