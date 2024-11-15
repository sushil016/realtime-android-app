import { axiosInstance, endpoints } from './config';

export const testAllFeatures = async () => {
  const results = {
    auth: false,
    location: false,
    attendance: false,
    profile: false,
    notifications: false
  };

  try {
    // Test auth
    const loginTest = await axiosInstance.post(endpoints.login, {
      email: 'test@test.com',
      password: 'test123'
    });
    results.auth = loginTest.data.success;

    // Test location
    const locationTest = await axiosInstance.post(endpoints.updateLocation, {
      latitude: 0,
      longitude: 0
    });
    results.location = locationTest.data.success;

    // Test attendance
    const attendanceTest = await axiosInstance.get(endpoints.attendanceHistory);
    results.attendance = attendanceTest.data.success;

    // Test profile
    const profileTest = await axiosInstance.get(endpoints.profile);
    results.profile = profileTest.data.success;

    // Test notifications
    const notificationTest = await axiosInstance.get(endpoints.notifications);
    results.notifications = notificationTest.data.success;

    return results;
  } catch (error) {
    console.error('Feature test error:', error);
    return results;
  }
}; 