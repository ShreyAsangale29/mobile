import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import AudioCoachCard from "./AudioCoachCard";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

type Props = {
  mode: "workout" | "yoga";
  onSwitchCamera: () => void;
  reps?: number;
  goalReps?: number;
  formScore?: number;
  stage?: string;
  statusMessage?: string;
  exerciseName?: string;
  exerciseIndex?: number;
  exerciseTotal?: number;
  // Kept in the prop type so camera.tsx doesn't need editing, but the
  // dedicated "next exercise" card has been removed — the red X control
  // below now serves that purpose directly.
  nextExerciseName?: string;
  unsupported?: boolean;
  onFinishExercise?: () => void;
  // Session-wide clock, shown top bar. Runs continuously from mount to end.
  sessionDuration?: string;
  // When both are present, the rep circle switches into "hold mode"
  // (e.g. plank) instead of showing a rep count. Any future hold-based
  // exercise gets this automatically since it's driven by the engine's
  // own metrics, not a hardcoded exercise-name check.
  holdSeconds?: number;
  holdTargetSeconds?: number;
  poseName?: string;
  poseIndex?: number;
  poseTotal?: number;
  poseMatch?: number;
  yogaFeedback?: string;
  errors?: string[];
  warmupActive?: boolean;
  cooldownActive?: boolean;
  yogaReps?: number;
  exerciseElapsedSeconds?: number;
};

export default function WorkoutCamera({
  mode,
  onSwitchCamera,
  reps = 0,
  goalReps = 12,
  formScore = 0,
  stage = "unknown",
  statusMessage,
  exerciseName = "Exercise",
  exerciseIndex = 1,
  exerciseTotal = 1,
  unsupported = false,
  onFinishExercise,
  sessionDuration,
  holdSeconds,
  holdTargetSeconds,
  poseName = "Pose",
  poseIndex = 1,
  poseTotal = 1,
  poseMatch = 0,
  yogaFeedback,
  errors = [],
  warmupActive = false,
  cooldownActive = false,
  yogaReps = 0,
  exerciseElapsedSeconds = 0,
}: Props) {
  const router = useRouter();
 const isLastItem =
  mode === "workout"
    ? exerciseIndex >= exerciseTotal
    : poseIndex >= poseTotal;
  const isHoldBased =
    typeof holdSeconds === "number" && typeof holdTargetSeconds === "number" && mode !== "yoga";
  const holdProgress = isHoldBased
    ? Math.min(1, holdSeconds! / Math.max(holdTargetSeconds!, 0.01))
    : 0;

  return (
    <>
      {/* TOP BAR — back, live badge, camera flip. Always visible, even
          during warmup/cooldown. */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.replace("/CameraCheckScreen")}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <BlurView intensity={35} style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </BlurView>

        <BlurView intensity={35} style={styles.clockBadge}>
          <Ionicons name="timer-outline" size={15} color="#10B981" />
          <Text style={styles.clockText}>{`${sessionDuration || "0:00"} / 10:00`}</Text>
        </BlurView>

        <TouchableOpacity style={styles.iconButton} onPress={onSwitchCamera}>
          <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {!warmupActive && !cooldownActive && (
        <>
          {/* EXERCISE INFO — compact, no duplicate feedback text (that lives in the AI coach card now) */}
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseCount}>
              {mode === "workout"
                  ? `EXERCISE ${exerciseIndex} OF ${exerciseTotal}`
                  : `POSE ${poseIndex} OF ${poseTotal}`}
            </Text>

            <Text style={styles.exerciseTitle}>
              {mode === "workout"
                  ? exerciseName
                  : poseName}
            </Text>
            <Text style={styles.goalText}>
              {mode === "workout"
                  ? `Goal: ${goalReps} reps | ⏱ ${Math.max(0, 45 - exerciseElapsedSeconds)}s left`
                  : `Goal: 3 reps of 5s | ⏱ ${Math.max(0, 45 - exerciseElapsedSeconds)}s left`}
            </Text>
          </View>

          {/* LIVE DETECTION SCORE — small, always visible, doesn't block the feed */}
          {!unsupported && (
            <BlurView intensity={40} style={styles.scoreBadge}>
              <Text style={styles.scoreLabel}>
                {mode === "workout" ? "SCORE" : "MATCH"}
              </Text>
              <Text style={styles.scoreValue}>
                {`${mode === "workout" ? formScore : poseMatch}%`}
              </Text>
            </BlurView>
          )}

          {/* Everything below this point is deliberately minimal — the camera
              feed + skeleton overlay (rendered by PoseOverlay in camera.tsx)
              should occupy essentially the entire middle of the screen. */}

          {/* AI COACH — avatar + live text + automatic voice, no manual button.
              Gated out during warmup/cooldown (see warmupActive/cooldownActive
              above) so it isn't talking over those overlays' own feedback. */}
          <AudioCoachCard
            liveMessage={mode === "workout" ? statusMessage : yogaFeedback}
          />

          {/* REP / HOLD COUNTER — switches to hold mode automatically whenever
              the engine surfaces holdSeconds/targetHoldSeconds (e.g. plank),
              so no per-exercise special-casing is needed here. */}
          {mode === "yoga" ? (
            <BlurView intensity={40} style={styles.repCircle}>
              <Text style={styles.repLabel}>YOGA REPS</Text>
              <Text style={styles.repNumber}>{yogaReps}</Text>
              <Text style={styles.repGoal}>/3</Text>
              <Text style={styles.yogaHoldSub}>{`Hold: ${(holdSeconds ?? 0).toFixed(1)}s / 5s`}</Text>
              <View style={styles.holdTrack}>
                <View
                  style={[
                    styles.holdFill,
                    { width: `${Math.round(((holdSeconds ?? 0) / 5) * 100)}%` },
                  ]}
                />
              </View>
            </BlurView>
          ) : isHoldBased ? (
            <BlurView intensity={40} style={styles.repCircle}>
              <Text style={styles.repLabel}>HOLD</Text>
              <Text style={styles.holdNumber}>{`${(holdSeconds ?? 0).toFixed(1)}s`}</Text>
              <Text style={styles.repGoal}>{`/${holdTargetSeconds ?? 0}s`}</Text>
              <View style={styles.holdTrack}>
                <View
                  style={[
                    styles.holdFill,
                    { width: `${Math.round(holdProgress * 100)}%` },
                  ]}
                />
              </View>
            </BlurView>
          ) : (
            <BlurView intensity={40} style={styles.repCircle}>
              <Text style={styles.repLabel}>REPS</Text>
              <Text style={styles.repNumber}>{reps}</Text>
              <Text style={styles.repGoal}>{`/${goalReps}`}</Text>
              {mode === "workout" && !unsupported && (
                <View style={styles.stageRow}>
                  <Ionicons
                    name={stage === "down" ? "arrow-down-circle" : stage === "up" ? "arrow-up-circle" : "ellipse-outline"}
                    size={14}
                    color="#A78BFA"
                  />
                </View>
              )}
            </BlurView>
          )}

          {/* CONTROLS — red X now doubles as Finish / Next Exercise. Left
              button opens the AI coach chat screen with current session
              context (kept from the newer version of this file — not
              reverted back to a plain mic-mute icon). */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => {
                router.push({
                  pathname: "/ai-coach",
                  params: {
                    exercise: mode === "workout" ? exerciseName : poseName,
                    reps: reps.toString(),
                    postureScore: formScore.toString(),
                    errors: errors.join(","),
                    stage: stage,
                  },
                });
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pauseButton}>
              <Ionicons name="pause" size={36} color="#fff" />
            </TouchableOpacity>

            <View style={styles.finishGroup}>
              <Text style={styles.finishCaption}>
              {mode === "workout"
                ? (isLastItem ? "Finish Session" : "Next Exercise")
                : (isLastItem ? "Finish Session" : "Next Pose")}
            </Text>
              <TouchableOpacity style={styles.endButton} onPress={onFinishExercise}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 55,
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: "hidden",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 8,
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

  exerciseContainer: {
    position: "absolute",
    top: 108,
    left: 20,
    right: 90,
    zIndex: 20,
  },

  exerciseCount: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  exerciseTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  goalText: {
    color: "#D1D5DB",
    fontSize: 13,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  scoreBadge: {
    position: "absolute",
    top: 108,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    zIndex: 20,
  },

  scoreLabel: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "600",
  },

  scoreValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 1,
  },

  repCircle: {
    position: "absolute",
    bottom: 175,
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  repLabel: {
    color: "#A1A1AA",
    fontSize: 11,
  },

  repNumber: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },

  repGoal: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  yogaHoldSub: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },

  holdNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  holdTrack: {
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 4,
    overflow: "hidden",
  },

  holdFill: {
    height: "100%",
    backgroundColor: "#A78BFA",
    borderRadius: 2,
  },

  stageRow: {
    marginTop: 2,
  },

  controls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
  },

  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  pauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },

  finishGroup: {
    alignItems: "center",
  },

  finishCaption: {
    color: "#F5F5F5",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  endButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
});