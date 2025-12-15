/**
 * Card Component (Molecule)
 *
 * Container card with subtle elevation
 */

import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors, spacing } from "../../theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export default function Card({
  children,
  elevated = false,
  style,
  ...props
}: CardProps) {
  return (
    <View style={[styles.base, elevated && styles.elevated, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
