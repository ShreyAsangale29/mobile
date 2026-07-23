import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function XPCard() {
  return (
    <LinearGradient
      colors={[
        "rgba(22,14,50,0.95)",
        "rgba(10,7,24,0.95)",
      ]}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.label}>
          YOU EARNED
        </Text>

        <Text style={styles.star}>
          ⭐
        </Text>
      </View>

      <Text style={styles.xpValue}>
        +120 XP
      </Text>

      <View style={styles.progressBg}>
        <View
          style={styles.progressFill}
        />
      </View>

      <Text style={styles.progressText}>
        850 / 1000
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor:
      "rgba(255,215,0,0.25)",
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#8A84AD",
    fontSize: 10,
    fontWeight: "700",
  },

  star: {
    fontSize: 16,
  },

  xpValue: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },

  progressBg: {
    height: 6,
    backgroundColor:
      "rgba(255,215,0,0.15)",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    width: "85%",
    height: "100%",
    backgroundColor: "#FFD700",
  },

  progressText: {
    color: "#8A84AD",
    fontSize: 10,
    marginTop: 6,
  },
});