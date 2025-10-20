# Testing the Playlist Feature

## Test URLs

Use these FREE public IPTV playlists for testing:

### Option 1: Small Test Playlist (Recommended for testing)
```
Name: IPTV Test
URL: https://iptv-org.github.io/iptv/countries/us.m3u
Authentication: No
```

### Option 2: Full Global Playlist
```
Name: IPTV Global
URL: https://iptv-org.github.io/iptv/index.m3u
Authentication: No
```

### Option 3: Specific Country (Example: UK)
```
Name: UK Channels
URL: https://iptv-org.github.io/iptv/countries/uk.m3u
Authentication: No
```

## Steps to Test

1. **Open the App**
   - Navigate to the Settings tab
   - You should see "IPTV Playlists" section

2. **Add a Playlist**
   - Click the "Add" button
   - Fill in the form:
     - Name: `IPTV Test`
     - URL: `https://iptv-org.github.io/iptv/countries/us.m3u`
     - Leave "Requires Authentication" OFF
   - Click "Add Playlist"

3. **Check Console for Logs**
   - Open the Metro bundler console or React Native debugger
   - Look for logs starting with `[PlaylistForm]`, `[PlaylistStore]`, `[PlaylistManager]`
   - These will show you exactly what's happening

4. **Expected Result**
   - Loading indicator should appear briefly
   - Form should close
   - Playlist count should change from "0 playlists" to "1 playlist"
   - The new playlist should appear in the list

## Debugging

### If the form closes but playlist doesn't appear:

Check the console logs for errors:
- `[PlaylistForm] Starting playlist addition:` - Form started
- `[PlaylistStore] addPlaylist called with:` - Store received request
- `[PlaylistStore] Fetching and parsing playlist...` - Fetching started
- `[PlaylistStore] Playlist fetched and parsed, channels:` - Should show channel count
- `[PlaylistStore] State updated, final playlists count:` - Should be 1 or more
- `[PlaylistManager] Render - playlists count:` - Manager should re-render with new count

### Common Issues:

1. **Network Error**
   - Make sure you have internet connection
   - Try a different URL
   - Check if your network blocks the URL

2. **CORS Error (Web only)**
   - CORS issues only occur when running on web
   - Try on a mobile device or emulator instead
   - Or use a CORS proxy

3. **Invalid URL**
   - Make sure the URL starts with `http://` or `https://`
   - URL must point to an actual M3U file

4. **State Not Updating**
   - Check if console shows "State updated, final playlists count: 1"
   - If yes but UI doesn't update, it's a render issue
   - If no, there's an error in the state update logic

## What to Report

If it still doesn't work, please share:
1. All console logs from `[PlaylistForm]`, `[PlaylistStore]`, and `[PlaylistManager]`
2. Any error messages (red text in console)
3. Platform you're testing on (iOS, Android, Web)
4. The exact URL you're trying to use

This will help identify where the issue is occurring.
