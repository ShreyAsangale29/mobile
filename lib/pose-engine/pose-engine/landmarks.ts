/**
 * Landmark adapters.
 *
 * The Python rule engine uses the MediaPipe Pose schema (33 landmarks).
 * On the web/RN side we can feed it from either:
 *   - MediaPipe Tasks Vision (drop-in, same indices), or
 *   - tfjs-models pose-detection MoveNet (17 COCO keypoints — sparse).
 *
 * Both adapters return a `Landmarks` array indexed by MediaPipe Pose ID,
 * with `undefined` for any landmark the source doesn't provide. Rule files
 * use the `require()` helper from this module so any pose check that
 * needs a missing landmark is recorded as `skipped` instead of crashing.
 */

import type { Landmarks } from "./types";
import type { Point } from "./math";

/** MediaPipe Pose 33-landmark index map (subset used by the rule engine). */
export const MP = {
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

/** Raw MediaPipe NormalizedLandmark (subset). */
export interface MediaPipeLandmark {
  x: number; // 0..1
  y: number; // 0..1
  z?: number;
  visibility?: number;
}

/**
 * Convert a MediaPipe Tasks result into pixel-space landmarks.
 * Pixel space keeps thresholds aligned with the Python reference,
 * which multiplies normalized coords by frame width/height.
 */
export function fromMediaPipe(
  mpLandmarks: MediaPipeLandmark[],
  frame: { width: number; height: number },
  minVisibility = 0.3,
): Landmarks {
  const out: Landmarks = new Array(33).fill(undefined);
  for (let i = 0; i < mpLandmarks.length && i < 33; i++) {
    const lm = mpLandmarks[i];
    if (!lm) continue;
    if (lm.visibility !== undefined && lm.visibility < minVisibility) continue;
    out[i] = {
      x: lm.x * frame.width,
      y: lm.y * frame.height,
      score: lm.visibility,
    };
  }
  return out;
}

/** MoveNet (COCO-17) keypoint shape from @tensorflow-models/pose-detection. */
export interface MoveNetKeypoint {
  x: number; // already in pixel space
  y: number;
  score?: number;
  name?: string;
}

/**
 * MoveNet name → MediaPipe index. MoveNet does not include
 * MediaPipe's hand, face-mesh, heel, or foot_index landmarks; those
 * stay undefined and pose rules degrade gracefully.
 */
const MOVENET_NAME_TO_MP: Record<string, number> = {
  nose: MP.NOSE,
  left_eye: MP.LEFT_EYE,
  right_eye: MP.RIGHT_EYE,
  left_ear: MP.LEFT_EAR,
  right_ear: MP.RIGHT_EAR,
  left_shoulder: MP.LEFT_SHOULDER,
  right_shoulder: MP.RIGHT_SHOULDER,
  left_elbow: MP.LEFT_ELBOW,
  right_elbow: MP.RIGHT_ELBOW,
  left_wrist: MP.LEFT_WRIST,
  right_wrist: MP.RIGHT_WRIST,
  left_hip: MP.LEFT_HIP,
  right_hip: MP.RIGHT_HIP,
  left_knee: MP.LEFT_KNEE,
  right_knee: MP.RIGHT_KNEE,
  left_ankle: MP.LEFT_ANKLE,
  right_ankle: MP.RIGHT_ANKLE,
};

/**
 * Adapt a MoveNet pose into the MediaPipe-shaped Landmarks array used by
 * the rule engine.
 *
 * @param keypoints `poses[0].keypoints` from tfjs-models pose-detection.
 * @param minScore  Drop keypoints below this confidence.
 */
export function fromMoveNet(
  keypoints: MoveNetKeypoint[],
  minScore = 0.3,
): Landmarks {
  const out: Landmarks = new Array(33).fill(undefined);
  for (const kp of keypoints) {
    if (!kp?.name) continue;
    const idx = MOVENET_NAME_TO_MP[kp.name];
    if (idx === undefined) continue;
    if (kp.score !== undefined && kp.score < minScore) continue;
    out[idx] = { x: kp.x, y: kp.y, score: kp.score };
  }
  return out;
}

/**
 * Pull a set of required landmarks; returns `null` if any are missing so
 * the caller can mark its check as `skipped`.
 */
export function require<K extends string>(
  landmarks: Landmarks,
  spec: Record<K, number>,
): Record<K, Point> | null {
  const out = {} as Record<K, Point>;
  for (const key in spec) {
    const lm = landmarks[spec[key]];
    if (!lm) return null;
    out[key] = lm;
  }
  return out;
}

// Re-export Point for convenience.
export type { Point } from "./math";
