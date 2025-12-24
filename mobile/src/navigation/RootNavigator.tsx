/**
 * Root Navigator
 *
 * Main navigation structure with bottom tabs and stack screens
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
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
import { colors } from "../theme";
import { Text } from "../components/atoms";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          shadowColor: "#FFFFFF",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "400",
        },
      }}
    >
      <Tab.Screen
        name="Apps"
        component={HomeShell}
        options={{
          tabBarLabel: "Apps",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "📱" : "📲"}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "✅" : "☑️"}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusTimerScreen}
        options={{
          tabBarLabel: "Focus",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "⏱️" : "⏲️"}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: "Stats",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "📊" : "�"}
            </Text>
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
    </Stack.Navigator>
  );
}
