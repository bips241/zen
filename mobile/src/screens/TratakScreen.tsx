import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Spacer, Flame } from "../components/atoms";
import { colors, spacing } from "../theme";
import { useNavigation } from "@react-navigation/native";

export default function TratakScreen() {
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (running) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer as any);
    };
  }, [running]);

  const toggle = () => setRunning((r) => !r);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text variant="body" color={colors.accent}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <Text variant="large" style={styles.title}>
          Tratak — Candle Focus
        </Text>
        <Spacer size="md" />
        <View style={styles.flameWrap}>
          <Flame size={200} running={running} />
        </View>

        <Spacer size="lg" />
        <Text variant="body" color={colors.gray[400]}>
          Gaze softly at the flame. Blink naturally.
        </Text>
        <Spacer size="sm" />
        <Text variant="subheading" color={colors.accent}>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </Text>

        <Spacer size="xl" />
        <TouchableOpacity style={styles.button} onPress={toggle}>
          <Text variant="bodyBold" color={colors.black}>
            {running ? "Pause" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 22,
    color: colors.white,
    fontWeight: "300",
  },
  flameWrap: {
    marginTop: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
});
