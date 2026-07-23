import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BadgeCard() {
  return (
    <LinearGradient
      colors={[
        "rgba(22,14,50,0.95)",
        "rgba(10,7,24,0.95)",
      ]}
      style={styles.card}
    >
      <View style={styles.newBadge}>
        <Text style={styles.newText}>
          NEW
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          🏆
        </Text>
      </View>

      <Text style={styles.title}>
        Perfect Squat
      </Text>

      <Text style={styles.subtitle}>
        Badge
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      "rgba(139,92,246,0.25)",
    position: "relative",
  },

  newBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  newText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#000",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor:
      "rgba(139,92,246,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  icon: {
    fontSize: 24,
  },

  title: {
    color: "#B59BFF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#8A84AD",
    fontSize: 10,
  },
});