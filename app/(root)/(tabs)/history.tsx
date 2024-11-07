import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosInstance, endpoints } from '@/utils/config';

interface AttendanceRecord {
  id: number;
  checkIn: string;
  checkOut: string | null;
  status: 'PRESENT' | 'LATE' | 'EARLY_DEPARTURE' | 'ABSENT';
  workHours: number | null;
  date: string;
}

export default function History() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axiosInstance.get(`${endpoints.attendance}/history`, {
        params: {
          month: selectedMonth.getMonth() + 1,
          year: selectedMonth.getFullYear()
        }
      });
      if (response.data.success) {
        setRecords(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [selectedMonth]);

  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedMonth(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#10B981';
      case 'LATE': return '#F59E0B';
      case 'EARLY_DEPARTURE': return '#6366F1';
      case 'ABSENT': return '#EF4444';
      default: return '#666';
    }
  };

  const renderAttendanceRecord = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>
          {new Date(item.date).toLocaleDateString('en-US', { 
            weekday: 'long',
            day: 'numeric',
            month: 'short'
          })}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.recordDetails}>
        <View style={styles.timeDetail}>
          <Text style={styles.timeLabel}>Check In</Text>
          <Text style={styles.timeValue}>
            {new Date(item.checkIn).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {item.checkOut && (
          <View style={styles.timeDetail}>
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text style={styles.timeValue}>
              {new Date(item.checkOut).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}

        {item.workHours && (
          <View style={styles.timeDetail}>
            <Text style={styles.timeLabel}>Hours</Text>
            <Text style={styles.timeValue}>{item.workHours.toFixed(2)}h</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.monthButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.monthButton}>→</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderAttendanceRecord}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  monthButton: {
    fontSize: 24,
    color: '#0286FF',
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeDetail: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});