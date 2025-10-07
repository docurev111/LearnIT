import { Platform } from 'react-native';

// Platform-specific API URLs for development
const getLocalApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator -> host loopback
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000'; // iOS simulator
  } else {
    return 'http://localhost:3000'; // Web or other platforms
  }
};

const LOCAL_API_BASE_URL = getLocalApiUrl();
const PROD_API_BASE_URL = 'https://your-production-server.com'; // Replace with your production backend URL

// Use environment variable or default to local for development
const API_BASE_URL = process.env.NODE_ENV === 'production' ? PROD_API_BASE_URL : LOCAL_API_BASE_URL;

export default API_BASE_URL;
