import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors } from "../../theme";

interface FlameProps {
  size?: number;
  running?: boolean;
}

export default function Flame({ size = 120, running = true }: FlameProps) {
  const flicker = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running) return;

    const flickerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 1.1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.8,
          duration: 180,
          useNativeDriver: true,
        }),
      ])
    );

    const swayAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: -6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    flickerAnim.start();
    swayAnim.start();

    return () => {
      flickerAnim.stop();
      swayAnim.stop();
    };
  }, [flicker, sway, running]);

  const scale = flicker.interpolate({
    inputRange: [0.6, 1.1],
    outputRange: [0.9, 1.1],
  });
  const opacity = flicker.interpolate({
    inputRange: [0.6, 1.1],
    outputRange: [0.7, 1],
  });

  const translateX = sway.interpolate({
    inputRange: [-6, 6],
    outputRange: [-2, 2],
  });

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  } as const;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.flameLayer,
          baseStyle,
          {
            backgroundColor: "#FFCF66",
            transform: [{ scale }, { translateX }],
            opacity,
            top: size * 0.15,
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: (size * 0.6) / 2,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.flameLayer,
          baseStyle,
          {
            backgroundColor: "#FFA24D",
            transform: [
              { scale: Animated.multiply(scale, 0.9) },
              { translateX },
            ],
            opacity: Animated.multiply(opacity, 0.95),
            top: size * 0.08,
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: (size * 0.4) / 2,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.flameLayer,
          baseStyle,
          {
            backgroundColor: "#FF6B6B",
            transform: [
              { scale: Animated.multiply(scale, 0.8) },
              { translateX },
            ],
            opacity: Animated.multiply(opacity, 0.9),
            top: 0,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: (size * 0.25) / 2,
          },
        ]}
      />

      {/* subtle glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: (size * 1.6) / 2,
            opacity: opacity.interpolate({
              inputRange: [0.6, 1.1],
              outputRange: [0.06, 0.15],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  flameLayer: {
    position: "absolute",
    alignSelf: "center",
    shadowColor: "#FF7A59",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  glow: {
    position: "absolute",
    bottom: -20,
    backgroundColor: "#FFB76B",
    opacity: 0.1,
  },
});
