# 📚 LearnIT - Interactive Values Education Platform

> A gamified mobile learning application built with React Native (Expo) for teaching Filipino values and ethics through interactive scenarios, quizzes, and mini-games.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange)

---

## 🎯 About LearnIT

LearnIT is an educational mobile application designed to teach Filipino values and moral decision-making through:

- 📖 **Interactive Lessons** - Story-driven content with rich media (video, audio, 3D models)
- 🎬 **Scenario-Based Learning** - Branching narratives where choices matter
- 🎮 **Educational Mini-Games** - Memory cards, word scrambles, catching games
- ✅ **Quizzes** - Test comprehension with immediate feedback and XP rewards
- 🏆 **Gamification** - Levels, achievements, leaderboards, and daily rewards
- 👥 **Multi-Role Support** - Student and teacher dashboards
- 🌐 **Multilingual** - Tagalog and English support

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- Git
- Expo Go app on your phone (or Android Studio/Xcode for emulators)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/docurev111/LearnIT.git
cd LearnIT

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd LearnITapp
npm install
```

### Get Firebase Credentials

**⚠️ Important:** The Firebase service account key is not included in the repository for security.

1. Contact the project admin for `serviceAccountKey.json`
2. Place it at: `LearnIT/src/serviceAccountKey.json`
3. See [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) for detailed instructions

### Run the Application

**Terminal 1 - Backend Server:**
```bash
cd LearnIT
node src/server_fixed.js
```

**Terminal 2 - Expo Development Server:**
```bash
cd LearnIT/LearnITapp
npx expo start
```

**Open on your device:**
- Scan QR code with Expo Go app (must be on same Wi-Fi)
- Or press `a` for Android emulator / `i` for iOS simulator

📖 **Full setup guide:** [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)

---

## 📂 Project Structure

```
LearnIT/
├── src/                          # Backend (Node.js + Express)
│   ├── server_fixed.js          # Main server file
│   ├── firebase.js              # Firebase Admin SDK config
│   ├── routes/                  # API endpoints
│   ├── controllers/             # Business logic
│   ├── database/                # MySQL/PostgreSQL connection
│   └── middleware/              # Auth, validation, etc.
│
├── LearnITapp/                  # Frontend (React Native + Expo)
│   ├── app/                     # Screens (using Expo Router)
│   │   ├── HomeScreen.tsx
│   │   ├── LessonScreenNew.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── ScenarioScreen_*.tsx
│   │   └── ...
│   ├── components/              # Reusable components
│   │   ├── scenario/            # Scenario components
│   │   ├── shared/              # Common UI components
│   │   ├── lesson/              # Lesson components
│   │   └── ...
│   ├── assets/                  # Images, videos, audio, 3D models
│   ├── constants/               # Theme, colors, typography
│   ├── contexts/                # React contexts
│   └── i18n/                    # Internationalization
│
├── scripts/                     # Database & utility scripts
│   ├── seed_lessons_only.js
│   ├── check_database_structure.js
│   └── ...
│
└── docs/                        # Documentation
    ├── SETUP_GUIDE.md
    ├── FIREBASE_SETUP.md
    └── IMPROVEMENT_PROGRESS.md
```

---

## 🎮 Features

### For Students
- ✅ Learn through interactive video scenarios
- ✅ Make moral decisions with real consequences
- ✅ Earn XP, level up, and unlock achievements
- ✅ Compete on leaderboards
- ✅ Daily sign-in bonuses
- ✅ Track learning progress
- ✅ Play educational mini-games

### For Teachers
- ✅ Dashboard with student analytics
- ✅ Monitor student progress
- ✅ View completion rates
- ✅ Access detailed reports

### Technical Features
- ✅ Offline-first architecture (cached content)
- ✅ Anti-farming protection (XP limits)
- ✅ Responsive design (tablets & phones)
- ✅ Push notifications
- ✅ Profile customization
- ✅ Secure authentication (Firebase Auth)

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (via Expo)
- **TypeScript**
- **Expo Router** (file-based routing)
- **Expo AV** (video/audio playback)
- **React Native Reanimated** (animations)
- **Expo GL** (3D model rendering)
- **i18next** (internationalization)

### Backend
- **Node.js** + **Express**
- **Firebase Admin SDK** (authentication)
- **MySQL/PostgreSQL** (database)
- **JWT** (token management)

### Cloud Services
- **Firebase Authentication**
- **Firebase Cloud Storage** (media assets)
- **Firebase Cloud Messaging** (notifications)

---

## 📱 Screenshots

<!-- Add screenshots here when available -->

---

## 🧪 Development

### Available Scripts

**Backend:**
```bash
node src/server_fixed.js              # Start backend server
node scripts/seed_lessons_only.js     # Seed lesson data
node scripts/reset_user_progress.js   # Reset user progress
```

**Frontend:**
```bash
npx expo start                        # Start dev server
npx expo start --clear                # Clear cache and start
npx expo start --tunnel               # Use tunnel for network issues
```

### Code Quality

This project follows:
- ✅ TypeScript for type safety
- ✅ JSDoc documentation for components
- ✅ Modular component architecture
- ✅ Consistent naming conventions
- ✅ Git-ignored secrets (no credentials in repo)

📖 See [`COMPONENT_STRUCTURE.md`](./LearnITapp/components/COMPONENT_STRUCTURE.md) for architecture guidelines

---

## 📝 Recent Updates

### Phase 3 - Component Modularization (Oct 2025)
- ✅ Created 8 reusable scenario components
- ✅ Refactored `ScenarioScreen_L6` (1627→1446 lines, -11%)
- ✅ Added loading states & error handling components
- ✅ Improved code documentation

### Phase 2 - Code Organization (Oct 2025)
- ✅ Fixed naming inconsistencies
- ✅ Added JSDoc headers to major screens
- ✅ Created component folder structure

### Phase 1 - Security (Oct 2025)
- ✅ Secured Firebase service account keys
- ✅ Added comprehensive `.gitignore`
- ✅ Created setup documentation

📊 **Full progress:** [`IMPROVEMENT_PROGRESS.md`](./IMPROVEMENT_PROGRESS.md)

---

## 🤝 Contributing

### Development Workflow

1. **Clone and setup** (see Quick Start above)
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages:**
   ```bash
   git commit -m "Add: description of feature"
   ```
6. **Push and create Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards
- Follow existing code style
- Add JSDoc comments for new components
- Use TypeScript types/interfaces
- Test on both iOS and Android
- Update documentation if needed

---

## 👥 Team

- **Project Lead:** [Gerwin Alcober]
- **Developers:** [Gerwin Alcober, Stephen Rodriguez]

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/docurev111/LearnIT/issues)
- **Documentation:** Check the `/docs` folder

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- Icons from [Ionicons](https://ionic.io/ionicons)

---

<div align="center">

⭐ Star this repo if you find it helpful!

</div>
