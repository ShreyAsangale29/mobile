import { StyleSheet, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import WorkoutCamera from "./workout/WorkoutCamera";
import CountdownOverlay from "./workout/CountdownOverlay";
import WarmupOverlay from "./workout/Warmupoverlay";
import BreathingOverlay from "./workout/BreathingOverlay";
import CoachAvatar from "../components/Avatar/CoachAvatar";
import { useWarmupSession } from "./workout/useWarmupSession";
import CooldownOverlay from "./workout/CooldownOverlay";
import { useCooldownSession } from "./workout/useCooldownSession";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { usePoseValidation } from "@/hooks/usePoseValidation";
import PoseOverlay from "@/app/workout/PoseOverlay";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useExerciseEngine, type ExerciseType } from "@/hooks/useExerciseEngine";
import { matchExerciseType } from "@/hooks/exerciseMapping";
import { exercises } from "@/data/exercises";
import { POSE_LIST, type PoseId } from "@/lib/pose-engine/pose-engine";
import type { FitnessLevel } from "@/lib/exercise-engine/config/thresholds";
import { getCoachMessage } from "@/hooks/exerciseFeedback";

const DEFAULT_GOAL_REPS = 5;
const COUNTDOWN_SECONDS = 3;
const YOGA_HOLD_TARGET_SECONDS = 5;
const REST_SECONDS = 20;
const SESSION_TIME_LIMIT_SECONDS = 600; // 10 minutes total session
const EXERCISE_DURATION_LIMIT_SECONDS = 45; // 45 seconds per exercise / pose

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const params = useLocalSearchParams<{
    poses?: string;
    mode?: string;
    pose?: string;
    exercises?: string;
  }>();

  const [mode] = useState<"workout" | "yoga">(
    params.mode === "yoga" ? "yoga" : "workout"
  );
  const selectedPoses = useMemo(
    () => params.poses?.split(",").filter(Boolean) ?? [],
    [params.poses]
  );

  const [poseIndex, setPoseIndex] = useState(0);
  const poseId = (selectedPoses[poseIndex] as PoseId) ?? "tree";

  const selectedExercises = useMemo(() => {
    if (mode !== "workout" || !params.exercises) return [];
    const ids = params.exercises.split(",").filter(Boolean);
    return ids
      .map((id) => exercises.find((e) => e.id === id))
      .filter((e): e is (typeof exercises)[number] => !!e);
  }, [mode, params.exercises]);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const currentExercise = selectedExercises[exerciseIndex] ?? null;
  const engineType: ExerciseType | null = currentExercise
    ? matchExerciseType(currentExercise.id)
    : null;
  const engineLevel: FitnessLevel = (
    currentExercise?.difficulty?.toLowerCase() ?? "intermediate"
  ) as FitnessLevel;

  const [cameraPosition, setCameraPosition] =
    useState<"front" | "back">("front");
  const device = useCameraDevice(cameraPosition);
  const { hasPermission } = useCameraPermission();

  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  const { landmarks, frameProcessor } = usePoseDetection({
    enabled: cameraPosition === "front",
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const sessionDuration = formatDuration(elapsedSeconds);

  const warmup = useWarmupSession(landmarks);
  const warmupDone = warmup.isComplete;

  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(REST_SECONDS);

  const [yogaReps, setYogaReps] = useState(0);
  const [exerciseElapsedSeconds, setExerciseElapsedSeconds] = useState(0);

  const [exercisesDone, setExercisesDone] = useState(false);
  const cooldown = useCooldownSession(landmarks, exercisesDone);

  useEffect(() => {
    if (cooldown.isComplete) {
      router.push("/Achievementscreen");
    }
  }, [cooldown.isComplete, router]);

  useEffect(() => {
    if (elapsedSeconds >= SESSION_TIME_LIMIT_SECONDS) {
      console.log("Workout session time limit reached!");
      router.push("/Achievementscreen");
    }
  }, [elapsedSeconds, router]);

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== "workout" || !warmupDone) return;
    setCountdown(COUNTDOWN_SECONDS);
  }, [mode, exerciseIndex, warmupDone]);

  useEffect(() => {
    if (mode !== "yoga" || !warmupDone) return;
    setCountdown(COUNTDOWN_SECONDS);
  }, [mode, warmupDone]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      const clear = setTimeout(() => setCountdown(null), 700);
      return () => clearTimeout(clear);
    }
    const id = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const { result: exerciseResult, reset: resetExercise } = useExerciseEngine(
    landmarks,
    {
      exercise: engineType ?? "pushup",
      level: engineLevel,
      enabled:
        mode === "workout" &&
        !!engineType &&
        warmupDone &&
        countdown === null &&
        !isResting,
    }
  );

  const advanceWorkoutIndex = useCallback(() => {
    setExerciseIndex((i) => i + 1);
    resetExercise();
    setCountdown(COUNTDOWN_SECONDS);
  }, [resetExercise]);

  const advanceYogaIndex = useCallback(() => {
    setPoseIndex((i) => i + 1);
    setYogaReps(0);
    setYogaHoldSeconds(0);
    yogaHoldStartRef.current = null;
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const goToNextExercise = useCallback(() => {
    if (mode === "workout") {
      if (exerciseIndex + 1 < selectedExercises.length) {
        advanceWorkoutIndex();
      } else {
        setExercisesDone(true);
      }
    } else {
      if (poseIndex + 1 < selectedPoses.length) {
        advanceYogaIndex();
      } else {
        setExercisesDone(true);
      }
    }
  }, [
    mode,
    exerciseIndex,
    selectedExercises.length,
    poseIndex,
    selectedPoses.length,
    advanceWorkoutIndex,
    advanceYogaIndex,
  ]);

  const poseResult = usePoseValidation(landmarks, poseId, frameSize);

  const [yogaHoldSeconds, setYogaHoldSeconds] = useState(0);
  const yogaHoldStartRef = useRef<number | null>(null);

  // Reset exercise/pose duration timer on transition
  useEffect(() => {
    setExerciseElapsedSeconds(0);
  }, [exerciseIndex, poseIndex]);

  // Tick the duration timer for active exercises/poses
  useEffect(() => {
    if (countdown !== null || !warmupDone || isResting) return;
    const id = setInterval(() => {
      setExerciseElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [countdown, warmupDone, isResting, exerciseIndex, poseIndex]);

  // Auto-advance if single exercise/pose time limit (45s) is reached
  useEffect(() => {
    if (countdown !== null || !warmupDone || isResting) return;
    if (exerciseElapsedSeconds >= EXERCISE_DURATION_LIMIT_SECONDS) {
      console.log("[CameraScreen] Exercise/Pose duration limit reached, advancing!");
      goToNextExercise();
    }
  }, [exerciseElapsedSeconds, countdown, warmupDone, isResting, goToNextExercise]);

  useEffect(() => {
    if (mode !== "yoga" || countdown !== null || !warmupDone || isResting) {
      yogaHoldStartRef.current = null;
      setYogaHoldSeconds(0);
      return;
    }

    const id = setInterval(() => {
      if (poseResult?.ok) {
        if (yogaHoldStartRef.current == null) {
          yogaHoldStartRef.current = Date.now();
        }
        const currentHold = (Date.now() - yogaHoldStartRef.current) / 1000;
        if (currentHold >= YOGA_HOLD_TARGET_SECONDS) {
          setYogaReps((r) => {
            const nextReps = r + 1;
            console.log(`[Yoga] Rep completed: ${nextReps}/3`);
            return nextReps;
          });
          yogaHoldStartRef.current = Date.now();
          setYogaHoldSeconds(0);
        } else {
          setYogaHoldSeconds(currentHold);
        }
      } else {
        yogaHoldStartRef.current = null;
        setYogaHoldSeconds(0);
      }
    }, 200);

    return () => clearInterval(id);
  }, [mode, countdown, poseResult?.ok, warmupDone, isResting]);

  useEffect(() => {
    if (
      mode !== "workout" ||
      !engineType ||
      countdown !== null ||
      !warmupDone ||
      isResting
    )
      return;

    const metrics = exerciseResult?.metrics ?? {};
    const holdSeconds = metrics.holdSeconds;
    const targetHoldSeconds = metrics.targetHoldSeconds;

    const isHoldBased =
      typeof holdSeconds === "number" && typeof targetHoldSeconds === "number";

    const goalMet = isHoldBased
      ? holdSeconds >= targetHoldSeconds
      : (exerciseResult?.reps ?? 0) >= DEFAULT_GOAL_REPS;

    if (goalMet) {
      if (exerciseIndex + 1 < selectedExercises.length) {
        setRestSecondsLeft(REST_SECONDS);
        setIsResting(true);
      } else {
        setExercisesDone(true);
      }
    }
  }, [
    mode,
    engineType,
    countdown,
    warmupDone,
    isResting,
    exerciseIndex,
    selectedExercises.length,
    exerciseResult?.reps,
    exerciseResult?.metrics.holdSeconds,
    exerciseResult?.metrics.targetHoldSeconds,
    exerciseResult?.metrics,
    router,
  ]);

  // Check if yoga reps limit (3 reps) is reached
  useEffect(() => {
    if (
      mode !== "yoga" ||
      !warmupDone ||
      isResting ||
      yogaReps < 3
    )
      return;

    if (poseIndex + 1 < selectedPoses.length) {
      setRestSecondsLeft(REST_SECONDS);
      setIsResting(true);
    } else {
      setExercisesDone(true);
    }
  }, [
    yogaReps,
    mode,
    warmupDone,
    isResting,
    poseIndex,
    selectedPoses.length,
    router,
  ]);

  useEffect(() => {
    if (!isResting) return;

    if (restSecondsLeft <= 0) {
      setIsResting(false);
      if (mode === "workout") {
        advanceWorkoutIndex();
      } else {
        advanceYogaIndex();
      }
      return;
    }

    const id = setTimeout(() => setRestSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [isResting, restSecondsLeft, mode, advanceWorkoutIndex, advanceYogaIndex]);

  if (!hasPermission) {
    return <View style={styles.permissionContainer} />;
  }

  const toggleCamera = () =>
    setCameraPosition((current) => (current === "front" ? "back" : "front"));

  const poseMeta = POSE_LIST.find((p) => p.id === poseId);

  const nextExercise = selectedExercises[exerciseIndex + 1] ?? null;
  const nextPoseMeta = POSE_LIST.find(
    (p) => p.id === selectedPoses[poseIndex + 1]
  );
  const nextHowTo =
    mode === "workout"
      ? (nextExercise as any)?.instructions ?? (nextExercise as any)?.description
      : (nextPoseMeta as any)?.instructions ?? (nextPoseMeta as any)?.description;

  const countdownLabel =
    mode === "yoga"
      ? `Get ready: ${poseMeta?.label ?? "Pose"}`
      : `Get ready: ${currentExercise?.name ?? "Exercise"}`;

  const yogaFeedback =
    mode === "yoga" ? poseResult?.feedback?.join(", ") : undefined;

  const avatarPhase: "warmup" | "countdown" | "active" | "rest" | "cooldown" = !warmupDone
    ? "warmup"
    : exercisesDone && !cooldown.isComplete
      ? "cooldown"
      : isResting
        ? "rest"
        : countdown !== null
          ? "countdown"
          : "active";

  const avatarFormOk =
    mode === "workout"
      ? (exerciseResult?.errors?.length ?? 0) === 0
      : poseResult?.ok ?? true;

  return (
    <View
      style={styles.container}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setFrameSize({ width, height });
        }}
      >
        {device ? (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
            photoQualityBalance="quality"
            pixelFormat="yuv"
            frameProcessor={frameProcessor as any}
          />
        ) : null}

        {landmarks && (
          <PoseOverlay landmarks={landmarks} mirror={cameraPosition === "front"} />
        )}

        <CoachAvatar
          phase={avatarPhase}
          mode={mode}
          exerciseType={mode === "workout" ? engineType : null}
          poseId={mode === "yoga" ? poseId : null}
          stage={mode === "workout" ? exerciseResult?.stage : undefined}
          formOk={avatarFormOk}
          kneeAngle={exerciseResult?.metrics?.kneeAngle ?? null}
          baselineKneeAngle={exerciseResult?.metrics?.baselineKneeAngle ?? null}
          elbowAngle={exerciseResult?.metrics?.elbowAngle ?? null}
          baselineElbowAngle={exerciseResult?.metrics?.baselineElbowAngle ?? null}
        />

        <WorkoutCamera
          mode={mode}
          onSwitchCamera={toggleCamera}
          exerciseName={currentExercise?.name ?? "Exercise"}
          exerciseIndex={exerciseIndex + 1}
          exerciseTotal={selectedExercises.length || 1}
          formScore={exerciseResult?.metrics?.postureScore ?? 0}
          reps={exerciseResult?.reps ?? 0}
          goalReps={DEFAULT_GOAL_REPS}
          stage={mode === "workout" ? exerciseResult?.stage : undefined}
          statusMessage={
            mode === "workout" ? getCoachMessage(exerciseResult) ?? undefined : undefined
          }
          unsupported={mode === "workout" ? !engineType : false}
          errors={exerciseResult?.errors ?? []}
          poseName={poseMeta?.label ?? "Yoga Pose"}
          poseIndex={poseIndex + 1}
          poseTotal={selectedPoses.length || 1}
          poseMatch={Math.round((poseResult?.score ?? 0) * 100)}
          yogaFeedback={yogaFeedback}
          holdSeconds={
            mode === "yoga" ? yogaHoldSeconds : exerciseResult?.metrics?.holdSeconds
          }
          holdTargetSeconds={
            mode === "yoga"
              ? YOGA_HOLD_TARGET_SECONDS
              : exerciseResult?.metrics?.targetHoldSeconds
          }
          yogaReps={yogaReps}
          exerciseElapsedSeconds={exerciseElapsedSeconds}
          sessionDuration={sessionDuration}
          onFinishExercise={goToNextExercise}
          warmupActive={!warmupDone}
          cooldownActive={exercisesDone && !cooldown.isComplete}
        />

        {countdown !== null && (
          <CountdownOverlay value={countdown} label={countdownLabel} />
        )}

        {isResting && (
          <BreathingOverlay
            secondsLeft={restSecondsLeft}
            totalSeconds={REST_SECONDS}
            nextLabel={mode === "workout" ? "NEXT EXERCISE" : "NEXT POSE"}
            nextName={
              mode === "workout"
                ? nextExercise?.name ?? "Next Exercise"
                : nextPoseMeta?.label ?? "Next Pose"
            }
            nextHowTo={nextHowTo}
            onSkip={() => setRestSecondsLeft(0)}
            currentStep={mode === "workout" ? exerciseIndex + 1 : poseIndex + 1}
            totalSteps={
              mode === "workout" ? selectedExercises.length : selectedPoses.length
            }
          />
        )}

        {!warmupDone && (
          <WarmupOverlay
            move={warmup.move}
            moveIndex={warmup.moveIndex}
            totalMoves={warmup.totalMoves}
            count={warmup.count}
            target={warmup.target}
            onSkipMove={warmup.skipMove}
            onSkipAll={warmup.skipAll}
          />
        )}

        {exercisesDone && !cooldown.isComplete && (
          <CooldownOverlay
            move={cooldown.move}
            moveIndex={cooldown.moveIndex}
            totalMoves={cooldown.totalMoves}
            count={cooldown.count}
            target={cooldown.target}
            feedback={cooldown.feedback}
            score={cooldown.score}
            onSkipMove={cooldown.skipMove}
            onSkipAll={cooldown.skipAll}
          />
        )}
      </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});