import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const BlurView: React.ComponentType<any> = View as any; // Fallback for unused component
import { useSystemInsets } from "@/hooks/useSystemInsets";
import FocusTimerScreen from "@/screens/FocusTimerScreen";
import HomeShell from "@/screens/HomeShell";
import StatsScreen from "@/screens/StatsScreen";
import TasksScreen from "@/screens/TasksScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  // Use dynamic system insets from native WindowInsets API
  const { insets, navBarHeight, isNavBarVisible, isKeyboardVisible } =
    useSystemInsets();

  // State to handle delayed visibility
  const [shouldShowTabBar, setShouldShowTabBar] = useState(true);

  // Handle delayed show when system navbar hides
  useEffect(() => {
    if (isNavBarVisible) {
      // Hide immediately when system navbar shows
      setShouldShowTabBar(false);
    } else {
      // Show with 100ms delay when system navbar hides
      const timer = setTimeout(() => {
        setShouldShowTabBar(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isNavBarVisible]);

  // Calculate tab bar dimensions with safe defaults
  const TAB_BAR_BASE_HEIGHT = 60;

  // Use full insets for comprehensive positioning
  const safeNavBarBottom = navBarHeight || 0;
  const safeNavBarTop = insets.navBarTop || 0;
  const safeNavBarLeft = insets.navBarLeft || 0;
  const safeNavBarRight = insets.navBarRight || 0;

  // Calculate total height (base height + system navbar space)
  const totalHeight = TAB_BAR_BASE_HEIGHT + safeNavBarBottom;

  console.log("[TabNavigator] Insets:", {
    bottom: safeNavBarBottom,
    height: navBarHeight,
    top: safeNavBarTop,
    left: safeNavBarLeft,
    right: safeNavBarRight,
    totalHeight,
    visible: isNavBarVisible,
    shouldShow: shouldShowTabBar,
    keyboard: isKeyboardVisible,
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle:
          isKeyboardVisible || !shouldShowTabBar
            ? { display: "none" }
            : {
                position: "absolute",
                bottom: 0,
                left: safeNavBarLeft,
                right: safeNavBarRight,
                backgroundColor: "transparent",
                borderTopColor: "transparent",
                borderTopWidth: 0,
                height: totalHeight,
                paddingBottom: safeNavBarBottom,
                paddingLeft: safeNavBarLeft,
                paddingRight: safeNavBarRight,
                paddingTop: 8,
                elevation: 0,
                zIndex: 1000,
              },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          />
        ),
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
