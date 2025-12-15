/**
 * StatCard Component (Molecule)
 *
 * Display stat with label and value
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../atoms";
import { colors, spacing } from "../../theme";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  color = colors.accent,
}: StatCardProps) {
  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.gray[500]} style={styles.label}>
        {label}
      </Text>
      <Text variant="title" color={color} style={styles.value}>
        {value}
      </Text>
      {subtitle && (
        <Text variant="small" color={colors.gray[400]} style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
    minWidth: 100,
  },
  label: {
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  value: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
