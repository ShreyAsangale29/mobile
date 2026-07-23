import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function JourneyBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          "#070412",
          "#0B081A",
          "#120D26",
          "#0B081A",
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Purple Glow */}
      <View style={styles.purpleGlow} />

      {/* Green Glow */}
      <View style={styles.greenGlow} />

      {/* Gold Glow */}
      <View style={styles.goldGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  purpleGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#8B5CF6",
    opacity: 0.12,
    top: -40,
    right: -50,
  },

  greenGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#10B981",
    opacity: 0.08,
    bottom: 120,
    left: -60,
  },

  goldGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFD700",
    opacity: 0.06,
    top: 280,
    right: -30,
  },
});