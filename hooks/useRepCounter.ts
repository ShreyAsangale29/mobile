import { useCallback, useEffect, useRef, useState } from "react";
import { Landmark, POSE_LANDMARK, calcAngle } from "./usePoseDetection";

export type RepStage = "up" | "down" | "unknown";

export interface UseRepCounterResult {
  reps: number;
  stage: RepStage;
  formScore: number; // 0-100
  elbowAngle: number | null;
  reset: () => void;
}

// Angle thresholds for a push-up rep cycle.
// Elbow angle is large (arm straight) at the "up" position,
// and small (arm bent) at the "down" position.
const UP_ANGLE_THRESHOLD = 155; // degrees - arm considered "straight"
const DOWN_ANGLE_THRESHOLD = 95; // degrees - arm considered "bent"
const MIN_VISIBILITY = 0.5;

export function useRepCounter(
  landmarks: Landmark[] | null,
  goalReps: number = 12
): UseRepCounterResult {
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState<RepStage>("unknown");
  const [formScore, setFormScore] = useState(100);
  const [elbowAngle, setElbowAngle] = useState<number | null>(null);

  const stageRef = useRef<RepStage>("unknown");
  const repDepthSamplesRef = useRef<number[]>([]);

  const reset = useCallback(() => {
    setReps(0);
    setStage("unknown");
    setFormScore(100);
    stageRef.current = "unknown";
    repDepthSamplesRef.current = [];
  }, []);

  useEffect(() => {
    if (!landmarks || landmarks.length < 33) {
      setElbowAngle(null);
      return;
    }

    // Use whichever arm is more visible (some angles/camera positions occlude one side).
    const leftShoulder = landmarks[POSE_LANDMARK.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARK.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARK.LEFT_WRIST];
    const rightShoulder = landmarks[POSE_LANDMARK.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARK.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARK.RIGHT_WRIST];

    const leftVisible =
      (leftShoulder?.visibility ?? 0) > MIN_VISIBILITY &&
      (leftElbow?.visibility ?? 0) > MIN_VISIBILITY &&
      (leftWrist?.visibility ?? 0) > MIN_VISIBILITY;
    const rightVisible =
      (rightShoulder?.visibility ?? 0) > MIN_VISIBILITY &&
      (rightElbow?.visibility ?? 0) > MIN_VISIBILITY &&
      (rightWrist?.visibility ?? 0) > MIN_VISIBILITY;

    let angle: number | null = null;
    if (leftVisible && rightVisible) {
      const leftAngle = calcAngle(leftShoulder, leftElbow, leftWrist);
      const rightAngle = calcAngle(rightShoulder, rightElbow, rightWrist);
      angle = (leftAngle + rightAngle) / 2;
    } else if (leftVisible) {
      angle = calcAngle(leftShoulder, leftElbow, leftWrist);
    } else if (rightVisible) {
      angle = calcAngle(rightShoulder, rightElbow, rightWrist);
    }

    if (angle === null) {
      setElbowAngle(null);
      return;
    }

    setElbowAngle(angle);

    // Track how deep each rep goes, for a rough form score.
    repDepthSamplesRef.current.push(angle);
    if (repDepthSamplesRef.current.length > 200) {
      repDepthSamplesRef.current.shift();
    }

    const currentStage = stageRef.current;

    if (angle >= UP_ANGLE_THRESHOLD) {
      if (currentStage === "down") {
        // Completed a down->up cycle = one rep.
        setReps((r) => r + 1);

        // Form score: reward reps that actually went deep (low min angle recently).
        const recentMin = Math.min(
          ...repDepthSamplesRef.current.slice(-20)
        );
        const depthScore = recentMin <= DOWN_ANGLE_THRESHOLD
          ? 100
          : Math.max(
              0,
              100 -
                ((recentMin - DOWN_ANGLE_THRESHOLD) /
                  (UP_ANGLE_THRESHOLD - DOWN_ANGLE_THRESHOLD)) *
                  100
            );
        setFormScore(Math.round(depthScore));
      }
      stageRef.current = "up";
      setStage("up");
    } else if (angle <= DOWN_ANGLE_THRESHOLD) {
      stageRef.current = "down";
      setStage("down");
    }
    // If angle is between thresholds, keep the current stage (avoids flicker).
  }, [landmarks]);

  return { reps, stage, formScore, elbowAngle, reset };
}