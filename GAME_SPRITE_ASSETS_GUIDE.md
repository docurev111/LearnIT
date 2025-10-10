# 🎨 GAME SPRITE ASSETS GUIDE
## Professional Assets for LearnIT ESP Mini-Games

---

## 📦 FREE SPRITE RESOURCES (NO ATTRIBUTION NEEDED)

### **1. OpenGameArt.org**
🔗 https://opengameart.org/

**Best For:** 2D sprites, characters, items, backgrounds
**Search Terms to Use:**
- "runner character" (for Values Path Runner)
- "collectible items" (for good values)
- "obstacles rocks" (for bad behaviors)
- "basket character" (for Good vs Bad Catch)
- "emotion faces" (for Emotion Match)

**Filters:**
- License: CC0 (Public Domain) or OGA-BY 3.0
- Type: 2D Art > Sprites
- Tags: Character, Platform, Runner, Casual

---

### **2. Kenney.nl** ⭐ HIGHLY RECOMMENDED
🔗 https://kenney.nl/assets

**Why Perfect for You:**
- ✅ 100% FREE
- ✅ NO attribution required
- ✅ Professional quality
- ✅ Consistent art style
- ✅ PNG format with transparency

**Recommended Asset Packs:**

#### For Values Path Runner:
- **"Platformer Characters"** - Running character sprites
- **"Platformer Art Deluxe"** - Platforms, items, obstacles
- **"Jumper Pack"** - Jump effects, collectibles
- **"Game Icons"** - Value icons (heart, star, shield)

#### For Good vs Bad Catch:
- **"Game Icons"** - Various icon sprites
- **"Physics Assets"** - Falling objects
- **"Ui Pack"** - Score displays, life hearts

#### For Emotion Match:
- **"Emote Pack"** - Emotion faces
- **"UI Pack Space Expansion"** - Buttons and cards

**Download Link:** https://kenney.nl/assets?q=2d

---

### **3. Itch.io - Free Game Assets**
🔗 https://itch.io/game-assets/free

**Search Terms:**
- "2d platformer sprites"
- "runner game assets"
- "casual game icons"
- "filipino character sprite" (might find cultural assets!)

**Filters:**
- Price: Free
- Type: Game assets
- Tag: Sprites, 2D

---

### **4. Craftpix.net - Free Assets**
🔗 https://craftpix.net/freebies/

**Best For:** High-quality 2D game sprites
**Free Packs Available:**
- "Free Runner Game Assets"
- "Free Platformer Game Assets"
- "Free Game Icons Pack"

---

## 🎯 SPECIFIC ASSETS NEEDED FOR YOUR GAMES

### **GAME 1: Good vs Bad Catch** 🎮

**Priority Assets:**
1. **Character Catcher (80x80px)** - ✅ You already have one!
2. **Good Value Icons (64x64px each):**
   - Handshake icon (Respect)
   - Star icon (Honesty)
   - Heart icon (Love)
   - Helping hands icon (Kindness)
   - Sun icon (Hope)
   - Praying hands icon (Faith)

3. **Bad Behavior Icons (64x64px each):**
   - X mark / prohibition sign
   - Angry face
   - Money bag with claws
   - Storm cloud
   
**Where to Get:**
- Kenney.nl → "Game Icons" pack (has all of these!)
- Or: https://kenney.nl/assets/game-icons

---

### **GAME 5: Values Path Runner** 🏃‍♂️

**Priority Assets:**
1. **Running Character:**
   - Idle stance (1 frame)
   - Running animation (4-6 frames)
   - Jumping animation (3-4 frames)
   
   **Source:** 
   - Kenney.nl → "Platformer Characters" 
   - Or: https://opengameart.org/content/platformer-character-deluxe

2. **Collectible Values (50x50px):**
   - Glowing coins/gems (represent values)
   - Stars (different colors for different values)
   
   **Source:**
   - Kenney.nl → "Jumper Pack"
   - Search for "collectible sprites"

3. **Obstacles (50x60px):**
   - Rocks
   - Barrels
   - Spikes
   
   **Source:**
   - Kenney.nl → "Platformer Art Deluxe"

4. **Background:**
   - Sky layers (parallax)
   - Ground tiles
   - Clouds
   
   **Source:**
   - Kenney.nl → "Background Elements"
   - Or: https://opengameart.org/content/backgrounds

---

### **GAME 4: Emotion Match** 💭

**Priority Assets:**
1. **Emotion Face Icons (64x64px each):**
   - Happy 😊
   - Sad 😢
   - Angry 😠
   - Scared 😨
   - Excited 🤩
   - Shy 😳
   - Proud 😌
   
   **Source:**
   - Kenney.nl → "Emote Pack"
   - Or: https://opengameart.org/content/emoji-set

2. **Character Portraits:**
   - Filipino-style character faces showing emotions
   
   **Source:**
   - Itch.io → Search "character portraits"
   - Or: https://opengameart.org/content/character-portraits

---

## 🎨 RECOMMENDED: KENNEY ASSET PACKS TO DOWNLOAD

Download these complete packs and you'll have everything you need:

1. **"Platformer Pack Redux"** 
   - https://kenney.nl/assets/platformer-pack-redux
   - Characters, tiles, items, enemies

2. **"Game Icons"**
   - https://kenney.nl/assets/game-icons
   - 1000+ icons for values/actions

3. **"Jumper Pack"**
   - https://kenney.nl/assets/jumper-pack
   - Perfect for runner game

4. **"Emote Pack"**
   - https://kenney.nl/assets/emote-pack
   - Emotion faces

5. **"UI Pack"**
   - https://kenney.nl/assets/ui-pack
   - Score displays, buttons, life hearts

**Total Download Size:** ~50MB
**Total Assets:** 5000+ sprites
**Cost:** FREE!

---

## 📱 HOW TO INTEGRATE SPRITES INTO YOUR GAMES

### Step 1: Download Assets
1. Go to Kenney.nl
2. Download the packs mentioned above
3. Extract to your computer

### Step 2: Organize in Your Project
```
LearnITapp/assets/games/
├── goodvsbad/
│   ├── character.png (✅ Already have!)
│   ├── values/
│   │   ├── respect.png
│   │   ├── honesty.png
│   │   └── ... (download from Game Icons pack)
│   └── bad/
│       ├── lying.png
│       ├── anger.png
│       └── ...
│
├── pathrunner/
│   ├── character/
│   │   ├── idle.png
│   │   ├── run_1.png
│   │   ├── run_2.png
│   │   └── jump.png
│   ├── collectibles/
│   │   ├── star_blue.png
│   │   ├── star_gold.png
│   │   └── gem.png
│   ├── obstacles/
│   │   ├── rock.png
│   │   ├── spike.png
│   │   └── barrel.png
│   └── background/
│       ├── sky.png
│       └── clouds.png
│
└── emotionmatch/
    ├── emotions/
    │   ├── happy.png
    │   ├── sad.png
    │   └── ...
    └── ui/
        ├── card_bg.png
        └── button.png
```

### Step 3: Replace Code (Example for Values Path Runner)

**Current Code (Emojis):**
```tsx
<Text style={styles.valueEmoji}>{obj.emoji}</Text>
```

**New Code (Sprites):**
```tsx
<Image 
  source={require('../assets/games/pathrunner/collectibles/star_gold.png')}
  style={styles.valueSprite}
  resizeMode="contain"
/>
```

---

## 🌟 BONUS: 3D MODELS (OPTIONAL - FOR ADVANCED LOOK)

If you want 3D models for character or items:

### **Sketchfab.com**
🔗 https://sketchfab.com/
- Filter: "Free Download" + "CC BY" license
- Format: Download as GLB/GLTF
- Use in React Native: Need `expo-three` or `react-native-3d-model-view`

### **Recommended 3D Models:**
1. **Low-poly character** - Search "low poly character run"
2. **Simple icons** - Search "low poly game icons"

**Note:** 3D models require additional setup and may impact performance. Only use if you have time and experience with 3D in React Native.

---

## ⚡ QUICK START GUIDE

### If you only have 30 minutes:

1. **Download Kenney's "Platformer Pack Redux"**
   - https://kenney.nl/assets/platformer-pack-redux
   
2. **Download Kenney's "Game Icons"**
   - https://kenney.nl/assets/game-icons

3. **Extract and grab these specific files:**
   - `alienGreen.png` or `alienPink.png` → Runner character
   - `star.png` → Good values (rename and recolor in Canva)
   - `spikes.png`, `rock.png` → Obstacles
   - `heart.png`, `trophy.png` → UI elements

4. **Put them in `assets/games/` folder**

5. **Replace emoji lines with Image components** (I can help with this!)

---

## 🎯 MY RECOMMENDATION FOR YOUR THESIS

**Priority Order:**

1. ✅ **Keep Good vs Bad Catch as is** (your character.png works!)
2. 🎯 **Improve Values Path Runner** (most impactful for panelists)
   - Download Platformer Pack Redux
   - Replace emojis with sprite images
   - Add simple background
3. 💭 **Add emotion face sprites to Emotion Match**
   - Download Emote Pack
   - Replace text emotions with cute icons
4. 🎴 **Memory Match & Word Scramble are fine!**

**Time Estimate:** 2-3 hours to integrate sprites properly

---

## 📧 QUICK HELP

**If you want me to:**
1. Show you exactly which files to download
2. Help integrate specific sprites
3. Create the Image component code for you

Just tell me which game you want to improve first! 🚀

**Recommended Start:** Values Path Runner (most visible improvement)
