# 🎨 Profile Customization - Quick Reference

## 📱 User Actions

### Open Modal
```
Profile Screen → Click Profile Picture → Modal Opens
```

### Select Avatar
```
Avatar Tab → Choose System Avatar OR Upload Custom
```

### Select Border
```
Border Tab → Choose Border Style
```

### Select Title
```
Title Tab → Choose Unlocked Title (requires XP)
```

### Save
```
Review Selections → Click "Save Changes" → Done!
```

---

## 💻 Developer Reference

### Import Modal
```typescript
import ProfileCustomizationModal from "./ProfileCustomizationModal";
```

### Add State
```typescript
const [customizationModalVisible, setCustomizationModalVisible] = useState(false);
const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
const [selectedBorder, setSelectedBorder] = useState<string | null>(null);
const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
```

### Render Modal
```typescript
<ProfileCustomizationModal
  visible={customizationModalVisible}
  onClose={() => setCustomizationModalVisible(false)}
  currentAvatar={selectedAvatar || 'avatar1'}
  currentBorder={selectedBorder || 'none'}
  currentTitle={selectedTitle}
  userXP={userProfile?.total_xp || 0}
  onSave={handleSaveCustomization}
/>
```

---

## 🌐 API Quick Reference

### Save Customization
```bash
PUT /users/:user_id/customization
Headers: Authorization: Bearer {token}
Body: { avatar, border, title }
```

### Get Customization
```bash
GET /users/:user_id/customization
Headers: Authorization: Bearer {token}
```

---

## 🗄️ Database Quick Reference

### Table
```sql
user_customization (
  user_id, 
  selected_avatar, 
  selected_border, 
  selected_title, 
  updated_at
)
```

### Query User Customization
```sql
SELECT * FROM user_customization WHERE user_id = ?
```

---

## 📁 File Locations

### Frontend
- `frontend/app/ProfileCustomizationModal.tsx` - Modal component
- `frontend/app/ProfileScreen.tsx` - Profile screen (modified)

### Backend
- `backend/server_fixed.js` - API endpoints (modified)
- `backend/test_profile_customization.js` - Test suite

### Scripts
- `scripts/migrate_customization.js` - Database migration

### Assets
- `assets/images/borders/` - Border images
- `assets/images/Titles/` - Title cards + GIFs
- `assets/images/Sample/` - Design mockups

### Documentation
- `docs/PROFILE_CUSTOMIZATION_COMPLETE.md` - Full implementation guide
- `docs/PROFILE_CUSTOMIZATION_GUIDE.md` - Feature documentation
- `docs/PROFILE_CUSTOMIZATION_IMPLEMENTATION.md` - Technical details
- `docs/PROFILE_CUSTOMIZATION_USER_GUIDE.md` - User instructions

---

## 🎯 XP Requirements

| Title | XP |
|-------|-----|
| Matalinong Isip | 500 |
| Busilak na Puso | 1,000 |
| Tagapagtuklas | 1,500 |
| Bayani ng Kaalaman | 2,000 |
| Tunay na Aralero | 3,000 |

---

## 🔧 Common Commands

### Run Migration
```bash
cd scripts && node migrate_customization.js
```

### Run Tests
```bash
cd backend && node test_profile_customization.js
```

### Start Backend
```bash
cd backend && node server_fixed.js
```

### Start Frontend
```bash
cd frontend && npm start
```

---

## 🐛 Troubleshooting

### Modal not opening?
- Check `customizationModalVisible` state
- Verify TouchableOpacity on avatar has `onPress`

### Border not showing?
- Check border image path
- Verify border state is not 'none'
- Check overlay styling (absolute positioning)

### Title locked?
- Verify user's XP meets requirement
- Check `userXP >= title.unlockRequirement` logic

### API errors?
- Check backend server is running
- Verify authentication token is valid
- Check database connection

### Images not loading?
- Verify asset paths are correct
- Check require() statements
- Ensure images exist in assets folder

---

## ✅ Testing Checklist

- [ ] Modal opens/closes
- [ ] Avatar selection works
- [ ] Custom upload functional
- [ ] Border preview correct
- [ ] Title locking works
- [ ] Save persists data
- [ ] API calls succeed
- [ ] Database updates
- [ ] UI responsive
- [ ] No TypeScript errors

---

## 📞 Support

Check documentation files for detailed information:
- Technical issues → PROFILE_CUSTOMIZATION_GUIDE.md
- User questions → PROFILE_CUSTOMIZATION_USER_GUIDE.md
- Implementation details → PROFILE_CUSTOMIZATION_IMPLEMENTATION.md

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
