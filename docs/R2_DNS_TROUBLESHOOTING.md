# R2 DNS Troubleshooting Guide 🔧

## Problem: "Unable to resolve host" Error

```
ERROR ❌ Download failed: [Error: Unable to resolve host
"pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev":
No address associated with hostname]
```

## Root Cause Analysis

This DNS resolution error occurs when the Android device cannot translate the R2 domain name into an IP address. Common causes:

### 1. **DNS Propagation Delay** ⏰

- New R2 custom domains take 24-48 hours to propagate globally
- DNS records may not be available in all regions yet
- **Solution**: Wait 24-48 hours and try again

### 2. **R2 Bucket Not Public** 🔒

- Bucket public access is disabled
- Custom domain not properly configured
- **Solution**: Check Cloudflare R2 dashboard settings

### 3. **Network/DNS Issues** 🌐

- Device DNS cache outdated
- ISP blocking Cloudflare R2 domains
- Corporate/school network restrictions
- **Solution**: Try different network or VPN

### 4. **Android DNS Cache** 📱

- Device caches DNS lookups
- Old cache entries causing failures
- **Solution**: Restart device or change network

## Quick Fixes (Try in Order)

### Fix 1: Verify R2 Bucket is Public

1. Go to Cloudflare Dashboard → R2
2. Select your bucket: `zen-ambient-audio`
3. Go to **Settings** → **Public Access**
4. Ensure **Allow public access** is ENABLED
5. Copy the public URL and test in browser

### Fix 2: Test URL in Browser

Open this URL in your phone browser:

```
https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev/dark-atmosphere-with-rain-352570.mp3
```

**Expected**: Audio file downloads or plays  
**If fails**: R2 bucket is not public or domain misconfigured

### Fix 3: Check R2 Custom Domain Setup

1. Cloudflare Dashboard → R2 → Your Bucket
2. Settings → **Custom Domains**
3. Verify domain is listed and status is **Active**
4. Wait 10-15 minutes after adding domain

### Fix 4: Use Alternative DNS

**Android Settings:**

1. Settings → Network & Internet → WiFi
2. Long press your WiFi network → Modify
3. Advanced Options → IP Settings → Static
4. Set DNS 1: `1.1.1.1` (Cloudflare)
5. Set DNS 2: `8.8.8.8` (Google)
6. Save and reconnect

### Fix 5: Clear DNS Cache (Android)

```bash
# Via ADB (if available)
adb shell settings put global private_dns_mode off
adb shell settings put global private_dns_mode opportunistic

# Or restart device
```

### Fix 6: Test with VPN

1. Install free VPN (ProtonVPN, Cloudflare WARP)
2. Connect to different region
3. Try loading audio again
4. If works → ISP/network blocking issue

## Permanent Solutions

### Option A: Use Cloudflare R2 with Proper Setup

**Correct R2 Configuration:**

1. **Enable Public Access**:

   ```
   Bucket Settings → Public Access → Enabled
   ```

2. **Verify CORS** (if using web):

   ```json
   {
     "AllowedOrigins": ["*"],
     "AllowedMethods": ["GET", "HEAD"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3600
   }
   ```

3. **Test Domain Resolution**:

   ```bash
   # From your computer
   nslookup pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev

   # Should return an IP address
   ```

### Option B: Use Custom Domain (Recommended)

Instead of `pub-xxx.r2.dev`, use your own domain:

1. **Add Custom Domain in R2**:
   - Domain: `audio.yourapp.com`
   - Cloudflare will provide DNS records

2. **Add DNS Records**:

   ```
   Type: CNAME
   Name: audio
   Content: pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev
   ```

3. **Update Code**:
   ```typescript
   // audioCacheService.ts
   const R2_CDN_BASE = "https://audio.yourapp.com";
   ```

### Option C: Use Alternative CDN

If R2 DNS continues to fail, consider:

- **AWS S3** with CloudFront
- **Google Cloud Storage**
- **Azure Blob Storage**
- **Supabase Storage** (has built-in CDN)

## Implementation: Network Diagnostics

We've added automatic network diagnostics to help troubleshoot:

### New Files Added:

1. **`/services/networkDiagnostics.ts`**
   - Tests internet connectivity
   - Checks R2 DNS resolution
   - Verifies file accessibility
   - Provides actionable recommendations

2. **Updated `/services/audioCacheService.ts`**
   - Added retry logic (3 attempts)
   - Exponential backoff delays
   - Better error messages
   - DNS-specific error detection

3. **Updated `/screens/AmbientMusicScreen.tsx`**
   - Runs diagnostics on error
   - Shows specific error messages
   - Guides user to solutions

### How It Works:

```typescript
// When download fails, diagnostics run automatically
const diagnostics = await runNetworkDiagnostics();

if (!diagnostics.internetOk) {
  // Show "No internet" message
} else if (!diagnostics.r2DnsOk) {
  // Show DNS troubleshooting steps
} else {
  // Show other recommendations
}
```

## Testing the Fix

### Manual Test Commands:

```bash
# 1. Test from development machine
curl -I https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev/dark-atmosphere-with-rain-352570.mp3

# Should return: HTTP/2 200

# 2. Test DNS resolution
dig pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev

# Should return IP addresses

# 3. Test from Android (via ADB)
adb shell "curl -I https://pub-6e3f78ce1d3d41e19bfe47edbf286e12.r2.dev/dark-atmosphere-with-rain-352570.mp3"
```

### In-App Testing:

1. Open Zen Mobile app
2. Navigate to Ambient Music screen
3. Try to play any track
4. If error occurs, check console logs for diagnostics output
5. Follow error message recommendations

## Expected Behavior After Fix

✅ **Success Case:**

```
LOG  🎵 Loading track: rainfall
LOG  📂 Local URI: file:///...
LOG  ✅ Loaded track: rainfall
```

✅ **Cached File Case:**

```
LOG  🎵 Loading track: rainfall
LOG  ✅ Using cached: rainfall
LOG  ✅ Loaded track: rainfall
```

❌ **Failure with Diagnostics:**

```
LOG  🎵 Loading track: rainfall
LOG  ⬇️ Downloading: rainfall (Attempt 1/3)
ERROR ❌ Download attempt 1 failed: DNS error
LOG  Retrying in 1000ms...
LOG  ⬇️ Downloading: rainfall (Attempt 2/3)
...
```

## Still Not Working?

### Contact Information:

1. **Check Cloudflare Status**: https://www.cloudflarestatus.com/
2. **R2 Documentation**: https://developers.cloudflare.com/r2/
3. **GitHub Issues**: [Your repo issues page]

### Temporary Workaround:

While fixing DNS, you can:

1. Download audio files manually
2. Place in app's local storage
3. Update `audioCacheService.ts` to use local files only
4. Disable download functionality

### Debug Checklist:

- [ ] R2 bucket is public
- [ ] Domain resolves on desktop browser
- [ ] Audio file plays in mobile browser
- [ ] Android network security config allows cleartext
- [ ] Device has internet connection
- [ ] Not on restrictive network (school/corporate)
- [ ] Tried different WiFi network
- [ ] Tried mobile data instead of WiFi
- [ ] DNS cache cleared (device restart)
- [ ] Waited 24-48 hours since domain setup

## Summary

The DNS issue is likely due to R2 bucket configuration or DNS propagation. The fixes implemented:

1. ✅ Retry logic with exponential backoff
2. ✅ Automatic network diagnostics
3. ✅ User-friendly error messages
4. ✅ Detailed troubleshooting guide

Next steps:

1. Verify R2 bucket public access
2. Test domain in browser
3. Wait for DNS propagation if recently configured
4. Try alternative network/DNS settings
