import { axiosInstance, endpoints } from './config';

export const checkRoutes = async () => {
  const routeChecks = {
    auth: false,
    location: false,
    attendance: false,
    profile: false,
    notifications: false
  };

  try {
    // Check auth routes
    const authCheck = await axiosInstance.get('/health');
    routeChecks.auth = authCheck.data.status === 'ok';

    // Check location routes
    const locationCheck = await axiosInstance.get('/health/location');
    routeChecks.location = locationCheck.data.status === 'ok';

    // Check attendance routes
    const attendanceCheck = await axiosInstance.get('/health/attendance');
    routeChecks.attendance = attendanceCheck.data.status === 'ok';

    // Check profile routes
    const profileCheck = await axiosInstance.get('/health/profile');
    routeChecks.profile = profileCheck.data.status === 'ok';

    // Check notification routes
    const notificationCheck = await axiosInstance.get('/health/notifications');
    routeChecks.notifications = notificationCheck.data.status === 'ok';

    return routeChecks;
  } catch (error) {
    console.error('Route check error:', error);
    return routeChecks;
  }
}; 