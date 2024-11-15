import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosInstance, endpoints } from '@/utils/config';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { getToken } from '@/utils/auth';

const { width } = Dimensions.get('window');

interface Activity {
  id: number;
  date: string;
  timeInside: number;
  timeOutside: number;
  percentage: number;
  status: 'IN_ZONE' | 'OUT_ZONE';
  attendance?: {
    checkIn: string;
    checkOut: string | null;
    status: string;
  };
}

interface WeeklyStats {
  labels: string[];
  data: number[];
}

export default function History() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    labels: [],
    data: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'day' | 'week' | 'month'>('day');
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const token = await getToken();
      if (!token) {
        setError('Please login to view your activity history');
        return;
      }
      
      const response = await axiosInstance.get(`${endpoints.activities}?filter=${selectedFilter}`);
      
      if (response?.data?.success) {
        setActivities(response.data.activities || []);
        setWeeklyStats({
          labels: response.data.weeklyStats?.labels || [],
          data: response.data.weeklyStats?.data || []
        });
      } else {
        setError('Failed to fetch activities');
        setActivities([]);
        setWeeklyStats({ labels: [], data: [] });
      }
    } catch (error: any) {
      console.error('Fetch activities error:', error);
      setError(error.response?.data?.message || 'Unable to load activities. Please try again.');
      setActivities([]);
      setWeeklyStats({ labels: [], data: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        await fetchActivities();
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.activityCard}>
      <LinearGradient
        colors={item.status === 'IN_ZONE' ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
        style={styles.statusIndicator}
      />
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityDate}>
            {format(new Date(item.date), 'MMM dd, yyyy')}
          </Text>
          <Text style={[
            styles.statusText,
            { color: item.status === 'IN_ZONE' ? '#10B981' : '#EF4444' }
          ]}>
            {item.status === 'IN_ZONE' ? 'In Zone' : 'Out Zone'}
          </Text>
        </View>

        <View style={styles.timeStats}>
          <View style={styles.timeStat}>
            <Text style={styles.timeLabel}>Time Inside</Text>
            <Text style={styles.timeValue}>{formatTime(item.timeInside)}</Text>
          </View>
          <View style={styles.timeStat}>
            <Text style={styles.timeLabel}>Time Outside</Text>
            <Text style={styles.timeValue}>{formatTime(item.timeOutside)}</Text>
          </View>
          <View style={styles.timeStat}>
            <Text style={styles.timeLabel}>In Zone</Text>
            <Text style={styles.percentageValue}>{item.percentage}%</Text>
          </View>
        </View>

        {item.attendance && (
          <View style={styles.attendanceContainer}>
            <Text style={styles.attendanceLabel}>Attendance</Text>
            <View style={styles.attendanceDetails}>
              <Text style={styles.attendanceTime}>
                Check In: {format(new Date(item.attendance.checkIn), 'hh:mm a')}
              </Text>
              {item.attendance.checkOut && (
                <Text style={styles.attendanceTime}>
                  Check Out: {format(new Date(item.attendance.checkOut), 'hh:mm a')}
                </Text>
              )}
              <Text style={[
                styles.attendanceStatus,
                { color: item.attendance.status === 'CHECKED_IN' ? '#10B981' : '#6B7280' }
              ]}>
                {item.attendance.status === 'CHECKED_IN' ? 'Currently Working' : 'Shift Complete'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Activity History</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'day' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('day')}
        >
          <Text style={[styles.filterText, selectedFilter === 'day' && styles.filterTextActive]}>
            Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'week' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('week')}
        >
          <Text style={[styles.filterText, selectedFilter === 'week' && styles.filterTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'month' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('month')}
        >
          <Text style={[styles.filterText, selectedFilter === 'month' && styles.filterTextActive]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChart = () => {
    if (!weeklyStats.labels.length || !weeklyStats.data.length) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Time in Zone Trend</Text>
          <Text style={styles.emptyText}>No data available for the selected period</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Time in Zone Trend</Text>
        <LineChart
          data={{
            labels: weeklyStats.labels,
            datasets: [{
              data: weeklyStats.data.length ? weeklyStats.data : [0]
            }]
          }}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(2, 134, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#0286FF'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0286FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchActivities}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderChart()}
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No activities recorded yet</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0286FF',
  },
  chartContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
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
  listContainer: {
    flexGrow: 1,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  statusIndicator: {
    width: 4,
  },
  activityContent: {
    flex: 1,
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeStat: {
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
  percentageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0286FF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0286FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  attendanceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attendanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  attendanceDetails: {
    flexDirection: 'column',
    gap: 4,
  },
  attendanceTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  attendanceStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});