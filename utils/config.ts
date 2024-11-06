// Change this to your computer's local IP address when testing on physical device
// or use ngrok to create a tunnel
export const API_BASE_URL = 'http://192.168.0.106:8080/api/v2';

export const endpoints = {
  login: `${API_BASE_URL}/login`,
  signup: `${API_BASE_URL}/signup`,
}; 