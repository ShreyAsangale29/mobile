import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function StatsGrid() {
  const stats = [
    {
      icon: "🔁",
      value: "25",
      label: "REPS",
      color: "#8B5CF6",
    },
    {
      icon: "⏱",
      value: "12:35",
      label: "DURATION",
      color: "#38BDF8",
    },
    {
      icon: "🔥",
      value: "112",
      label: "CALORIES",
      color: "#F97316",
    },
    {
      icon: "🧘",
      value: "94%",
      label: "POSTURE",
      color: "#10B981",
    },
    {
      icon: "❌",
      value: "2",
      label: "ERRORS",
      color: "#EC4899",
    },
    {
      icon: "⚡",
      value: "12",
      label: "STREAK",
      color: "#FFD700",
    },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((item, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              borderLeftColor: item.color,
            },
          ]}
        >
          <Text style={styles.icon}>
            {item.icon}
          </Text>

          <Text style={styles.value}>
            {item.value}
          </Text>

          <Text style={styles.label}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  card: {
    width: "31%",
    backgroundColor:
      "rgba(18,13,38,0.85)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
  },

  icon: {
    fontSize: 14,
    marginBottom: 4,
  },

  value: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
  },

  label: {
    color: "#8A84AD",
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.5,
  },
});