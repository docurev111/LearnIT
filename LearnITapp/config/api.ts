import { Platform } from 'react-native';

// Auto-pick a sensible default in dev, allow override via EXPO_PUBLIC_API_URL
// For physical phone: use your computer's local network IP (both devices must be on same WiFi)
const LOCAL_NETWORK_IP = 'http://192.168.254.115:3000';

const DEFAULT_DEV = Platform.select({
	android: LOCAL_NETWORK_IP, // Physical phone - use local network IP
	ios: LOCAL_NETWORK_IP,     // Physical phone - use local network IP
	default: 'http://localhost:3000', // Metro on desktop or web
});

const DEV_API = process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV!;
const PROD_API = process.env.EXPO_PUBLIC_API_URL || 'https://your-production-server.com';
const API_BASE_URL = process.env.NODE_ENV === 'production' ? PROD_API : DEV_API;

export default API_BASE_URL;
