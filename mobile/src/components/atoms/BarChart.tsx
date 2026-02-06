/**
 * Custom Animated Bar Chart Component
 * Black & White Theme with smooth animations
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Text from "./Text";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";

interface BarData {
  label: string;
  value: number;
  highlighted?: boolean;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  width?: number;
  showValues?: boolean;
  showGrid?: boolean;
  maxValue?: number;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function BarChart({
  data,
  height = 200,
  width = 340,
  showValues = true,
  showGrid = true,
  maxValue,
}: BarChartProps) {
  const animations = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Stagger the bar animations
    const animationSequence = data.map((_, index) =>
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 600,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );

    Animated.parallel(animationSequence).start();
  }, [data]);

  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const barWidth = (width - 60) / data.length;
  const chartHeight = height - 40;
  const padding = { top: 10, bottom: 30, left: 40, right: 20 };

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {showGrid &&
          [0, 0.25, 0.5, 0.75, 1].map((percent, i) => (
            <Line
              key={`grid-${i}`}
              x1={padding.left}
              y1={padding.top + chartHeight * percent}
              x2={width - padding.right}
              y2={padding.top + chartHeight * percent}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
          const value = Math.round(max * (1 - percent));
          return (
            <SvgText
              key={`ylabel-${i}`}
              x={padding.left - 8}
              y={padding.top + chartHeight * percent + 4}
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              textAnchor="end"
            >
              {value}h
            </SvgText>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / max) * chartHeight;
          const x = padding.left + index * barWidth + barWidth * 0.15;
          const y = padding.top + chartHeight - barHeight;
          const barActualWidth = barWidth * 0.7;

          return (
            <React.Fragment key={`bar-${index}`}>
              <AnimatedRect
                x={x}
                y={animations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [padding.top + chartHeight, y],
                })}
                width={barActualWidth}
                height={animations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, barHeight],
                })}
                fill={item.highlighted ? "#FFFFFF" : "rgba(255,255,255,0.3)"}
                rx={3}
              />

              {/* X-axis labels */}
              <SvgText
                x={x + barActualWidth / 2}
                y={height - padding.bottom + 18}
                fill={item.highlighted ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
                fontSize="11"
                fontWeight={item.highlighted ? "bold" : "normal"}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>

              {/* Value labels on top of bars */}
              {showValues && item.value > 0 && (
                <SvgText
                  x={x + barActualWidth / 2}
                  y={y - 5}
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {item.value.toFixed(1)}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
