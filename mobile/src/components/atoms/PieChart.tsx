/**
 * Animated Pie/Donut Chart Component
 * For category breakdown visualization
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Text from './Text';
import Svg, { G, Path } from 'react-native-svg';

interface PieData {
  label: string;
  value: number;
  percentage: number;
}

interface PieChartProps {
  data: PieData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function PieChart({
  data,
  size = 180,
  innerRadius = 0.5,
  showLegend = true,
}: PieChartProps) {
  const animations = useRef(
    data.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animationSequence = data.map((_, index) =>
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 800,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      })
    );

    Animated.parallel(animationSequence).start();
  }, [data]);

  const radius = size / 2;
  const innerR = radius * innerRadius;
  let currentAngle = -90; // Start from top

  const createArc = (
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number
  ): string => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = radius + outerRadius * Math.cos(startRad);
    const y1 = radius + outerRadius * Math.sin(startRad);
    const x2 = radius + outerRadius * Math.cos(endRad);
    const y2 = radius + outerRadius * Math.sin(endRad);

    const x3 = radius + innerRadius * Math.cos(endRad);
    const y3 = radius + innerRadius * Math.sin(endRad);
    const x4 = radius + innerRadius * Math.cos(startRad);
    const y4 = radius + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  // Shades of white for different segments
  const getShade = (index: number, total: number): string => {
    const intensity = 1 - (index / total) * 0.5; // 1.0 to 0.5
    return `rgba(255, 255, 255, ${intensity})`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G>
            {data.map((item, index) => {
              const angle = (item.percentage / 100) * 360;
              const endAngle = currentAngle + angle;
              const path = createArc(currentAngle, endAngle, radius, innerR);
              
              const animatedPath = animations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [
                  createArc(currentAngle, currentAngle, radius, innerR),
                  path,
                ],
              });

              currentAngle = endAngle;

              return (
                <AnimatedPath
                  key={index}
                  d={animatedPath}
                  fill={getShade(index, data.length)}
                  stroke="#000000"
                  strokeWidth={2}
                />
              );
            })}
          </G>
        </Svg>
        
        {/* Center label */}
        <View style={styles.centerLabel}>
          <Text style={styles.centerTitle}>Total</Text>
          <Text style={styles.centerValue}>
            {data.reduce((sum, item) => sum + item.value, 0).toFixed(0)}h
          </Text>
        </View>
      </View>

      {showLegend && (
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: getShade(index, data.length) },
                ]}
              />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>
                {item.value.toFixed(1)}h ({item.percentage.toFixed(0)}%)
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerTitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  centerValue: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
    marginTop: 4,
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  legendValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
