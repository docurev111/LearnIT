# Loading Screen Component

## Overview
A beautiful loading screen with an animated mascot that cycles between two images and displays a loading bar GIF. Perfect for showing during app initialization, data fetching, or transitions.

## Features
- 🎭 **Mascot Animation**: Smoothly cycles between two mascot images with fade effect
- 📊 **Loading Bar**: Animated GIF loading indicator
- 🎨 **Purple Gradient Background**: Matches the reference design (#6C63FF)
- 📱 **Responsive**: Scales properly on all screen sizes
- ⚡ **Smooth Transitions**: Uses React Native's Animated API

## Usage

### Basic Usage

```typescript
import LoadingScreen from '../components/LoadingScreen';

function MyScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading ? (
        <LoadingScreen visible={isLoading} />
      ) : (
        <YourMainContent />
      )}
    </>
  );
}
```

### With Data Fetching

```typescript
import LoadingScreen from '../components/LoadingScreen';

function MyScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch your data
    fetchData().then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen visible={true} />;
  }

  return <YourMainContent />;
}
```

### In App Initialization (index.tsx)

```typescript
import LoadingScreen from '../components/LoadingScreen';

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts, assets, etc.
        await Font.loadAsync({ ... });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return <LoadingScreen visible={true} />;
  }

  return <YourApp />;
}
```

### Full Screen Overlay

```typescript
import LoadingScreen from '../components/LoadingScreen';

function MyScreen() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <YourMainContent />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={StyleSheet.absoluteFillObject}>
          <LoadingScreen visible={isLoading} />
        </View>
      )}
    </View>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | `true` | Controls whether the loading screen is shown |

## Animation Details

### Mascot Animation
- **Duration**: 500ms per transition
- **Delay**: 500ms between transitions
- **Effect**: Smooth fade between mascotloading.png and mascotloading1.png
- **Loop**: Infinite loop

### Animation Sequence
1. Show mascot 1 (500ms)
2. Hold mascot 1 (500ms)
3. Fade to mascot 2 (500ms)
4. Hold mascot 2 (500ms)
5. Repeat

## Assets Required

Make sure you have these assets in your project:

```
assets/
  images/
    loading/
      mascotloading.png      # First mascot image
      mascotloading1.png     # Second mascot image
  gifs/
    loader.gif               # Loading bar animation
```

## Styling

The component uses responsive sizing:
- **Mascot**: 40% of screen width
- **Loader**: 60% of screen width, 60px height
- **Background**: #6C63FF (purple)

### Customizing Colors

To change the background color, modify the `container` style:

```typescript
container: {
  flex: 1,
  backgroundColor: '#YOUR_COLOR_HERE', // Change this
  justifyContent: 'center',
  alignItems: 'center',
},
```

### Customizing Sizes

To adjust mascot or loader sizes, modify these values:

```typescript
mascotContainer: {
  width: screenWidth * 0.5,  // Change from 0.4
  height: screenWidth * 0.5,
  // ...
},
loader: {
  width: screenWidth * 0.7,  // Change from 0.6
  height: 80,                // Change from 60
},
```

## Performance Notes

- Uses `useNativeDriver: true` for optimal performance
- Animations run on the native thread
- Minimal re-renders
- Efficient opacity interpolation

## Example Scenarios

### 1. Splash Screen
Show during app initialization while loading assets and data.

### 2. Screen Transitions
Display between major navigation changes.

### 3. Data Loading
Show while fetching data from API or database.

### 4. Processing
Display during computationally intensive operations.

### 5. File Upload
Show progress for file operations.

## Tips

1. **Minimum Display Time**: Consider showing the loading screen for at least 1 second to avoid flashing
2. **Error Handling**: Hide loading screen when errors occur
3. **User Feedback**: Combine with toast messages for better UX
4. **Testing**: Test on both iOS and Android for consistent appearance

## Troubleshooting

**Animation not working?**
- Ensure `useNativeDriver: true` is supported for your animation properties
- Check that assets are properly linked

**GIF not animating?**
- GIF support varies by platform
- Consider using Lottie animations for better cross-platform support

**Performance issues?**
- Reduce image sizes
- Optimize asset compression
- Use appropriate image formats

---

**Created**: October 7, 2025  
**Status**: ✅ Ready to use
