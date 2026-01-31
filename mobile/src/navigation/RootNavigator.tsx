/**
 * Root Navigator
 *
 * Main navigation structure with bottom tabs and stack screens
 * Uses dynamic WindowInsets monitoring for proper system bar handling
 */

import React from "react";
import { Animated, Easing } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSystemInsets } from "../hooks/useSystemInsets";
import HomeShell from "../screens/HomeShell";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import AppDrawerScreen from "../screens/appDrawer/AppDrawerScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TratakScreen from "../screens/TratakScreen";
import PomodoroScreen from "../screens/PomodoroScreen";
import StatsScreen from "../screens/StatsScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import FocusTimerScreen from "../screens/FocusTimerScreen";
import EisenhowerMatrixScreen from "../screens/EisenhowerMatrixScreen";
import AppBlockerScreen from "../screens/AppBlockerScreen";
import DNDSettingsScreen from "../screens/DNDSettingsScreen";
import BackupRestoreScreen from "../screens/BackupRestoreScreen";
import FocusHistoryScreen from "../screens/FocusHistoryScreen";
import TasksScreen from "../screens/TasksScreen";
import ForestFocusScreen from "../screens/ForestFocusScreen";
import DeepWorkScreen from "../screens/DeepWorkScreen";
import FrictionSettings from "../screens/FrictionSettings";
import AppSelectionScreen from "../screens/AppSelectionScreen";
import FrictionOverlay from "../screens/FrictionOverlay";
import AmbientMusicScreen from "../screens/AmbientMusicScreen";
import ThemeStoreScreen from "../screens/ThemeStoreScreen";
import { colors } from "../theme";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        cardStyle: { backgroundColor: "#000000" },
      }}
    >
      <Stack.Screen name="Home" component={HomeShell} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="AppDrawer" component={AppDrawerScreen} />
      <Stack.Screen name="Tratak" component={TratakScreen} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} />
      <Stack.Screen
        name="EisenhowerMatrix"
        component={EisenhowerMatrixScreen}
      />
      <Stack.Screen name="AppBlocker" component={AppBlockerScreen} />
      <Stack.Screen name="DNDSettings" component={DNDSettingsScreen} />
      <Stack.Screen name="BackupRestore" component={BackupRestoreScreen} />
      <Stack.Screen name="FocusHistory" component={FocusHistoryScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="ForestFocus" component={ForestFocusScreen} />
      <Stack.Screen name="DeepWork" component={DeepWorkScreen} />
      <Stack.Screen name="FrictionSettings" component={FrictionSettings} />
      <Stack.Screen name="AppSelection" component={AppSelectionScreen} />
      <Stack.Screen name="AmbientMusic" component={AmbientMusicScreen} />
      <Stack.Screen name="ThemeStore" component={ThemeStoreScreen} />
      <Stack.Screen name="FrictionOverlay" component={FrictionOverlay} />
    </Stack.Navigator>
  );
}
