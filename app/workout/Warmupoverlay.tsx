import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import type { WarmupMove } from "./warmupMoves";

type Props = {
  move: WarmupMove | null;
  moveIndex: number;
  totalMoves: number;
  count: number;
  target: number;
  feedback?: string[];
  score?: number;
  onSkipMove: () => void;
  onSkipAll: () => void;
};

// Purely informational now — name, instruction, live count, progress dots.
// The actual moving figure is the persistent corner avatar
// (CameraAvatarPreview), which stays on screen through warm-up, the
// exercise/pose itself, and rest, instead of a separate big avatar here.
export default function WarmupOverlay({
  move,
  moveIndex,
  totalMoves,
  count,
  target,
  feedback = [],
  score = 0,
  onSkipMove,
  onSkipAll,
}: Props) {
  if (!move) return null;

  const progress = target > 0 ? Math.min(1, count / target) : 0;
  const displayCount = move.kind === "reps" ? Math.min(count, target) : Math.max(target - count, 0);
  const unit = move.kind === "reps" ? `/ ${target} reps` : "s left";

  const hasScore = score > 0;
  const hasFeedback = feedback.length > 0;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={35} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>WARM-UP · Check the corner avatar</Text>
        <Text style={styles.moveLabel}>{move.label}</Text>
        <Text style={styles.instruction}>{move.instruction}</Text>

        {/* Real-time score indicator */}
        {hasScore && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>MATCH SCORE</Text>
            <Text style={styles.scoreValue}>{score}%</Text>
          </View>
        )}

        <View style={styles.counterRow}>
          <Text style={styles.counterValue}>{displayCount}</Text>
          <Text style={styles.counterUnit}>{unit}</Text>
        </View>

        {/* Real-time coach feedback box */}
        {hasFeedback ? (
          <View style={styles.feedbackCard}>
            <Ionicons name="bulb-outline" size={16} color="#A78BFA" />
            <Text style={styles.feedbackText}>{feedback[0]}</Text>
          </View>
        ) : hasScore ? (
          <View style={[styles.feedbackCard, { backgroundColor: "rgba(52, 211, 153, 0.1)", borderColor: "rgba(52, 211, 153, 0.2)" }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#34D399" />
            <Text style={[styles.feedbackText, { color: "#34D399" }]}>Form is perfect! Keep it up.</Text>
          </View>
        ) : null}

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <View style={styles.dots}>
          {Array.from({ length: totalMoves }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === moveIndex && styles.dotActive, i < moveIndex && styles.dotDone]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.skipButton} onPress={onSkipMove}>
            <Ionicons name="play-skip-forward-outline" size={16} color="#D1D5DB" />
            <Text style={styles.skipText}>Skip Move</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onSkipAll}>
            <Ionicons name="play-forward-outline" size={16} color="#D1D5DB" />
            <Text style={styles.skipText}>Skip Warm-up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // Deliberately not full-height — leaves the bottom of the screen
    // (and the corner avatar) uncovered so the person can see it acting
    // out the move while reading the instruction up here.
    height: "62%",
    zIndex: 40,
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
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  moveLabel: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  instruction: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 18,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  scoreLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scoreValue: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "800",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 16,
    gap: 6,
  },
  counterValue: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },
  counterUnit: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    maxWidth: "90%",
  },
  feedbackText: {
    color: "#E9D5FF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  track: {
    width: 180,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 12,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#A78BFA",
    borderRadius: 3,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    backgroundColor: "#A78BFA",
    width: 20,
  },
  dotDone: {
    backgroundColor: "#8B5CF6",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skipText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
  },
});