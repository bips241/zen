/**
 * App Root Component
 *
 * Main entry point with navigation and database initialization
 */

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, View, ActivityIndicator, StyleSheet } from "react-native";
import RootNavigator from "./navigation/RootNavigator";
import { colors } from "./theme";
import { database } from "./database";
import { Text } from "./components";
import { useFonts } from "expo-font";
import { ZenDots_400Regular } from "@expo-google-fonts/zen-dots";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Zen Dots font
  const [fontsLoaded] = useFonts({
    "ZenDots-Regular": ZenDots_400Regular,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Database is already initialized when imported
      console.log("[App] Database initialized");

      // Small delay to ensure everything is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsReady(true);
    } catch (err) {
      console.error("[App] Initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize app");
    }
  };

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.black,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.black,
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: "center",
  },
});
