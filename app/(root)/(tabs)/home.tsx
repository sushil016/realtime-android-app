import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  Dimensions,
  Platform 
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants';
import { axiosInstance, endpoints } from '@/utils/config';
import { LineChart } from 'react-native-chart-kit';
import * as Notifications from 'expo-notifications';
import { setupLocationTracking } from '@/utils/locationTrackingService';

// Set up notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface LocationData {
  latitude: number;
  longitude: number;
}

interface Stats {
  timeInside: string;
  timeOutside: string;
  percentage: number;
  lastUpdated: Date;
  historicalData?: {
    date: string;
    percentage: number;
  }[];
}

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [pinnedLocation, setPinnedLocation] = useState<LocationData | null>(null);
  const [customRadius, setCustomRadius] = useState(200); // Default radius in meters
  const [stats, setStats] = useState<Stats>({
    timeInside: '0h 0m',
    timeOutside: '0h 0m',
    percentage: 0,
    lastUpdated: new Date(),
    historicalData: []
  });
  const [isInsideZone, setIsInsideZone] = useState(false);

  useEffect(() => {
    registerForPushNotifications();
    setupLocationTracking();
    return () => {
      // Cleanup
    };
  }, []);

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('location-alerts', {
        name: 'Location Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications to receive location alerts.');
    }
  };

  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'location-alert' },
      },
      trigger: null,
    });
  };

  const checkZoneStatus = (location: LocationData) => {
    if (!pinnedLocation) return;

    const distance = calculateDistance(location, pinnedLocation);
    const newIsInsideZone = distance <= customRadius;

    if (newIsInsideZone !== isInsideZone) {
      sendNotification(
        newIsInsideZone ? 'Entered Zone' : 'Left Zone',
        newIsInsideZone 
          ? 'You have entered your pinned location zone'
          : 'You have left your pinned location zone'
      );
      setIsInsideZone(newIsInsideZone);
    }
  };

  const calculateDistance = (loc1: LocationData, loc2: LocationData) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const updateCurrentLocation = async (location: LocationData) => {
    try {
      await axiosInstance.post(endpoints.updateLocation, {
        latitude: location.latitude,
        longitude: location.longitude
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handlePinLocation = async () => {
    if (currentLocation) {
      try {
        const response = await axiosInstance.post(endpoints.pinLocation, {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        });
        
        if (response.data.success) {
          setPinnedLocation(currentLocation);
          Alert.alert('Success', 'Location pinned successfully');
        }
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to pin location');
      }
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await axiosInstance.get(endpoints.locationStats);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error.response?.data?.message);
    }
  };

  useEffect(() => {
    let locationSubscription: any;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 60000, // Update every minute
          distanceInterval: 10 // Update every 10 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          };
          setCurrentLocation(newLocation);
          updateCurrentLocation(newLocation);
        }
      );

      // Initial location fetch
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      // Fetch initial stats
      fetchStats();
    })();

    // Set up interval to fetch stats
    const statsInterval = setInterval(fetchStats, 60000); // Update every minute

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome 👋</Text>
        <TouchableOpacity
          onPress={() => {/* handle sign out */}}
          style={styles.signOutButton}
        >
          <Image source={icons.out} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView
              style={styles.map}
              initialRegion={{
                ...currentLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker coordinate={currentLocation} />
              {pinnedLocation && (
                <Circle
                  center={pinnedLocation}
                  radius={200}
                  fillColor="rgba(0, 150, 255, 0.2)"
                  strokeColor="rgba(0, 150, 255, 0.5)"
                />
              )}
            </MapView>
          )}
        </View>

        <TouchableOpacity
          style={styles.pinButton}
          onPress={handlePinLocation}
        >
          <Text style={styles.pinButtonText}>Pin Current Location</Text>
        </TouchableOpacity>

        <View style={styles.radiusControl}>
          <Text style={styles.radiusLabel}>Zone Radius: {customRadius}m</Text>
          <View style={styles.radiusButtons}>
            <TouchableOpacity 
              style={styles.radiusButton}
              onPress={() => setCustomRadius(prev => Math.max(100, prev - 100))}
            >
              <Text style={styles.radiusButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radiusButton}
              onPress={() => setCustomRadius(prev => Math.min(1000, prev + 100))}
            >
              <Text style={styles.radiusButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Location Statistics</Text>
          <View style={styles.statItem}>
            <Text>Time spent in pinned area: {stats.timeInside}</Text>
          </View>
          <View style={styles.statItem}>
            <Text>Time spent outside: {stats.timeOutside}</Text>
          </View>
        </View>

        <View style={styles.additionalContent}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Today's Summary</Text>
              <Text style={styles.activityTime}>
                Last updated {new Date(stats.lastUpdated).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.activityStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.percentage}%</Text>
                <Text style={styles.statLabel}>In Zone</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{100 - stats.percentage}%</Text>
                <Text style={styles.statLabel}>Out Zone</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={{ height: 20 }} />

        {stats.historicalData && stats.historicalData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Activity</Text>
            <LineChart
              data={{
                labels: stats.historicalData.map(d => d.date),
                datasets: [{
                  data: stats.historicalData.map(d => d.percentage)
                }]
              }}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(2, 134, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              style={styles.chart}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  pinButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statItem: {
    padding: 8,
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 4,
  },
  additionalContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityTime: {
    color: '#666',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  weeklyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  weekDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  radiusControl: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radiusButton: {
    backgroundColor: '#0286FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
