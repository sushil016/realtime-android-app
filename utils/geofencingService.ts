import * as Location from 'expo-location';
import { scheduleNotification } from './notificationService';
import { axiosInstance, endpoints } from './config';

interface LocationData {
  latitude: number;
  longitude: number;
}

export const startGeofencing = async (
  pinnedLocation: LocationData,
  radius: number,
  onEnter?: () => void,
  onExit?: () => void
) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 10,
    },
    async (location) => {
      const distance = calculateDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        pinnedLocation
      );

      const isInZone = distance <= radius;

      try {
        // Update location on server
        await axiosInstance.post(endpoints.updateLocation, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          isInZone
        });

        // Handle zone transitions
        if (isInZone) {
          onEnter?.();
          await scheduleNotification(
            'Entered Zone',
            'You have entered your designated area'
          );
        } else {
          onExit?.();
          await scheduleNotification(
            'Left Zone',
            'You have left your designated area'
          );
        }
      } catch (error) {
        console.error('Geofencing error:', error);
      }
    }
  );
};

const calculateDistance = (point1: LocationData, point2: LocationData): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}; 