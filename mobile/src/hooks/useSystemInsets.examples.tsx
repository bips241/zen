/**
 * useSystemInsets Hook - Usage Examples
 *
 * Demonstrates how to use the dynamic system insets hook
 * in various scenarios for proper layout adaptation.
 *
 * NOTE: This is a documentation file with example code snippets.
 * It is NOT meant to be compiled or imported.
 * @ts-nocheck
 */

/* eslint-disable */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useSystemInsets } from "../hooks/useSystemInsets";

// ============================================================================
// Example 1: Bottom Navigation Bar
// ============================================================================

function BottomNavigation() {
  const { navBarHeight, isKeyboardVisible } = useSystemInsets();

  const NAV_HEIGHT = 60;
  const totalHeight = NAV_HEIGHT + navBarHeight;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: totalHeight,
        paddingBottom: navBarHeight,
        backgroundColor: "#000",
        display: isKeyboardVisible ? "none" : "flex",
      }}
    >
      {/* Navigation content */}
    </View>
  );
}

// ============================================================================
// Example 2: Floating Action Button
// ============================================================================

function FloatingActionButton() {
  const { navBarHeight } = useSystemInsets();

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        right: 16,
        bottom: navBarHeight + 16, // 16px above nav bar
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#00FF88",
      }}
    >
      <Icon name="add" size={24} color="#000" />
    </TouchableOpacity>
  );
}

// Placeholder Icon component for example
const Icon = ({ name, size, color }: any) => null;

// ============================================================================
// Example 3: Bottom Sheet / Modal
// ============================================================================

function BottomSheet() {
  const { insets, navBarHeight } = useSystemInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: navBarHeight, // Respect safe area
      }}
    >
      <View style={{ padding: 16 }}>{/* Sheet content */}</View>
    </View>
  );
}

// ============================================================================
// Example 4: Full Screen Content with Fixed Footer
// ============================================================================

function FullScreenWithFooter() {
  const { navBarHeight, insets } = useSystemInsets();

  const statusBarHeight = insets.statusBarTop;
  const FOOTER_HEIGHT = 80;

  return (
    <View style={{ flex: 1 }}>
      {/* Content area */}
      <View
        style={{
          flex: 1,
          paddingTop: statusBarHeight,
          paddingBottom: FOOTER_HEIGHT + navBarHeight,
        }}
      >
        {/* Scrollable content */}
      </View>

      {/* Fixed footer */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: FOOTER_HEIGHT + navBarHeight,
          paddingBottom: navBarHeight,
          backgroundColor: "#000",
        }}
      >
        {/* Footer content */}
      </View>
    </View>
  );
}

// ============================================================================
// Example 5: Adaptive Layout Based on Navigation Type
// ============================================================================

function AdaptiveLayout() {
  const { isGestureNav, navBarHeight } = useSystemInsets();

  return (
    <View style={{ flex: 1 }}>
      <Text>
        {isGestureNav
          ? "Gesture navigation detected (0px)"
          : `Button navigation detected (${navBarHeight}px)`}
      </Text>

      {/* Adjust spacing based on nav type */}
      <View
        style={{
          marginBottom: isGestureNav ? 16 : 24,
        }}
      >
        {/* Content that needs different spacing */}
      </View>
    </View>
  );
}

// ============================================================================
// Example 6: Conditional Rendering Based on Keyboard
// ============================================================================

function FormWithKeyboard() {
  const { isKeyboardVisible, insets } = useSystemInsets();

  return (
    <View style={{ flex: 1 }}>
      <TextInput placeholder="Name" />
      <TextInput placeholder="Email" />

      {/* Hide extra UI when keyboard is visible */}
      {!isKeyboardVisible && (
        <View style={{ marginTop: 16 }}>
          <Text>Additional info...</Text>
        </View>
      )}

      {/* Submit button with proper spacing */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: insets.keyboardHeight || insets.navBarBottom,
          left: 16,
          right: 16,
          height: 48,
          backgroundColor: "#00FF88",
        }}
      >
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Example 7: Manual Refresh on Demand
// ============================================================================

function ManualRefreshExample() {
  const { insets, refresh } = useSystemInsets();

  const handleRefresh = async () => {
    await refresh();
    console.log("Insets refreshed:", insets);
  };

  return (
    <View>
      <Text>Monitoring: Active</Text>
      <Text>Nav Bar: {insets.navBarBottom}px</Text>

      <TouchableOpacity onPress={handleRefresh}>
        <Text>Refresh Insets</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Example 8: Debugging System UI
// ============================================================================

function SystemUIDebugger() {
  const { insets } = useSystemInsets();

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        System UI Debug Info
      </Text>

      <Text>Monitoring: ✓ Active</Text>
      <Text>Nav Bar Bottom: {insets.navBarBottom}px</Text>
      <Text>Nav Bar Visible: {insets.navBarVisible ? "Yes" : "No"}</Text>
      <Text>Status Bar Top: {insets.statusBarTop}px</Text>
      <Text>Keyboard Height: {insets.keyboardHeight}px</Text>
      <Text>Keyboard Visible: {insets.keyboardVisible ? "Yes" : "No"}</Text>
      <Text>System Bars Bottom: {insets.systemBarsBottom}px</Text>

      {insets.navBarBottom === 0 && (
        <Text style={{ color: "#00FF88", marginTop: 8 }}>
          ✓ Gesture Navigation Detected
        </Text>
      )}

      {insets.navBarBottom > 0 && (
        <Text style={{ color: "#FFAA00", marginTop: 8 }}>
          ⚠ Button Navigation Detected ({insets.navBarBottom}px)
        </Text>
      )}
    </ScrollView>
  );
}

// ============================================================================
// Best Practices
// ============================================================================

/**
 * 1. Always add padding/margin to avoid overlap:
 *    - Bottom elements: bottom = basePosition + navBarHeight
 *    - Top elements: top = basePosition + statusBarTop
 *
 * 2. Hide non-essential UI when keyboard is visible:
 *    - Use isKeyboardVisible to toggle visibility
 *    - Set display: 'none' for better performance
 *
 * 3. Test on multiple devices:
 *    - Gesture navigation (Pixel 4+, modern phones)
 *    - 3-button navigation (older devices)
 *    - Different screen sizes
 *
 * 4. Use for absolute/fixed positioned elements:
 *    - Bottom sheets
 *    - FABs
 *    - Navigation bars
 *    - Modal footers
 *
 * 5. Log changes during development:
 *    useEffect(() => {
 *      console.log('System UI changed:', insets);
 *    }, [insets]);
 *
 * 6. Handle loading state:
 *    - Initial values are 0
 *    - Wait for first update before rendering
 *    - Or use fallback values (8px default padding)
 */
