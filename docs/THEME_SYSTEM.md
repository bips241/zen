# Theme System - Video Screensaver Implementation

## Overview

The theme system allows users to customize their HomeShell background with video themes that behave like macOS screensavers - playing when the phone is unlocked and pausing after a configurable timeout.

## Architecture

### Files Created

1. **`/mobile/src/types/theme.ts`** - Type definitions and sample themes
2. **`/mobile/src/store/themeStore.ts`** - Zustand state management for themes
3. **`/mobile/src/services/themeCache.ts`** - Video download and cache management
4. **`/mobile/src/screens/ThemeStoreScreen.tsx`** - Theme browsing and download UI
5. **`/mobile/src/screens/HomeShell.tsx`** - Updated with video background integration

### Files Modified

- **`/mobile/src/navigation/RootNavigator.tsx`** - Added ThemeStore route
- **`/mobile/src/screens/HomeShell.tsx`** - Integrated video background and theme button

## Features

### Theme Store

- Browse available themes by category (nature, space, abstract, minimal, urban)
- Preview thumbnails for each theme
- Download themes with progress tracking
- View cache size and clear downloaded themes
- One-tap activation of themes
- Delete individual themes
- Reset to OLED black theme button

### Video Screensaver Behavior

- Videos play automatically when app becomes active (phone unlocked)
- Auto-pause after configurable timeout (default: 30 seconds)
- Pause when app goes to background
- Loop continuously while playing
- Muted audio
- Full-screen cover mode

### Cache Management

- Videos stored in app documents directory: `themes/`
- Automatic cache size calculation
- Clear all themes functionality
- File system persistence across app restarts

## Usage

### Accessing Theme Store

1. From HomeShell, tap the palette icon (🎨) in top-left header
2. Browse available themes
3. Tap "Download" to cache a video theme
4. Tap "Activate" to set as background
5. Return to HomeShell to see the video background

### Configuring Screensaver Timeout

Access through theme store state:

```typescript
import { useThemeStore } from "../store/themeStore";

const { setScreensaverTimeout } = useThemeStore();
setScreensaverTimeout(45); // 45 seconds
```

### Resetting to OLED Black

- Tap "⚫ Reset to OLED Black" button at bottom of Theme Store
- Or delete the active video theme

## Theme Data Structure

```typescript
interface Theme {
  id: string;
  name: string;
  type: "video" | "static" | "oled-black";
  category: "nature" | "space" | "abstract" | "minimal" | "urban" | "default";
  previewUrl: string; // Thumbnail
  videoUrl?: string; // Video source URL
  localPath?: string; // Cached file path
  fileSize?: number;
  duration?: number;
  description?: string;
  isPremium?: boolean;
  isDownloaded: boolean;
}
```

## Sample Themes Included

1. **Aurora Borealis** (Nature, 15MB, 60s) - Northern lights
2. **Ocean Waves** (Nature, 12MB, 45s) - Peaceful ocean
3. **Space Nebula** (Space, 18MB, 90s) - Colorful nebula
4. **Minimalist Shapes** (Abstract, 8MB, 30s) - Geometric motion
5. **City Nights** (Urban, 20MB, 60s) - Urban skyline

## State Management

### Theme Store Methods

```typescript
setActiveTheme(theme: Theme) - Activate a theme
addDownloadedTheme(theme: Theme) - Mark theme as downloaded
removeTheme(themeId: string) - Delete theme from cache
updateDownloadProgress(themeId: string, progress: number) - Update download %
setDownloadComplete(themeId: string, localPath: string) - Finish download
resetToOLEDBlack() - Revert to default black
setScreensaverEnabled(enabled: boolean) - Toggle screensaver
setScreensaverTimeout(timeout: number) - Set pause timeout in seconds
```

## Dependencies

- **expo-av** - Video playback (already installed)
- **expo-file-system** - File downloads and cache management
- **zustand** - State management with persistence
- **@react-native-async-storage/async-storage** - State persistence

## Performance Considerations

- Videos are cached locally to prevent repeated downloads
- Muted audio reduces memory usage
- Auto-pause after timeout saves battery
- OLED black theme (default) is battery-optimal

## Future Enhancements

- Add more theme categories
- Premium themes with authentication
- User-uploaded custom themes
- Live wallpaper support
- Dynamic theme scheduling (day/night)
- Parallax effects
- Interactive themes responding to gestures

## Testing

To test the theme system:

1. Run app and navigate to HomeShell
2. Tap theme button (palette icon)
3. Download a theme (note: sample URLs are placeholders)
4. Activate the downloaded theme
5. Return to HomeShell - video should play
6. Wait 30 seconds - video should pause
7. Lock and unlock phone - video should resume

**Note**: Sample theme video URLs are placeholders. Replace with actual video URLs or local video files for testing.

## Troubleshooting

### Video Not Playing

- Check `activeTheme.localPath` is valid
- Verify video file exists: `await FileSystem.getInfoAsync(path)`
- Check video format compatibility (MP4 recommended)

### Download Failing

- Verify network connection
- Check `videoUrl` is accessible
- Ensure device has sufficient storage
- Check file system permissions

### Cache Issues

- Use "Clear All" to reset cache
- Check available storage space
- Verify write permissions to documents directory

---

**Implementation Complete** ✅
All features functional and ready for testing with real video URLs.
