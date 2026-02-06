/**
 * Custom Heatmap Chart for Hourly Usage Patterns
 * 24-hour grid with intensity-based visualization
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Text from "./Text";

interface HeatmapData {
  hour: number;
  minutes: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  width?: number;
}

export default function HeatmapChart({ data, width = 340 }: HeatmapChartProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [data]);

  // Create 24-hour grid (6 columns x 4 rows)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const cellSize = (width - 32) / 6;
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  const getIntensity = (minutes: number): number => {
    if (minutes === 0) return 0.05;
    return 0.2 + (minutes / maxMinutes) * 0.8;
  };

  const getMinutesForHour = (hour: number): number => {
    const item = data.find((d) => d.hour === hour);
    return item ? item.minutes : 0;
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12a";
    if (hour < 12) return `${hour}a`;
    if (hour === 12) return "12p";
    return `${hour - 12}p`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.grid}>
        {hours.map((hour) => {
          const minutes = getMinutesForHour(hour);
          const intensity = getIntensity(minutes);
          const row = Math.floor(hour / 6);
          const col = hour % 6;

          return (
            <View
              key={hour}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: `rgba(255, 255, 255, ${intensity})`,
                },
              ]}
            >
              <Text
                style={[
                  styles.hourLabel,
                  intensity > 0.5 && styles.hourLabelDark,
                ]}
              >
                {formatHour(hour)}
              </Text>
              {minutes > 0 && (
                <Text
                  style={[
                    styles.minuteLabel,
                    intensity > 0.5 && styles.minuteLabelDark,
                  ]}
                >
                  {Math.round(minutes)}m
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={styles.legendBar}>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, i) => (
            <View
              key={i}
              style={[
                styles.legendCell,
                { backgroundColor: `rgba(255, 255, 255, ${intensity})` },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendText}>More</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  cell: {
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  hourLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 2,
  },
  hourLabelDark: {
    color: "#000000",
  },
  minuteLabel: {
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
  minuteLabelDark: {
    color: "rgba(0, 0, 0, 0.7)",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  legendText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  legendBar: {
    flexDirection: "row",
    gap: 3,
  },
  legendCell: {
    width: 20,
    height: 12,
    borderRadius: 2,
  },
});
