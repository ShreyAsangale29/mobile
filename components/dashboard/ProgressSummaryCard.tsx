// components/dashboard/ProgressSummaryCard.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ProgressSummaryCard() {
  return (
    <View style={styles.card}>
      {/* Streak */}
      <View style={styles.sideSection}>
        <Text style={styles.icon}>🔥</Text>
        <Text style={styles.value}>14/20</Text>
        <Text style={styles.label}>Streak</Text>
      </View>

      {/* Level */}
      <View style={styles.centerSection}>
        <LinearGradient
          colors={["#34D399", "#7D53FF", "#EC4899"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelRing}
        >
          <View style={styles.levelInner}>
            <Text style={styles.levelNumber}>7</Text>
          </View>
        </LinearGradient>

        <Text style={styles.levelText}>Warrior</Text>
      </View>

      {/* Badges */}
      <View style={styles.sideSection}>
        <Text style={styles.icon}>🏅</Text>
        <Text style={styles.value}>12</Text>
        <Text style={styles.label}>Badges</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    backgroundColor: "rgba(26,20,51,0.6)",
    borderRadius: 22,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.22)",
  },

  sideSection: {
    alignItems: "center",
  },

  icon: {
    fontSize: 24,
  },

  value: {
    color: "#F8F7FF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 6,
  },

  label: {
    color: "#6B6490",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },

  centerSection: {
    alignItems: "center",
  },

  levelRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7D53FF",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  levelInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#151029",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  levelNumber: {
    color: "#F8F7FF",
    fontSize: 26,
    fontWeight: "800",
  },

  levelText: {
    color: "#F8F7FF",
    marginTop: 9,
    fontSize: 13,
    fontWeight: "700",
  },
});