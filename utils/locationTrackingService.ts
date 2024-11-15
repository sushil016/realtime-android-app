import * as Location from 'expo-location';
import { axiosInstance, endpoints } from './config';

export const setupLocationTracking = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // 10 seconds
      distanceInterval: 10, // 10 meters
    },
    async (location) => {
      try {
        await axiosInstance.post(endpoints.updateLocation, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Location update error:', error);
      }
    }
  );
}; 