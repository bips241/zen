/**
 * Root Navigator
 *
 * Main navigation structure with bottom tabs
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeShell from "../screens/HomeShell";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import AppDrawerScreen from "../screens/appDrawer/AppDrawerScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TratakScreen from "../screens/TratakScreen";
import { colors } from "../theme";
import { Text } from "../components/atoms";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: colors.gray[900],
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeShell}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "🏠" : "🏚️"}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Apps"
        component={AppDrawerScreen}
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
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Stats",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "📊" : "📈"}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>
              {color === colors.accent ? "⚙️" : "🔧"}
            </Text>
          ),
        }}
      />
      {/* Hidden route for modal/immersive screens (navigable from Home) */}
      <Tab.Screen
        name="Tratak"
        component={TratakScreen}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
