import { useMemo } from "react";
import {
  fromMediaPipe,
  POSE_REGISTRY,
  type PoseId,
  type PoseResult,
  type FrameSize,
} from "@/lib/pose-engine/pose-engine";
import type { Landmark } from "./usePoseDetection";

export function usePoseValidation(
  landmarks: Landmark[] | null,
  poseId: PoseId,
  frame: FrameSize
): PoseResult | null {
  return useMemo(() => {
    if (!landmarks || landmarks.length === 0) return null;
    if (!frame.width || !frame.height) return null;

    const mpLandmarks = fromMediaPipe(landmarks, frame);
    const validate = POSE_REGISTRY[poseId];
    return validate(mpLandmarks, frame);
  }, [landmarks, frame, poseId]);
}