import React from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocationHistory {
  id: string;
  date: string;
  timeInside: string;
  timeOutside: string;
  location: string;
}

const mockHistory: LocationHistory[] = [
  {
    id: '1',
    date: '2024-03-10',
    timeInside: '6h 30m',
    timeOutside: '1h 45m',
    location: 'Home Area'
  },
  // Add more mock data
];

export default function History() {
  const renderItem = ({ item }: { item: LocationHistory }) => (
    <View style={styles.historyItem}>
      <Text style={styles.date}>{item.date}</Text>
      <View style={styles.timeContainer}>
        <Text>Inside: {item.timeInside}</Text>
        <Text>Outside: {item.timeOutside}</Text>
      </View>
      <Text style={styles.location}>{item.location}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Location History</Text>
      <FlatList
        data={mockHistory}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  location: {
    color: '#666',
  },
});