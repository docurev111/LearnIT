# LearnIT - Local Development Setup Guide

## 📋 Prerequisites

Before you start, make sure you have these installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Expo CLI** - Will be installed via npm
- **Android Studio** (for Android) or **Xcode** (for iOS/Mac only)

### Optional but Recommended
- **Expo Go app** on your phone (easier for testing)
  - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS](https://apps.apple.com/app/expo-go/id982107779)

---

## 🚀 Getting Started

### Step 1: Clone the Repository

```powershell
# Navigate to where you want the project
cd D:\

# Clone from GitHub
git clone https://github.com/docurev111/LearnIT.git
cd LearnIT
```

---

### Step 2: Set Up Firebase Credentials

**IMPORTANT:** The Firebase service account key is NOT in GitHub (for security).

1. **Get the service account key:**
   - Ask the project admin for `serviceAccountKey.json`
   - OR download it from [Firebase Console](https://console.firebase.google.com/)
     - Go to Project Settings → Service Accounts
     - Click "Generate New Private Key"

2. **Place the key file:**
   ```powershell
   # Put it in the src folder
   # The file should be at: D:\LearnIT\src\serviceAccountKey.json
   ```

3. **Verify it's ignored by Git:**
   ```powershell
   git check-ignore -v src/serviceAccountKey.json
   # Should show: .gitignore:125:**/serviceAccountKey.json
   ```

**See `FIREBASE_SETUP.md` for detailed Firebase configuration.**

---

### Step 3: Install Backend Dependencies

```powershell
# In the LearnIT root directory
npm install
```

This installs all backend dependencies listed in `package.json`.

---

### Step 4: Install Frontend (Expo App) Dependencies

```powershell
# Navigate to the Expo app directory
cd LearnITapp

# Install dependencies
npm install
```

This installs all React Native/Expo dependencies.

---

### Step 5: Set Up Environment Variables (Optional)

```powershell
# In the root directory, create a .env file
# Copy from the example
cp .env.example .env

# Edit .env with your settings (if needed)
```

For most local development, the defaults work fine.

---

## 🏃 Running the Application

### Backend Server

The backend provides the API for lessons, quizzes, leaderboards, etc.

```powershell
# From the root directory (D:\LearnIT)
node src/server_fixed.js
```

You should see:
```
✓ Firebase Admin initialized
Server running on port 3000
```

**Keep this terminal open!** The backend must run while testing the app.

---

### Frontend (Expo App)

Open a **NEW terminal** (keep backend running):

```powershell
# Navigate to the Expo app
cd D:\LearnIT\LearnITapp

# Start Expo development server
npx expo start
```

You'll see a QR code and options:

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

---

## 📱 Testing the App

### Option 1: Expo Go (Easiest - Physical Device)

1. **Install Expo Go** on your phone (see Prerequisites)
2. **Scan the QR code** shown in terminal
3. App will load on your phone!

**Note:** Make sure your phone and laptop are on the **same Wi-Fi network**.

---

### Option 2: Android Emulator

1. **Open Android Studio**
2. **Start an emulator** (AVD Manager)
3. In Expo terminal, **press `a`** to open on Android

---

### Option 3: iOS Simulator (Mac only)

1. **Install Xcode** from Mac App Store
2. In Expo terminal, **press `i`** to open iOS simulator

---

### Option 4: Web Browser (Limited functionality)

```powershell
# In Expo terminal, press 'w'
# Or run:
npx expo start --web
```

**Note:** Some features (camera, push notifications) won't work in web.

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot find module 'firebase-admin'"

**Solution:**
```powershell
# In root directory
npm install
```

---

### Issue 2: "Firebase Admin not initialized"

**Cause:** Missing `serviceAccountKey.json`

**Solution:** Follow Step 2 above to add the Firebase key.

---

### Issue 3: "Port 3000 already in use"

**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port
# Edit src/server_fixed.js line with: const PORT = 3001;
```

---

### Issue 4: Expo app shows "Network Error"

**Causes:**
- Backend server not running
- Phone not on same Wi-Fi as laptop
- Firewall blocking connection

**Solutions:**
1. Check backend is running (terminal should show "Server running")
2. Verify same Wi-Fi network
3. Try running with tunnel:
   ```powershell
   npx expo start --tunnel
   ```

---

### Issue 5: "Unable to resolve module"

**Solution:**
```powershell
# Clear cache and reinstall
cd LearnITapp
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📂 Project Structure

```
LearnIT/
├── src/                        # Backend code
│   ├── server_fixed.js        # Main server file
│   ├── firebase.js            # Firebase config
│   ├── serviceAccountKey.json # ⚠️ SECRET - Not in Git
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   └── database/              # DB connection
├── LearnITapp/                # Frontend Expo app
│   ├── App.js                 # Entry point
│   ├── app/                   # Screens
│   ├── components/            # Reusable components
│   ├── assets/                # Images, videos, audio
│   └── package.json           # Frontend dependencies
├── scripts/                   # Database scripts
├── package.json               # Backend dependencies
└── .gitignore                 # Excludes secrets
```

---

## 🔄 Development Workflow

### Daily Development

1. **Start backend:**
   ```powershell
   cd D:\LearnIT
   node src/server_fixed.js
   ```

2. **Start Expo (new terminal):**
   ```powershell
   cd D:\LearnIT\LearnITapp
   npx expo start
   ```

3. **Make changes** to code
4. **Hot reload** - Changes appear automatically!

### Making Changes

```powershell
# 1. Create a feature branch
git checkout -b feature/my-new-feature

# 2. Make changes to code

# 3. Test thoroughly

# 4. Commit changes
git add .
git commit -m "Add my new feature"

# 5. Push to GitHub
git push origin feature/my-new-feature

# 6. Create Pull Request on GitHub
```

---

## 🧪 Running Scripts

### Database Scripts

```powershell
# In root directory
node scripts/seed_lessons_only.js
node scripts/check_database_structure.js
node scripts/reset_user_progress.js
```

### Testing Auth

```powershell
node src/test_auth_enhanced.js
node debug_user.js
```

---

## 📦 Installing New Dependencies

### Backend (Root)
```powershell
cd D:\LearnIT
npm install package-name
```

### Frontend (Expo)
```powershell
cd D:\LearnIT\LearnITapp
npm install package-name

# For Expo-specific packages
npx expo install package-name
```

---

## 🆘 Getting Help

### Documentation
- **Firebase Setup:** `FIREBASE_SETUP.md`
- **Component Structure:** `LearnITapp/components/COMPONENT_STRUCTURE.md`
- **Component Usage:** `LearnITapp/components/README.md`
- **Progress Tracker:** `IMPROVEMENT_PROGRESS.md`

### Expo Documentation
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

### Project-Specific
- Ask the team lead
- Check GitHub Issues
- Review closed PRs for examples

---

## ✅ Verification Checklist

Before you start developing, verify:

- [ ] Node.js installed (`node --version` shows v18+)
- [ ] Git installed (`git --version`)
- [ ] Repository cloned successfully
- [ ] `serviceAccountKey.json` in `src/` folder
- [ ] Backend dependencies installed (`npm install` in root)
- [ ] Frontend dependencies installed (`npm install` in LearnITapp)
- [ ] Backend server starts without errors
- [ ] Expo dev server starts and shows QR code
- [ ] App loads on device/emulator

---

## 🎉 You're Ready!

Once all steps are complete, you should have:
- ✅ Backend API running on `http://localhost:3000`
- ✅ Expo dev server running
- ✅ App loaded on your device/emulator
- ✅ Hot reload working (changes reflect immediately)

**Happy coding! 🚀**

---

Last updated: October 9, 2025
