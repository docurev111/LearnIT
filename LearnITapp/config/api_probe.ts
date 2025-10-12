// Lightweight API probe helper
import { Platform } from 'react-native';

const DEFAULT_CANDIDATES = [
  'http://10.210.1.244:3000', // Your current LAN IP (update if it changes)
  'http://10.0.2.2:3000',     // Android emulator host loopback (only works on emulator)
  'http://127.0.0.1:3000',    // Localhost IP (only works on same device)
  'http://192.168.254.115:3000',
  'http://localhost:3000'     // DNS-based localhost (can be slow)
  
];

async function probeUrl(url: string, timeout = 1000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url + '/health', { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (e) {
    return false;
  }
}

export default async function pickApiBase(candidates?: string[]) {
  const list = candidates || DEFAULT_CANDIDATES;
  
  // Reorder candidates based on platform
  const orderedList = [...list];
  if (Platform.OS === 'android') {
    // For Android, prioritize 10.0.2.2 (emulator host loopback)
    orderedList.sort((a, b) => {
      if (a.includes('10.0.2.2')) return -1;
      if (b.includes('10.0.2.2')) return 1;
      if (a.includes('localhost')) return 1; // de-prioritize localhost on Android
      return 0;
    });
  }
  
  console.log('Probing API candidates:', orderedList);
  
  for (const url of orderedList) {
    try {
      console.log('Trying:', url);
      // 3s probe per host for better reliability on slower networks
      const ok = await probeUrl(url, 3000);
      if (ok) {
        console.log('✓ Found working API at:', url);
        return url;
      }
    } catch (e) {
      console.log('✗ Failed:', url, e);
    }
  }
  
  // Fallback to first candidate to preserve current behavior
  console.warn('No API responded, falling back to:', orderedList[0]);
  return orderedList[0];
}
