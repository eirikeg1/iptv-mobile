# Development Build Instructions

Your IPTV playlist uses HTTP (not HTTPS), which requires native configuration changes. Expo Go doesn't support custom native configurations, so you need to create a development build.

## Quick Setup

### 1. Install Development Client
```bash
npx expo install expo-dev-client
```

### 2. Build for Android
```bash
npx expo run:android
```

This will:
- Build a custom version of your app with HTTP support enabled
- Install it on your connected Android device or emulator
- Start the development server

**Note**: First build takes ~5-10 minutes. Subsequent builds are faster.

### 3. Build for iOS (Mac only)
```bash
npx expo run:ios
```

## What This Enables

The development build includes the configuration from `app.json`:
- **Android**: `usesCleartextTraffic: true` - Allows HTTP requests
- **iOS**: `NSAllowsArbitraryLoads: true` - Allows HTTP requests

## After Building

Once the app is installed, it works just like Expo Go but with your custom configuration:
- ✅ HTTP playlist URLs will work
- ✅ Hot reloading still works
- ✅ All Expo features still work
- ✅ You can develop normally

## Troubleshooting

### "No Android device connected"
- Connect your Android phone via USB with USB debugging enabled
- OR start Android emulator: `npx expo run:android` will prompt to start one

### "Build failed"
- Make sure you have Android Studio installed (for Android)
- Make sure you have Xcode installed (for iOS on Mac)
- Clear cache: `npx expo start --clear`

## Production Build (Later)

When ready for production:
```bash
eas build --platform android
eas build --platform ios
```

Or use the standalone build:
```bash
npx expo build:android
npx expo build:ios
```
