import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants';
import GoogleTextInput from '@/components/GoogleTextInput';

interface Location {
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [pinnedLocation, setPinnedLocation] = useState<Location | null>(null);
  const [isInsideRadius, setIsInsideRadius] = useState(true);
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);

  const handlePinLocation = () => {
    if (currentLocation) {
      setPinnedLocation(currentLocation);
      Alert.alert('Location pinned successfully');
    }
  };

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
});