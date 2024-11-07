import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosInstance, endpoints } from '@/utils/config';

interface AttendanceRecord {
  id: number;
  checkIn: string;
  checkOut: string | null;
  status: 'PRESENT' | 'LATE' | 'EARLY_DEPARTURE' | 'ABSENT';
  workHours: number | null;
}

export default function Attendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendanceStatus();
    fetchRecentRecords();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axiosInstance.get(endpoints.todayAttendance);
      if (response.data.success) {
        setTodayRecord(response.data.attendance);
        setIsCheckedIn(!!response.data.attendance && !response.data.attendance.checkOut);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchRecentRecords = async () => {
    try {
      const response = await axiosInstance.get(endpoints.recentAttendance);
      if (response.data.success) {
        setRecentRecords(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching recent records:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await axiosInstance.post(endpoints.checkIn);
      if (response.data.success) {
        setIsCheckedIn(true);
        setTodayRecord(response.data.attendance);
        Alert.alert('Success', 'Checked in successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await axiosInstance.post(endpoints.checkOut);
      if (response.data.success) {
        setIsCheckedIn(false);
        setTodayRecord(response.data.attendance);
        Alert.alert('Success', 'Checked out successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to check out');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.todayCard}>
          <Text style={styles.cardTitle}>Today's Status</Text>
          {todayRecord ? (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                Check-in: {formatTime(todayRecord.checkIn)}
              </Text>
              {todayRecord.checkOut && (
                <Text style={styles.statusText}>
                  Check-out: {formatTime(todayRecord.checkOut)}
                </Text>
              )}
              <Text style={[
                styles.statusBadge,
                styles[`status${todayRecord.status}`]
              ]}>
                {todayRecord.status}
              </Text>
            </View>
          ) : (
            <Text style={styles.noRecordText}>No record for today</Text>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              isCheckedIn ? styles.checkOutButton : styles.checkInButton
            ]}
            onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
          >
            <Text style={styles.buttonText}>
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentRecords}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          {recentRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <Text style={styles.recordDate}>{formatDate(record.checkIn)}</Text>
              <View style={styles.recordDetails}>
                <Text>Check-in: {formatTime(record.checkIn)}</Text>
                {record.checkOut && (
                  <Text>Check-out: {formatTime(record.checkOut)}</Text>
                )}
                {record.workHours && (
                  <Text>Hours: {record.workHours.toFixed(2)}</Text>
                )}
                <Text style={[
                  styles.statusBadge,
                  styles[`status${record.status}`]
                ]}>
                  {record.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  todayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
  },
  noRecordText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#0286FF',
  },
  checkOutButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentRecords: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordDetails: {
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusPRESENT: {
    backgroundColor: '#10B981',
    color: '#fff',
  },
  statusLATE: {
    backgroundColor: '#F59E0B',
    color: '#fff',
  },
  statusEARLY_DEPARTURE: {
    backgroundColor: '#6366F1',
    color: '#fff',
  },
  statusABSENT: {
    backgroundColor: '#EF4444',
    color: '#fff',
  },
}); 