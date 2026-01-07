# 🚀 Zen Mobile - Complete Setup Guide

**A step-by-step guide for absolute beginners**

---

## ✅ Prerequisites (Install These First)

### 1. Install Node.js (v18 or newer)

- **Download**: https://nodejs.org
- **Choose**: LTS version (recommended)
- **Verify installation**: Open terminal and run:
  ```bash
  node --version
  npm --version
  ```
  ✅ Should show version numbers like `v18.x.x` and `9.x.x`

### 2. Install Git

- **Download**: https://git-scm.com/downloads
- **Verify**:
  ```bash
  git --version
  ```

### 3. Install Android Studio

- **Download**: https://developer.android.com/studio
- **During installation**, make sure to install:
  - ✅ Android SDK
  - ✅ Android SDK Platform
  - ✅ Android Virtual Device (AVD)

#### Configure Android Studio:

1. Open Android Studio
2. Go to: **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Install SDK Platform 33 (Android 13/Tiramisu)
4. Go to **SDK Tools** tab and install:
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools

#### Set Environment Variables:

**For macOS/Linux**, add to `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**For Windows**, add to System Environment Variables:

- `ANDROID_HOME` = `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`

**Reload terminal** after adding environment variables:

```bash
source ~/.zshrc  # or source ~/.bash_profile
```

**Verify**:

```bash
adb --version
```

### 4. Install Java Development Kit (JDK 17)

- **Download**: https://adoptium.net/ (Temurin JDK 17)
- **Verify**:
  ```bash
  java --version
  ```

---

## 📦 Project Setup

### Step 1: Clone the Repository

```bash
cd ~/Documents/projects
git clone <your-repo-url> zen
cd zen
```

### Step 2: Install Dependencies

```bash
cd mobile
npm install
```

⏱️ This will take 2-5 minutes

### Step 3: Prebuild Native Projects (First Time Only)

```bash
npx expo prebuild
```

⏱️ This generates the native Android/iOS folders

**Note**: This project uses Expo with custom native code (dev client), so prebuild is required before running on devices.

---

## 🏃 Running the App

### Option 1: Run on Android Emulator (Recommended for Beginners)

#### Create an Android Virtual Device (AVD):

1. Open Android Studio
2. Click **Device Manager** (phone icon on right sidebar)
3. Click **Create Device**
4. Select: **Pixel 5** or any phone
5. Select System Image: **Android 13 (API 33)**
6. Click **Finish**

#### Start the App:

```bash
cd mobile
npx expo run:android
```

This builds and runs the app directly on the Android emulator.

### Option 2: Run on Physical Android Phone

#### Enable Developer Mode on Your Phone:

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Connect phone to computer with USB cable
6. Allow USB debugging when prompted on phone

#### Check Device Connection:

```bash
adb devices
```

✅ Should show your device ID

#### Run the App:

```bash
cd mobile
npx expo run:android
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "ANDROID_HOME not found"

**Solution**:

- Verify environment variables are set correctly
- Restart terminal/computer after setting variables
- Run: `echo $ANDROID_HOME` to check

### Issue 2: "Unable to connect to Metro"

**Solution**:

```bash
# Kill any running Metro processes and restart
npm start
```

### Issue 3: "Build failed" or "Gradle error"

**Solution**:

```bash
cd mobile/android
./gradlew clean
cd ..
npx expo run:android
```

### Issue 4: "No devices found"

**Solution**:

- Check emulator is running
- Or check phone is connected: `adb devices`
- Restart adb:
  ```bash
  adb kill-server
  adb start-server
  ```

### Issue 5: Metro bundler port already in use

**Solution**:

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9  # macOS/Linux
# or on Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Then restart
npm start
```

---

## 📱 Testing the App

Once the app launches:

1. ✅ You should see the Zen Mobile home screen
2. ✅ Try navigating through the app
3. ✅ Test the focus timer feature

---

## 🛠️ Development Commands

```bash
# Run on Android (builds and launches app)
npx expo run:android

# Run on iOS (macOS only)
npx expo run:ios

# Start development server only (if app already installed)
npx expo start --dev-client

# Start with LAN access
npx expo start --lan

# Start with tunnel (for remote testing)
npx expo start --tunnel

# Run tests
npm test

# Check for linting issues
npm run lint

# Build for production (requires EAS account)
npm run build:android
```

---

## 📚 Project Structure

```
mobile/
├── src/
│   ├── screens/        # All app screens
│   ├── components/     # Reusable UI components
│   ├── services/       # Business logic
│   ├── store/          # State management
│   ├── native-android/ # Android native modules
│   └── database/       # Local database
├── android/            # Android native code
├── package.json        # Dependencies
└── app.json           # Expo configuration
```

---

## 🎯 Next Steps

1. ✅ Read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines
2. ✅ Check [TODO_PLAN.md](TODO_PLAN.md) for project roadmap
3. ✅ Read [COPILOT_GUIDE.md](COPILOT_GUIDE.md) for AI assistance rules
4. ✅ Join our community (if available)

---

## 💡 Tips for Beginners

1. **Always work in the `mobile/` directory** when running commands
2. **Keep Android Studio open** when developing (for emulator)
3. **Use `npm start` first** to see the Metro bundler, then press `a` for Android
4. **Check the terminal** for error messages - they're usually helpful
5. **Restart everything** if stuck: close emulator, kill Metro, clear cache
6. **Ask for help** in GitHub issues if you're stuck

---

## 🆘 Getting Help

- **GitHub Issues**: Open an issue with detailed error messages
- **Terminal Logs**: Always include terminal output when asking for help
- **Screenshot**: Take screenshots of errors

---

## ✨ You're Ready!

If you successfully see the Zen Mobile app running, congratulations! 🎉

You can now start exploring the code and contributing to the project.

**Happy Coding! 🚀**
