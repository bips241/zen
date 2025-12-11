/**
 * ProgressBar Component (Molecule)
 * 
 * Linear progress indicator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  height = 6,
  color = colors.accent,
  backgroundColor = colors.gray[800],
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
