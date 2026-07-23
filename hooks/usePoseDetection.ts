import { useCallback, useEffect, useRef, useState } from "react";
import { useFrameProcessor } from "react-native-vision-camera";
import { plugin, poseEmitter, isNativeAvailable } from "./mediapipePlugin";

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export const POSE_LANDMARK = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export function calcAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;

  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);

  if (magAB === 0 || magCB === 0) return 0;

  const cosine = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

// --- Smoothing config ---
// Lower alpha = smoother but more lag. Higher alpha = more responsive but more jitter.
const SMOOTHING_ALPHA = 0.35;
// If a landmark's visibility is below this, don't let it drag the smoothed value around.
const MIN_VISIBILITY_TO_UPDATE = 0.5;
// If the raw jump for a landmark is bigger than this (in normalized 0-1 units),
// treat it as a likely misdetection and ignore it for smoothing purposes.
const MAX_JUMP_PER_FRAME = 0.35;

function smoothLandmarks(
  prev: Landmark[] | null,
  next: Landmark[]
): Landmark[] {
  if (!prev || prev.length !== next.length) {
    return next;
  }

  return next.map((lm, i) => {
    const prevLm = prev[i];
    if (!prevLm) return lm;

    // Skip smoothing (just pass through) if this point isn't confidently visible.
    if ((lm.visibility ?? 1) < MIN_VISIBILITY_TO_UPDATE) {
      return prevLm;
    }

    const dx = Math.abs(lm.x - prevLm.x);
    const dy = Math.abs(lm.y - prevLm.y);

    // Reject sudden huge teleports (likely a bad detection), keep previous position instead.
    if (dx > MAX_JUMP_PER_FRAME || dy > MAX_JUMP_PER_FRAME) {
      return prevLm;
    }

    return {
      x: prevLm.x + SMOOTHING_ALPHA * (lm.x - prevLm.x),
      y: prevLm.y + SMOOTHING_ALPHA * (lm.y - prevLm.y),
      z: prevLm.z + SMOOTHING_ALPHA * (lm.z - prevLm.z),
      visibility: lm.visibility,
    };
  });
}

interface UsePoseDetectionOptions {
  enabled?: boolean;
}

export interface UsePoseDetectionResult {
  landmarks: Landmark[] | null;
  isReady: boolean;
  error: string | null;
  frameProcessor: unknown;
}

export function usePoseDetection(
  options: UsePoseDetectionOptions = {}
): UsePoseDetectionResult {
  const { enabled = true } = options;
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the last smoothed result in a ref so we can blend into it without
  // triggering extra re-renders or stale-closure issues.
  const smoothedRef = useRef<Landmark[] | null>(null);
  const missCountRef = useRef(0);

  const handleResult = useCallback((pose: Landmark[] | null) => {
    if (!pose || pose.length === 0) {
      // Don't blank out instantly on a single missed frame — MediaPipe can drop
      // a frame here and there even mid-tracking. Only clear after a few misses.
      missCountRef.current += 1;
      if (missCountRef.current > 5) {
        smoothedRef.current = null;
        setLandmarks(null);
      }
      return;
    }

    missCountRef.current = 0;
    const smoothed = smoothLandmarks(smoothedRef.current, pose);
    smoothedRef.current = smoothed;
    setLandmarks(smoothed);
  }, []);

  useEffect(() => {
    if (!poseEmitter || !enabled) return;

    const sub = (poseEmitter as any).addListener("onPoseResult", (event: any) => {
      try {
        const parsed: Landmark[] = JSON.parse(event.landmarks);
        handleResult(parsed);
      } catch (e) {
        console.warn("[usePoseDetection] Failed to parse landmarks:", e);
      }
    });

    const errSub = (poseEmitter as any).addListener("onPoseError", (event: any) => {
      setError(event?.message ?? "Unknown pose detection error");
    });

    return () => {
      sub.remove();
      errSub.remove();
    };
  }, [enabled, handleResult]);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      if (plugin && enabled) {
        plugin.call(frame);
      }
    },
    [enabled]
  );

  return {
    landmarks,
    isReady: isNativeAvailable,
    error,
    frameProcessor: isNativeAvailable ? frameProcessor : null,
  };
}