// utils/poseAnalysis.ts
//
// Pure functions that turn a raw MediaPipe BlazePose landmark frame into the
// 6 human-readable setup signals the UI cares about:
//   faceVisible · bodyVisible · goodLighting · stablePosition · properDistance · postureDetected
//
// MediaPipe Pose / react-native-mediapipe returns 33 normalized landmarks per
// pose (x, y in [0,1] relative to frame, z = relative depth, visibility = confidence 0-1).
// Indices follow the standard BlazePose topology (same order exposed by
// `KnownPoseLandmarks` in react-native-mediapipe-posedetection).

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export const POSE_LANDMARK = {
  nose: 0,
  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,
  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,
  leftEar: 7,
  rightEar: 8,
  mouthLeft: 9,
  mouthRight: 10,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftPinky: 17,
  rightPinky: 18,
  leftIndex: 19,
  rightIndex: 20,
  leftThumb: 21,
  rightThumb: 22,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
} as const;

export interface SetupChecks {
  faceVisible: boolean;
  bodyVisible: boolean;
  goodLighting: boolean;
  stablePosition: boolean;
  properDistance: boolean;
  postureDetected: boolean;
}

export interface FrameQuality {
  /** 0-100, derived from average landmark luma sampled by the native layer (optional) */
  brightness?: number;
}

const VIS_THRESHOLD = 0.5;

function visible(lm: Landmark | undefined, threshold = VIS_THRESHOLD): boolean {
  if (!lm) return false;
  const v = lm.visibility ?? lm.presence ?? 0;
  return v >= threshold;
}

/** Face landmarks present & confident (adjusted for side profile if stage === "side") */
export function checkFaceVisible(landmarks: Landmark[], stage: "front" | "side" = "front"): boolean {
  const idx = [
    POSE_LANDMARK.nose,
    POSE_LANDMARK.leftEye,
    POSE_LANDMARK.rightEye,
    POSE_LANDMARK.leftEar,
    POSE_LANDMARK.rightEar,
  ];
  const seen = idx.filter((i) => visible(landmarks[i])).length;
  // Front requires nose + at least 2 eye/ear landmarks; Side requires nose + at least 1 visible landmark
  return visible(landmarks[POSE_LANDMARK.nose]) && (stage === "side" ? seen >= 2 : seen >= 3);
}

/** Shoulders, hips, and knees/ankles confidently visible -> full body in frame */
export function checkBodyVisible(landmarks: Landmark[], stage: "front" | "side" = "front"): boolean {
  const required = [
    POSE_LANDMARK.leftShoulder,
    POSE_LANDMARK.rightShoulder,
    POSE_LANDMARK.leftHip,
    POSE_LANDMARK.rightHip,
    POSE_LANDMARK.leftKnee,
    POSE_LANDMARK.rightKnee,
    POSE_LANDMARK.leftAnkle,
    POSE_LANDMARK.rightAnkle,
  ];
  const seen = required.filter((i) => visible(landmarks[i], 0.35)).length;
  // Side view allows 2 occluded joints on far side
  return stage === "side" ? seen >= 5 : seen >= 7;
}

/**
 * Distance heuristic:
 * Front mode: shoulder-width in normalized [0,1] coordinates.
 * Side mode: torso height (shoulder to hip) in normalized [0,1] coordinates.
 */
export function checkProperDistance(landmarks: Landmark[], stage: "front" | "side" = "front"): boolean {
  const ls = landmarks[POSE_LANDMARK.leftShoulder];
  const rs = landmarks[POSE_LANDMARK.rightShoulder];
  const lh = landmarks[POSE_LANDMARK.leftHip];
  const rh = landmarks[POSE_LANDMARK.rightHip];

  if (stage === "side") {
    // In side mode, check torso height or available shoulder/hip visibility
    if ((!visible(ls) && !visible(rs)) || (!visible(lh) && !visible(rh))) return false;
    const sY = (ls && visible(ls) ? ls.y : rs?.y) ?? 0;
    const hY = (lh && visible(lh) ? lh.y : rh?.y) ?? 1;
    const torsoHeight = Math.abs(hY - sY);
    return torsoHeight >= 0.15 && torsoHeight <= 0.55;
  }

  if (!visible(ls) || !visible(rs)) return false;
  const shoulderWidth = Math.abs(ls.x - rs.x);
  return shoulderWidth >= 0.12 && shoulderWidth <= 0.42;
}

/**
 * Stability is derived from frame-to-frame jitter of a reference point (nose),
 * smoothed over a short rolling window upstream in usePoseSetupChecks.
 */
export function checkStability(jitter: number): boolean {
  // jitter = average normalized displacement per frame over the rolling window
  return jitter < 0.012;
}

/** Lighting proxy: average landmark visibility/confidence as a stand-in for exposure quality */
export function checkGoodLighting(landmarks: Landmark[], brightness?: number): boolean {
  if (typeof brightness === "number") {
    return brightness >= 35 && brightness <= 92;
  }
  // fallback: confident landmarks imply the model could "see" the subject well
  const confidences = landmarks
    .map((l) => l.visibility ?? l.presence)
    .filter((v): v is number => typeof v === "number");
  if (confidences.length === 0) return false;
  const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  return avg >= 0.6;
}

/** Posture "locked" once body is visible, distance is right, and stability holds */
export function checkPostureDetected(
  bodyVisible: boolean,
  properDistance: boolean,
  stable: boolean,
  landmarks?: Landmark[],
  stage: "front" | "side" = "front"
): boolean {
  if (!bodyVisible || !properDistance || !stable) return false;
  if (!landmarks) return true;

  const ls = landmarks[POSE_LANDMARK.leftShoulder];
  const rs = landmarks[POSE_LANDMARK.rightShoulder];
  if (!visible(ls) || !visible(rs)) return true;

  const shoulderWidth = Math.abs(ls.x - rs.x);
  const lh = landmarks[POSE_LANDMARK.leftHip];
  const rh = landmarks[POSE_LANDMARK.rightHip];
  const torsoHeight = (lh && rh) ? Math.abs(((lh.y + rh.y)/2) - ((ls.y + rs.y)/2)) : 0.3;
  const ratio = torsoHeight > 0 ? shoulderWidth / torsoHeight : 0.5;

  if (stage === "front") {
    // Front mode expects wider shoulder separation relative to torso
    return ratio >= 0.28;
  } else {
    // Side mode expects narrower shoulder separation relative to torso
    return ratio < 0.38;
  }
}

export function deriveChecks(
  landmarks: Landmark[] | null,
  jitter: number,
  quality?: FrameQuality,
  stage: "front" | "side" = "front"
): SetupChecks {
  if (!landmarks || landmarks.length === 0) {
    return {
      faceVisible: false,
      bodyVisible: false,
      goodLighting: false,
      stablePosition: false,
      properDistance: false,
      postureDetected: false,
    };
  }

  const faceVisible = checkFaceVisible(landmarks, stage);
  const bodyVisible = checkBodyVisible(landmarks, stage);
  const properDistance = checkProperDistance(landmarks, stage);
  const stablePosition = checkStability(jitter);
  const goodLighting = checkGoodLighting(landmarks, quality?.brightness);
  const postureDetected = checkPostureDetected(bodyVisible, properDistance, stablePosition, landmarks, stage);

  return {
    faceVisible,
    bodyVisible,
    goodLighting,
    stablePosition,
    properDistance,
    postureDetected,
  };
}

/** Weighted overall accuracy score (0-100) shown in the AccuracyBanner ring */
export function computeAccuracy(checks: SetupChecks): number {
  const weights: Record<keyof SetupChecks, number> = {
    faceVisible: 15,
    bodyVisible: 25,
    goodLighting: 15,
    stablePosition: 15,
    properDistance: 20,
    postureDetected: 10,
  };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const earned = (Object.keys(checks) as (keyof SetupChecks)[]).reduce(
    (sum, key) => sum + (checks[key] ? weights[key] : 0),
    0
  );
  return Math.round((earned / total) * 100);
}
