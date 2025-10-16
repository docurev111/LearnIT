# Network Error Fix - README

## Problem
The app was showing: `ERROR Fetch error when contacting backend: [TypeError: Network request failed]`

## Root Cause
The backend API probe configuration (`LearnITapp/config/api_probe.ts`) had an outdated IP address that didn't match the current network configuration.

## What Was Fixed

### 1. Updated IP Address (Primary Fix)
- **Old IP**: `10.210.1.244:3000` 
- **New IP**: `10.210.1.246:3000`
- Your computer's IP address changed, causing the app to fail when trying to connect

### 2. Improved Probe Order
Reordered the candidate URLs for better reliability:
```typescript
[
  'http://127.0.0.1:3000',    // Most reliable localhost IP
  'http://10.210.1.246:3000', // Current LAN IP
  'http://10.0.2.2:3000',     // Android emulator
  'http://localhost:3000'     // DNS-based (slower)
]
```

### 3. Enhanced Logging
Added better console logging to help debug future connection issues:
- Shows which URLs are being tried
- Reports successful connections
- Provides detailed error information

### 4. Better Error Messages
Updated the LoginScreen to show more helpful error messages that include:
- The URL being attempted
- Troubleshooting steps
- Server requirements

## Testing
Created `test_network.js` to verify backend connectivity. Run with:
```bash
cd LearnITapp
node test_network.js
```

Current test results:
- ✓ `http://127.0.0.1:3000` - Working
- ✓ `http://10.210.1.246:3000` - Working
- ✗ `http://localhost:3000` - Timeout (DNS issue)
- ✗ `http://10.0.2.2:3000` - Not accessible from host machine (only for emulator)

## How to Apply the Fix

### Option 1: Restart the App
If you're running Expo:
```bash
# Stop the current Expo process (Ctrl+C)
# Clear cache and restart
cd LearnITapp
npx expo start -c
```

### Option 2: If IP Changes Again
If your computer's IP address changes again (common with DHCP):

1. Find your current IP:
   ```powershell
   ipconfig | Select-String "IPv4"
   ```

2. Update `LearnITapp/config/api_probe.ts`:
   - Change the LAN IP in the `DEFAULT_CANDIDATES` array

3. Restart the app

## Backend Server Status
The backend server is confirmed running and accessible:
- ✓ Server running on port 3000
- ✓ Listening on `0.0.0.0` (all interfaces)
- ✓ Health endpoint responding: `http://10.210.1.246:3000/health`
- ✓ CORS enabled

## For Physical Devices
When testing on a physical Android/iOS device:
1. Ensure the device is on the same WiFi network
2. Use the LAN IP (`10.210.1.246:3000`) not localhost
3. Check firewall settings if still having issues

## For Android Emulator
The emulator uses `10.0.2.2` to access the host's `localhost`.
The probe automatically prioritizes this for Android platform.

## Troubleshooting

### Still getting network errors?
1. Check if backend is running:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. Verify server is accessible:
   ```powershell
   curl http://127.0.0.1:3000/health
   ```

3. Check console logs in Expo for detailed probe results

### IP keeps changing?
Consider setting a static IP on your development machine, or use environment variables:
```bash
# In LearnITapp directory
# Create .env file (or use existing)
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
```

## Files Modified
1. `LearnITapp/config/api_probe.ts` - Updated IP and improved probing logic
2. `LearnITapp/app/LoginScreen.tsx` - Better error messages
3. `LearnITapp/test_network.js` - New test utility (created)
4. `LearnITapp/NETWORK_FIX_README.md` - This documentation (created)
