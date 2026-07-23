import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  secondsLeft: number;
  totalSeconds: number;
  nextName: string;
  nextHowTo?: string;
  nextLabel?: string; // e.g. "NEXT EXERCISE" vs "NEXT POSE"
  onSkip: () => void;
};

export default function RestOverlay({
  secondsLeft,
  totalSeconds,
  nextName,
  nextHowTo,
  nextLabel = "NEXT UP",
  onSkip,
}: Props) {
  const progress = totalSeconds > 0 ? 1 - Math.max(secondsLeft, 0) / totalSeconds : 1;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={50} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>REST</Text>
        <Text style={styles.timer}>{Math.max(secondsLeft, 0)}s</Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>{nextLabel}</Text>
          <Text style={styles.nextName}>{nextName}</Text>
          {nextHowTo ? <Text style={styles.nextHowTo}>{nextHowTo}</Text> : null}
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Ionicons name="play-forward-outline" size={16} color="#D1D5DB" />
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  eyebrow: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  timer: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
    marginTop: 8,
  },
  track: {
    width: 180,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 14,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#A78BFA",
    borderRadius: 3,
  },
  nextCard: {
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    width: "100%",
    alignItems: "center",
  },
  nextLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  nextName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  nextHowTo: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 18,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skipText: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600",
  },
});