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
import { colors } from "../theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  // Use dynamic system insets from native WindowInsets API
  const { insets, navBarHeight, isNavBarVisible, isKeyboardVisible } =
    useSystemInsets();

  // Calculate tab bar dimensions with safe defaults
  const TAB_BAR_BASE_HEIGHT = 60;

  // Ensure navBarHeight is a valid number
  const safeNavBarHeight =
    typeof navBarHeight === "number" && !isNaN(navBarHeight) ? navBarHeight : 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: isKeyboardVisible
          ? { display: "none" }
          : {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0, 0, 0, 0.98)",
              borderTopColor: "rgba(255, 255, 255, 0.1)",
              borderTopWidth: 1,
              height: TAB_BAR_BASE_HEIGHT + safeNavBarHeight,
              paddingBottom: safeNavBarHeight,
              paddingTop: 8,
              elevation: 0,
              shadowOpacity: 0,
            },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "400",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeShell}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkbox" : "checkbox-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusTimerScreen}
        options={{
          tabBarLabel: "Focus",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "timer" : "timer-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: "Stats",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        cardStyle: { backgroundColor: "#000000" },
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
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
      <Stack.Screen name="FrictionOverlay" component={FrictionOverlay} />
    </Stack.Navigator>
  );
}
