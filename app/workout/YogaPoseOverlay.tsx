import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import type { PoseResult } from "@/lib/pose-engine/pose-engine";

type Props = {
  poseLabel: string;
  sanskrit?: string;
  result: PoseResult | null;
  onSwitchCamera: () => void;
  // Session-wide clock, shown top bar. Runs continuously from mount to end.
  sessionDuration?: string;
  // Continuous "correctly held" time and its target, surfaced from
  // camera.tsx's client-side hold tracker.
  holdSeconds?: number;
  holdTarget?: number;
};

export default function YogaPoseOverlay({
  poseLabel,
  sanskrit,
  result,
  onSwitchCamera,
  sessionDuration,
  holdSeconds = 0,
  holdTarget = 30,
}: Props) {
  const router = useRouter();

  const score = result ? Math.round(result.score * 100) : 0;
  const holding = result?.ok ?? false;
  const holdProgress = Math.min(1, holdSeconds / Math.max(holdTarget, 0.01));

  return (
    <>
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.75)", "rgba(0,0,0,0.98)"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <BlurView
          intensity={30}
          style={[styles.liveBadge, holding && styles.liveBadgeHolding]}
        >
          <View style={[styles.liveDot, holding && styles.liveDotHolding]} />
          <Text style={styles.liveText}>{holding ? "HOLDING" : "ADJUST POSE"}</Text>
        </BlurView>

        <BlurView intensity={35} style={styles.clockBadge}>
          <Ionicons name="timer-outline" size={15} color="#10B981" />
          <Text style={styles.clockText}>{sessionDuration || "0:00"}</Text>
        </BlurView>

        <TouchableOpacity style={styles.iconButton} onPress={onSwitchCamera}>
          <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* POSE INFO */}
      <View style={styles.poseContainer}>
        <Text style={styles.poseTitle}>{poseLabel}</Text>
        {sanskrit ? <Text style={styles.poseSanskrit}>{sanskrit}</Text> : null}
      </View>

      {/* SCORE */}
      <BlurView intensity={40} style={styles.scoreCircle}>
        <Text style={styles.scoreLabel}>MATCH</Text>
        <Text style={styles.scoreNumber}>{score}%</Text>
      </BlurView>

      {/* HOLD COUNTER — continuous "correctly held" time vs target,
          tracked client-side in camera.tsx since the pose engine doesn't
          currently carry a per-pose hold duration. */}
      <BlurView intensity={35} style={styles.holdBadge}>
        <Text style={styles.holdLabel}>HOLD</Text>
        <Text style={styles.holdValue}>
          {holdSeconds.toFixed(1)}s <Text style={styles.holdTarget}>/{holdTarget}s</Text>
        </Text>
        <View style={styles.holdTrack}>
          <View
            style={[styles.holdFill, { width: `${Math.round(holdProgress * 100)}%` }]}
          />
        </View>
      </BlurView>

      {/* CHECKLIST */}
      <View style={styles.checklistCard}>
        <BlurView intensity={35} style={styles.checklistBlur}>
          {result && result.checks.length > 0 ? (
            result.checks.map((c) => (
              <View key={c.id} style={styles.checkRow}>
                <Ionicons
                  name={
                    c.skipped
                      ? "help-circle-outline"
                      : c.passed
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={18}
                  color={c.skipped ? "#9CA3AF" : c.passed ? "#22C55E" : "#EF4444"}
                />
                <Text style={styles.checkLabel}>
                  {c.skipped ? `${c.label} (can't see)` : c.label}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.checkLabel}>Step into frame to begin</Text>
          )}
        </BlurView>
      </View>

      {/* FEEDBACK */}
      {result && result.feedback.length > 0 ? (
        <BlurView intensity={45} style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>{result.feedback[0]}</Text>
        </BlurView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  liveBadgeHolding: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 8,
  },
  liveDotHolding: {
    backgroundColor: "#22C55E",
  },
  liveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  clockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
    gap: 6,
  },
  clockText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  poseContainer: {
    position: "absolute",
    top: 130,
    left: 24,
  },
  poseTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  poseSanskrit: {
    color: "#A78BFA",
    fontSize: 14,
    marginTop: 2,
  },
  scoreCircle: {
    position: "absolute",
    top: 130,
    right: 24,
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreLabel: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  scoreNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },
  holdBadge: {
    position: "absolute",
    top: 230,
    right: 24,
    width: 90,
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  holdLabel: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "600",
  },
  holdValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  holdTarget: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "400",
  },
  holdTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 6,
    overflow: "hidden",
  },
  holdFill: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 2,
  },
  checklistCard: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  checklistBlur: {
    padding: 16,
    gap: 10,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkLabel: {
    color: "#fff",
    fontSize: 13,
    flexShrink: 1,
  },
  feedbackCard: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 130,
    borderRadius: 16,
    overflow: "hidden",
    padding: 14,
  },
  feedbackText: {
    color: "#FDE68A",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});