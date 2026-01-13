# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# WatermelonDB
-keep class com.nozbe.watermelondb.** { *; }
-dontwarn com.nozbe.watermelondb.**
-keep class net.sqlcipher.** { *; }
-dontwarn net.sqlcipher.**
-keep class net.sqlcipher.database.** { *; }

# JSI
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# SQLite
-keep class org.sqlite.** { *; }
-keep class org.sqlite.database.** { *; }

# Add any project specific keep options here:
