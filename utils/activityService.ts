import { axiosInstance, endpoints } from './config';

export interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export const logActivity = async (
  type: string,
  description: string,
  location: { latitude: number; longitude: number }
) => {
  try {
    const response = await axiosInstance.post(endpoints.logActivity, {
      type,
      description,
      location
    });
    return response.data;
  } catch (error) {
    console.error('Activity logging error:', error);
    throw error;
  }
};

export const getActivities = async (params?: {
  startDate?: Date;
  endDate?: Date;
  type?: string;
}) => {
  try {
    const response = await axiosInstance.get(endpoints.activities, { params });
    return response.data;
  } catch (error) {
    console.error('Get activities error:', error);
    throw error;
  }
}; 