# Profile Customization Feature

## Overview
The Profile Customization feature allows users to personalize their profile with custom avatars, borders, and title cards. Users can access this feature by clicking on their profile picture in the Profile Screen.

## Features

### 1. **Avatar Selection**
Users can choose from:
- **System Avatars**: Pre-defined mascot avatars included in the app
- **Custom Upload**: Users can upload their own profile picture from their device's photo library

### 2. **Border Selection**
Users can select decorative borders to display around their profile picture:
- No Border (default)
- Bronze Border (border1.png)
- Silver Border (border2.png)
- Gold Border (border3.png)

### 3. **Title Cards**
Users can unlock and display special title cards based on their XP:
- **Matalinong Isip** - 500 XP (Brain GIF)
- **Busilak na Puso** - 1000 XP (Heart GIF)
- **Tagapagtuklas** - 1500 XP (Rocket GIF)
- **Bayani ng Kaalaman** - 2000 XP (Graduation Hat GIF)
- **Tunay na Aralero** - 3000 XP (Laurel Wreath GIF)

## Implementation Details

### Frontend Components

#### `ProfileCustomizationModal.tsx`
A full-screen modal that provides three tabs:
- **Avatar Tab**: Grid of system avatars + upload option
- **Border Tab**: Preview of borders overlaid on avatar
- **Title Tab**: Display of title cards with animated GIFs

**Key Features:**
- Touch-friendly large buttons
- Visual previews of customization
- XP-based locking system for titles
- Real-time preview of selections

#### `ProfileScreen.tsx` Updates
- Added modal trigger when clicking profile picture
- Display selected border around profile picture
- Load and save customization settings
- Integration with backend API

### Backend Endpoints

#### `PUT /users/:user_id/customization`
Saves user's customization preferences.

**Request Body:**
```json
{
  "avatar": "avatar1",
  "border": "border2",
  "title": "matalinong_isip"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile customization updated successfully",
  "customization": {
    "avatar": "avatar1",
    "border": "border2",
    "title": "matalinong_isip"
  }
}
```

#### `GET /users/:user_id/customization`
Retrieves user's saved customization preferences.

**Response:**
```json
{
  "user_id": 1,
  "selected_avatar": "avatar1",
  "selected_border": "border2",
  "selected_title": "matalinong_isip",
  "updated_at": "2025-10-15T10:30:00"
}
```

### Database Schema

A new table `user_customization` is created:

```sql
CREATE TABLE IF NOT EXISTS user_customization (
  user_id INTEGER PRIMARY KEY,
  selected_avatar TEXT,
  selected_border TEXT,
  selected_title TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## Asset Structure

```
frontend/assets/images/
├── borders/
│   ├── border1.png    # Bronze border
│   ├── border2.png    # Silver border
│   └── border3.png    # Gold border
├── Titles/
│   ├── Matalinong Isip.png      # Title card background
│   ├── brain.gif                 # Animated icon
│   ├── Busilak na Puso.png      # Title card background
│   ├── heart.gif                 # Animated icon
│   ├── Tagapagtuklas.png        # Title card background
│   ├── rocket.gif                # Animated icon
│   ├── Bayani ng Kaalaman.png   # Title card background
│   ├── graduationhat.gif        # Animated icon
│   ├── Tunay na Aralero.png     # Title card background
│   └── laurelwreath.gif         # Animated icon
└── Sample/
    ├── Edit Avatar.png   # Design reference
    ├── Edit Border.png   # Design reference
    └── Edit Title.png    # Design reference
```

## Usage Flow

1. **Open Profile Screen**: User navigates to their profile
2. **Click Profile Picture**: Opens the customization modal
3. **Select Tab**: Choose between Avatar, Border, or Title
4. **Make Selection**: 
   - For Avatar: Choose system avatar or upload custom
   - For Border: Select border style
   - For Title: Choose unlocked title (based on XP)
5. **Save Changes**: Click "Save Changes" button
6. **View Updates**: Modal closes and profile displays new customization

## XP Requirements

Title cards are unlocked progressively as users earn XP:
- 500 XP for first title
- 1000 XP for second title
- 1500 XP for third title
- 2000 XP for fourth title
- 3000 XP for fifth title

## Technical Considerations

### Performance
- Images are loaded lazily
- GIFs are optimized for mobile performance
- Modal uses native animations for smooth transitions

### State Management
- Customization state is managed in ProfileScreen
- Changes are persisted to backend immediately on save
- Local state updates provide instant feedback

### Error Handling
- Graceful fallbacks for missing assets
- Network error handling for API calls
- Permission handling for image uploads

### Future Enhancements
- Add more avatar options
- Seasonal/event-based borders and titles
- Achievement-based unlockables
- Profile themes
- Animated borders
- Social sharing of customized profiles

## Testing Checklist

- [ ] Avatar selection works for all system avatars
- [ ] Custom avatar upload from photo library
- [ ] Border preview displays correctly
- [ ] Title card locking based on XP
- [ ] Title card GIF animations display properly
- [ ] Save button persists selections
- [ ] Profile screen reflects saved customizations
- [ ] Border overlay positioned correctly on avatar
- [ ] Modal animations smooth
- [ ] Backend endpoints respond correctly
- [ ] Database saves and retrieves customization
- [ ] Error handling for network failures
- [ ] Permission requests for photo library access

## Design References

The design mockups are available in:
- `frontend/assets/images/Sample/Edit Avatar.png`
- `frontend/assets/images/Sample/Edit Border.png`
- `frontend/assets/images/Sample/Edit Title.png`

These show the intended UI/UX for the customization modal.
