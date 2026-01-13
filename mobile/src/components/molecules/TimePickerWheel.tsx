import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface TimePickerWheelProps {
  value: string | null;
  onChange: (time: string) => void;
}

export default function TimePickerWheel({
  value,
  onChange,
}: TimePickerWheelProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Parse existing value or use current time
  let hours = 0;
  let minutes = 0;

  if (value && typeof value === "string" && value.includes(":")) {
    const parts = value.split(":");
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const timeString = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
      onChange(timeString);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" ? (
        <DateTimePicker
          value={date}
          mode="time"
          display="spinner"
          onChange={handleChange}
          style={styles.iosPicker}
          textColor="#FFFFFF"
          themeVariant="dark"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.androidButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timeDisplay}>
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}
            </Text>
            <Text style={styles.buttonLabel}>Tap to change</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  iosPicker: {
    width: "100%",
    height: 200,
  },
  androidButton: {
    backgroundColor: "#111111",
    borderWidth: 2,
    borderColor: "#00FF88",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#00FF88",
    fontVariant: ["tabular-nums"],
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
