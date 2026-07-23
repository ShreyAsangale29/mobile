import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface SummaryBackgroundProps {
  children: React.ReactNode;
}

export default function SummaryBackground({
  children,
}: SummaryBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#060412", "#0A071A", "#13102A"]}
        style={StyleSheet.absoluteFill}
      />

      <BlurView
        intensity={80}
        style={styles.auroraPurple}
      />

      <BlurView
        intensity={80}
        style={styles.auroraPink}
      />

      <BlurView
        intensity={80}
        style={styles.auroraGreen}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  auroraPurple: {
    position: "absolute",
    top: 70,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(139,92,246,0.18)",
  },

  auroraPink: {
    position: "absolute",
    top: 300,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(236,72,153,0.14)",
  },

  auroraGreen: {
    position: "absolute",
    top: 600,
    left: 30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(16,185,129,0.12)",
  },
});