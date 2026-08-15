import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Text } from "../components/atoms";

// Create animated version of custom Text for animated usage
const AnimatedText = Animated.createAnimatedComponent(Text);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  iconName: string;
  iconFamily: "material" | "ionicons";
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    iconName: "target",
    iconFamily: "material",
    title: "Focus on What Matters",
    description:
      "Eliminate distractions and boost your productivity with a minimalist launcher",
  },
  {
    iconName: "timer-outline",
    iconFamily: "ionicons",
    title: "Track Your Time",
    description:
      "Monitor your productivity and build better habits with intelligent tracking",
  },
  {
    iconName: "trending-up",
    iconFamily: "material",
    title: "Achieve Your Goals",
    description:
      "Stay motivated with insights and statistics about your progress",
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 200,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentSlide(currentSlide + 1);
        fadeAnim.setValue(0);
        slideAnim.setValue(0);
        scaleAnim.setValue(0);
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    // Persist onboarding complete flag so it won't show again
    try {
      await AsyncStorage.setItem("@zen_onboarding_complete", "true");
    } catch (e) {
      // Non-fatal: app still works without this
      console.warn("[Onboarding] Could not persist completion flag:", e);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" as never }],
    });
  };

  const slideTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <Animated.View style={[styles.skipContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.slideContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideTranslateX }],
            },
          ]}
        >
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {currentSlideData.iconFamily === "material" ? (
              <MaterialCommunityIcons
                name={currentSlideData.iconName as any}
                size={64}
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name={currentSlideData.iconName as any}
                size={64}
                color="#FFFFFF"
              />
            )}
          </Animated.View>

          {/* Title */}
          <AnimatedText
            style={[
              styles.title,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {currentSlideData.title}
          </AnimatedText>

          {/* Description */}
          <AnimatedText
            style={[
              styles.description,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {currentSlideData.description}
          </AnimatedText>
        </Animated.View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                fadeAnim.setValue(0);
                slideAnim.setValue(0);
                scaleAnim.setValue(0);
                setCurrentSlide(index);
              }}
              style={styles.dotButton}
            >
              <View
                style={[styles.dot, index === currentSlide && styles.activeDot]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.9}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
          </Text>
          <Text style={styles.nextButtonIcon}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  skipContainer: {
    alignItems: "flex-end",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slideContainer: {
    alignItems: "center",
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    maxWidth: 400,
    lineHeight: 24,
  },
  bottomNav: {
    gap: 32,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dotButton: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    width: "100%",
    maxWidth: 400,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
  },
  nextButtonIcon: {
    fontSize: 24,
    color: "#000000",
    marginTop: -2,
  },
});
