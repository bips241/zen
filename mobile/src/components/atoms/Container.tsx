/**
 * Container Component (Atom)
 *
 * Base container with consistent padding and background
 */

import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors, spacing, SpacingKey } from "../../theme";

interface ContainerProps extends ViewProps {
  padding?: SpacingKey;
  backgroundColor?: string;
  centered?: boolean;
  children: React.ReactNode;
}

export default function Container({
  padding = "md",
  backgroundColor = colors.black,
  centered = false,
  style,
  children,
  ...props
}: ContainerProps) {
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding], backgroundColor },
        centered && styles.centered,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
