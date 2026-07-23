import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function StreakRewards() {
  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        🔥 Daily Login Streak
      </Text>

      <View style={styles.row}>
        {days.map((day) => (
          <View
            key={day}
            style={[
              styles.day,
              day <= 6 && styles.activeDay,
            ]}
          >
            <Text style={styles.dayText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.info}>
        Current Streak: 6 Days
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(18,13,38,0.85)",
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A1F4A",
    justifyContent: "center",
    alignItems: "center",
  },

  activeDay: {
    backgroundColor: "#10B981",
  },

  dayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  info: {
    color: "#B59BFF",
    marginTop: 12,
  },
});