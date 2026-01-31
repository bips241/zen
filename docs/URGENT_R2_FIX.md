# 🚨 IMMEDIATE ACTION REQUIRED - R2 DNS Issue

## The Problem

Your R2 bucket domain **cannot be resolved** by the Android device:

```
pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev → DNS FAILURE
```

## Quick Test (Do This First) ⚡

**On your phone, open Chrome and visit:**

```
https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev/dark-atmosphere-with-rain-352570.mp3
```

### Possible Results:

✅ **Audio plays/downloads** → Problem is app-specific (network config issue)  
❌ **Page doesn't load** → R2 bucket not public or DNS not configured  
⏳ **Timeout/loading forever** → DNS propagation in progress

---

## Solution 1: Make R2 Bucket Public (5 minutes)

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. Click **R2** in the left sidebar
3. Find your bucket (likely named `zen-ambient-audio` or similar)
4. Click on the bucket name
5. Go to **Settings** tab
6. Under **Public Access** section:
   - Toggle **Allow public access** to **ON**
   - Click **Save**
7. Copy the **Public Bucket URL** shown
8. Test the URL in your browser immediately

**Expected URL format:**

```
https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev
```

---

## Solution 2: Verify DNS Propagation (if recently set up)

**If you just created the R2 bucket today:**

- DNS propagation takes **24-48 hours** globally
- May work in some regions, fail in others
- **Action**: Wait 24-48 hours, then test again

**Check DNS propagation status:**

```bash
# On your computer, run:
nslookup pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev

# Should return IP addresses like:
# Address: 104.21.xxx.xxx
```

---

## Solution 3: Try Different Network

**Test on:**

- Different WiFi network
- Mobile data instead of WiFi
- Public WiFi (coffee shop, library)
- VPN connection

**If works on different network** → Your main network/ISP blocks R2 domains

---

## What We've Already Fixed ✅

1. **Added retry logic** - App now tries 3 times before giving up
2. **Better error messages** - Shows DNS-specific troubleshooting
3. **Network diagnostics** - Automatically tests connectivity
4. **Exponential backoff** - Waits between retries (1s, 2s, 4s)

---

## Next Steps (In Order)

### Step 1: Verify R2 Bucket Public Access

- [ ] Log into Cloudflare Dashboard
- [ ] Check R2 bucket exists
- [ ] Enable Public Access
- [ ] Test URL in browser

### Step 2: Test URL Manually

- [ ] Open URL in phone Chrome browser
- [ ] If works → Rebuild app and test again
- [ ] If fails → Check Step 1 again

### Step 3: Update App & Test

```bash
cd /Users/biplabmal/Documents/projects/zen/mobile
npx expo start --clear
```

- [ ] Rebuild app completely
- [ ] Test ambient music feature
- [ ] Check console logs for detailed errors

### Step 4: If Still Failing

- [ ] Try different network/WiFi
- [ ] Wait 24 hours (if new domain)
- [ ] Check [R2_DNS_TROUBLESHOOTING.md](./R2_DNS_TROUBLESHOOTING.md)

---

## Expected Behavior After Fix

### Success:

```
LOG  🎵 Loading track: rainfall
LOG  ⬇️ Downloading: rainfall (Attempt 1/3)
LOG  From: https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev/...
LOG  ✅ Downloaded: rainfall
LOG  📂 Local URI: file:///...
LOG  ✅ Loaded track: rainfall
```

### Failure (with diagnostics):

```
ERROR ❌ Download attempt 1 failed
⚠️ DNS Resolution Error:
- R2 domain cannot be resolved
- This might be a DNS propagation issue
- Or network/firewall blocking the domain
LOG  Retrying in 1000ms...
```

---

## Critical Files Changed

1. **`audioCacheService.ts`** - Added retry logic + DNS error handling
2. **`networkDiagnostics.ts`** - NEW - Tests connectivity
3. **`AmbientMusicScreen.tsx`** - Shows diagnostic results to user
4. **`R2_DNS_TROUBLESHOOTING.md`** - Complete troubleshooting guide

---

## Contact/Help

**If none of the above works:**

1. Share your Cloudflare R2 bucket settings screenshot
2. Share the exact error from app console
3. Confirm: Can you access the URL in mobile browser?
4. Try: Download a sample file and check if it's valid MP3

**Alternative Quick Fix:**

If urgent, temporarily host audio files on:

- Supabase Storage (free tier)
- Firebase Storage
- GitHub releases
- Any public CDN

Update `R2_CDN_BASE` in `audioCacheService.ts` to new URL.

---

## Summary

**Most likely cause**: R2 bucket public access not enabled  
**Quick fix time**: 5 minutes  
**Max wait time**: 48 hours (DNS propagation)

**Do this NOW**: Check Cloudflare R2 bucket public access setting!
