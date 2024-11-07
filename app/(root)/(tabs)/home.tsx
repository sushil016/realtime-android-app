import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants';
import { axiosInstance, endpoints } from '@/utils/config';

interface Location {
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [pinnedLocation, setPinnedLocation] = useState<Location | null>(null);
  const [isInsideRadius, setIsInsideRadius] = useState(true);
  const [stats, setStats] = useState({
    timeInZone: 0,
    timeOutZone: 0,
    percentage: 0
  });
  const [weeklyStats, setWeeklyStats] = useState([]);

  const updateCurrentLocation = async (location: Location) => {
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
      const [statsRes, weeklyRes] = await Promise.all([
        axiosInstance.get(endpoints.locationStats),
        axiosInstance.get(endpoints.weeklyStats)
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (weeklyRes.data.success) {
        setWeeklyStats(weeklyRes.data.weeklyStats.dailyBreakdown);
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

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Location Statistics</Text>
          <View style={styles.statItem}>
            <Text>Time spent in pinned area: 2h 30m</Text>
          </View>
          <View style={styles.statItem}>
            <Text>Time spent outside: 45m</Text>
          </View>
        </View>

        <View style={styles.additionalContent}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Today's Summary</Text>
              <Text style={styles.activityTime}>Last updated 5m ago</Text>
            </View>
            
            <View style={styles.activityStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>In Zone</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>15%</Text>
                <Text style={styles.statLabel}>Out Zone</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Weekly Report</Text>
          <View style={styles.weeklyCard}>
            <View style={styles.weekDay}>
              <Text>Monday</Text>
              <View style={[styles.progressBar, { width: '80%' }]} />
            </View>
            <View style={styles.weekDay}>
              <Text>Tuesday</Text>
              <View style={[styles.progressBar, { width: '65%' }]} />
            </View>
            <View style={styles.weekDay}>
              <Text>Wednesday</Text>
              <View style={[styles.progressBar, { width: '90%' }]} />
            </View>
            <View style={styles.weekDay}>
              <Text>Thursday</Text>
              <View style={[styles.progressBar, { width: '75%' }]} />
            </View>
            <View style={styles.weekDay}>
              <Text>Friday</Text>
              <View style={[styles.progressBar, { width: '85%' }]} />
            </View>
          </View>
        </View>
        
        <View style={{ height: 20 }} />
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
});