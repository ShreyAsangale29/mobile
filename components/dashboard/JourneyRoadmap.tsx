// components/dashboard/JourneyRoadmap.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const levels = ["Beginner", "Consistent", "Warrior", "Elite", "Legend"];

export default function JourneyRoadmap() {
  const currentLevel = "Warrior";
  const currentIndex = levels.indexOf(currentLevel);

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Text style={styles.titleIcon}>🛤</Text>
        <Text style={styles.title}>Your Journey</Text>
      </View>

      {levels.map((level, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "idle";

        return (
          <View key={level}>
            <View style={styles.row}>
              {state === "done" ? (
                <LinearGradient colors={["#7D53FF", "#38BDF8"]} style={styles.dot}>
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </LinearGradient>
              ) : state === "active" ? (
                <LinearGradient colors={["#34D399", "#7D53FF"]} style={styles.dot} />
              ) : (
                <View style={[styles.dot, styles.dotIdle]} />
              )}

              <Text style={[styles.label, state !== "idle" && styles.labelActive]}>{level}</Text>
            </View>

            {index !== levels.length - 1 && (
              <View style={[styles.line, index < currentIndex && styles.lineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(18,13,38,0.55)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  titleIcon: {
    fontSize: 18,
  },

  title: {
    color: "#F8F7FF",
    fontSize: 18,
    fontWeight: "800",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  dotIdle: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.25)",
  },

  line: {
    width: 2,
    height: 30,
    backgroundColor: "rgba(139,92,246,0.18)",
    marginLeft: 10,
    marginVertical: 4,
  },

  lineDone: {
    backgroundColor: "#7D53FF",
  },

  label: {
    color: "#6B6490",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 13,
  },

  labelActive: {
    color: "#F8F7FF",
    fontWeight: "800",
  },
});