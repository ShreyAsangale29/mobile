import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";

import {
  landmarksToPoseFrame,
} from "@/lib/exercise-engine/landmark-extraction/landmarks";

import { PoseLandmark } from "@/lib/exercise-engine";
import {
  getThresholdsForProfile,
  FitnessLevel,
} from "@/lib/exercise-engine/config/thresholds";

import { EngineResult } from "@/lib/exercise-engine/types/EngineResult";
import { SquatEngine } from "@/lib/exercise-engine/rep-counter/squatEngine";
import { PushupEngine } from "@/lib/exercise-engine/rep-counter/pushupEngine";
import { PlankEngine } from "@/lib/exercise-engine/rep-counter/plankEngine";
import { LungeEngine } from "@/lib/exercise-engine/rep-counter/lungeEngine";
import { DeadliftEngine } from "@/lib/exercise-engine/rep-counter/deadliftEngine";
import { Landmark } from "./usePoseDetection";

import {
  BodySignature,
  createBodySignatureFromLandmarks,
  compareBodySignatures,
  getSessionUserProfile,
} from "@/lib/exercise-engine/authenticity";

export type ExerciseType = "squat" | "pushup" | "plank" | "lunge" | "deadlift";

function createEngine(exercise: ExerciseType, level: FitnessLevel) {
  const thresholds = getThresholdsForProfile(level);

  switch (exercise) {
    case "squat":
      return new SquatEngine(thresholds);
    case "pushup":
      return new PushupEngine(thresholds);
    case "plank":
      return new PlankEngine(thresholds);
    case "lunge":
      return new LungeEngine(thresholds);
    case "deadlift":
      return new DeadliftEngine(thresholds);
  }
}

interface UseExerciseEngineOptions {
  exercise: ExerciseType;
  level?: FitnessLevel;
  enabled?: boolean;
}

export type ExerciseEngineResult = EngineResult & {
  setupUserStatus?:
  | "SETUP_PROFILE_LOADING"
  | "SETUP_PROFILE_MISSING"
  | "SETUP_PROFILE_NOT_VISIBLE"
  | "SETUP_USER_MATCHED"
  | "SETUP_USER_MISMATCH";
  setupUserReason?: string;
  setupDifferenceScore?: number;
  repCountBlocked?: boolean;
  feedback?: string;
};

function createBlockedResult(
  previous: ExerciseEngineResult | null,
  feedback: string,
  setupUserStatus: ExerciseEngineResult["setupUserStatus"],
  setupUserReason: string,
  setupDifferenceScore = 0
): ExerciseEngineResult {
  return {
    ...(previous ?? ({} as EngineResult)),
    reps: previous?.reps ?? 0,
    stage: previous?.stage ?? "blocked",
    feedback,
    metrics: previous?.metrics ?? {
      postureScore: 0,
      validReps: 0,
      invalidReps: 0,
    },
    setupUserStatus,
    setupUserReason,
    setupDifferenceScore,
    repCountBlocked: true,
  };
}

function convertToAuthLandmarks(landmarks: Landmark[]) {
  return landmarks.map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
    visibility: lm.visibility,
  }));
}

export function useExerciseEngine(
  landmarks: Landmark[] | null,
  options: UseExerciseEngineOptions
) {
  const {
    exercise,
    level = "intermediate",
    enabled = true,
  } = options;

  const { width, height } = useWindowDimensions();

  const [result, setResult] = useState<ExerciseEngineResult | null>(null);

  const engineRef = useRef(createEngine(exercise, level));
  const currentExerciseRef = useRef(exercise);

  const setupProfileRef = useRef<BodySignature | null>(null);
  const setupProfileLoadedRef = useRef(false);

  const latestResultRef = useRef<ExerciseEngineResult | null>(null);

  useEffect(() => {
    setupProfileLoadedRef.current = false;

    const loadSetupProfile = async () => {
      setupProfileRef.current = await getSessionUserProfile();
      setupProfileLoadedRef.current = true;

      console.log(
        "[useExerciseEngine] Setup profile loaded:",
        setupProfileRef.current
      );
    };

    loadSetupProfile();
  }, []);

  useEffect(() => {
    engineRef.current = createEngine(exercise, level);
    currentExerciseRef.current = exercise;

    latestResultRef.current = null;
    setResult(null);
  }, [exercise, level]);

  useEffect(() => {
    if (!enabled || !landmarks || landmarks.length === 0) {
      return;
    }

    const authLandmarks = convertToAuthLandmarks(landmarks);

    if (!setupProfileLoadedRef.current) {
      const blocked = createBlockedResult(
        latestResultRef.current,
        "Loading setup user profile. Please wait.",
        "SETUP_PROFILE_LOADING",
        "Setup profile is still loading from local storage."
      );

      latestResultRef.current = blocked;
      setResult(blocked);
      return;
    }

    if (!setupProfileRef.current) {
      const blocked = createBlockedResult(
        latestResultRef.current,
        "Setup user profile not found. Please complete camera check again.",
        "SETUP_PROFILE_MISSING",
        "No setup profile was found in local storage."
      );

      latestResultRef.current = blocked;
      setResult(blocked);
      return;
    }

    const currentSignature = createBodySignatureFromLandmarks(authLandmarks);

    if (!currentSignature) {
      const blocked = createBlockedResult(
        latestResultRef.current,
        "Full body is required to verify the workout user.",
        "SETUP_PROFILE_NOT_VISIBLE",
        "Could not create body signature from current workout frame."
      );

      latestResultRef.current = blocked;
      setResult(blocked);
      return;
    }

    const comparison = compareBodySignatures(
      setupProfileRef.current,
      currentSignature
    );

    console.log("[useExerciseEngine] Setup user comparison:", comparison);

    if (!comparison.isSameUser) {
      const blocked = createBlockedResult(
        latestResultRef.current,
        "User mismatch detected. Workout user does not match setup photo.",
        "SETUP_USER_MISMATCH",
        comparison.reason,
        comparison.differenceScore
      );

      latestResultRef.current = blocked;
      setResult(blocked);
      return;
    }

    const rawLandmarks: PoseLandmark[] = landmarks.map((lm) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility,
      presence: lm.visibility,
    }));

    const frame = landmarksToPoseFrame(rawLandmarks, width, height);

    const next: ExerciseEngineResult = {
      ...engineRef.current.update(frame),
      setupUserStatus: "SETUP_USER_MATCHED",
      setupUserReason: comparison.reason,
      setupDifferenceScore: comparison.differenceScore,
      repCountBlocked: false,
    };

    latestResultRef.current = next;
    setResult(next);
  }, [landmarks, width, height, enabled, exercise, level]);

  const reset = useCallback(() => {
    engineRef.current.reset();

    latestResultRef.current = null;
    setResult(null);

    setupProfileLoadedRef.current = false;

    const reloadSetupProfile = async () => {
      setupProfileRef.current = await getSessionUserProfile();
      setupProfileLoadedRef.current = true;

      console.log(
        "[useExerciseEngine] Setup profile reloaded:",
        setupProfileRef.current
      );
    };

    reloadSetupProfile();
  }, []);

  return { result, reset };
}