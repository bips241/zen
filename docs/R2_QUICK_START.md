# 🚀 Quick Start: R2 Audio Setup

## What We Built

✅ **Secure Audio Streaming** with obfuscated filenames  
✅ **Rate Limiting** (10 requests/min per track)  
✅ **Audio Player** with volume, pause, stop controls  
✅ **Background Playback** support

---

## 📤 Upload Your Audio Files

### Step 1: Prepare Audio Files

You need 8 audio files:

- `rainfall.mp3`
- `ocean_waves.mp3`
- `forest.mp3`
- `thunder.mp3`
- `white_noise.mp3`
- `brown_noise.mp3`
- `campfire.mp3`
- `cafe.mp3`

### Step 2: Generate Obfuscated Names

```bash
cd mobile/scripts
node r2-upload-helper.js
```

This will output:

1. **Rename commands** - Copy/paste to rename files
2. **Upload commands** - Wrangler CLI commands for R2
3. **New AUDIO_MAP** - Update in `audioService.ts`

### Step 3: Upload to R2

Option A: **Using Wrangler CLI**

```bash
npx wrangler r2 object put sounds/<obfuscated-name>.mp3 --file=<original-name>.mp3
```

Option B: **Using Cloudflare Dashboard**

1. Go to [Cloudflare R2](https://dash.cloudflare.com/?to=/:account/r2)
2. Open your bucket
3. Click "Upload" and select renamed files

### Step 4: Update AUDIO_MAP

Open `/mobile/src/services/audioService.ts` and update:

```typescript
const AUDIO_MAP: Record<string, string> = {
  rainfall: "a1f8e9c2d4b6h8j3k5l7m9n0p2q4r6s8.mp3",
  ocean_waves: "b2g9f0d3c5e7h1i4j6k8l0m2n4p6q8r0.mp3",
  // ... use output from r2-upload-helper.js
};
```

### Step 5: Test

1. Open Ambient Music screen in app
2. Tap a track
3. Should start playing audio

---

## 🧪 Testing Checklist

- [ ] All 8 audio files uploaded to R2
- [ ] AUDIO_MAP updated with correct filenames
- [ ] Test playback in app
- [ ] Test rate limiting (play same track 11 times quickly)
- [ ] Test volume control
- [ ] Test pause/resume
- [ ] Test stop button
- [ ] Check background playback works

---

## 🔐 Security Notes

1. **Never commit R2 URLs** to git (use environment variables in production)
2. **Obfuscated names ≠ encryption** (good enough for productivity app audio)
3. **Rate limiting is in-memory** (resets on app restart)
4. **Best for**: Non-sensitive audio, ambient sounds, white noise
5. **NOT for**: Premium content, copyrighted music

---

## 💰 Cost Estimate

**R2 Free Tier:**

- Storage: 10 GB/month
- Class B operations (GET): 10M/month

**Your Usage:**

- 8 tracks × 5 MB = 40 MB storage ✅
- 1000 users × 10 plays/day = 300K requests/month ✅

**Result: FREE** 🎉

Only pay if you exceed limits:

- Storage: $0.015/GB/month
- Egress: FREE (via Cloudflare CDN)

---

## 📁 Files Reference

### Created Files

- `/mobile/src/services/audioService.ts` - Audio streaming service
- `/mobile/scripts/r2-upload-helper.js` - Upload script generator
- `/docs/R2_AUDIO_SETUP.md` - Full documentation

### Modified Files

- `/mobile/src/screens/AmbientMusicScreen.tsx` - Now uses audioService

---

## 🎵 Usage Example

```typescript
import { audioPlayer } from "../services/audioService";

// Load and play
await audioPlayer.loadTrack("rainfall");
await audioPlayer.play();

// Control
await audioPlayer.pause();
await audioPlayer.setVolume(70); // 0-100
await audioPlayer.stop();

// Check status
const currentTrack = audioPlayer.getCurrentTrack();
const isPlaying = audioPlayer.isPlaying();
```

---

## 🐛 Troubleshooting

### Audio doesn't play

1. Check Metro bundler logs for errors
2. Verify R2 URL is correct in `audioService.ts`
3. Test URL directly in browser
4. Check expo-av permissions

### Rate limit triggered too early

- Increase limit in `audioService.ts`:
  ```typescript
  const limit = 20; // Was 10
  ```

### Files not loading

1. Verify obfuscated filenames match AUDIO_MAP
2. Check R2 bucket is public (or has correct CORS)
3. Test URLs in browser first

---

## 🚀 Next Steps

1. **Upload audio files** using the helper script
2. **Test in app** - try all 8 tracks
3. **Monitor R2 usage** in Cloudflare dashboard
4. **Consider environment variables** for production

---

**Need Help?** Check `/docs/R2_AUDIO_SETUP.md` for detailed setup.
