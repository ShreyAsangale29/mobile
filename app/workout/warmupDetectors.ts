import { POSE_LANDMARK, type Landmark } from "@/hooks/usePoseDetection";

// Below this visibility, a landmark isn't trusted enough to drive a
// classification — matches the threshold usePoseDetection itself uses
// for smoothing (MIN_VISIBILITY_TO_UPDATE = 0.5).
const MIN_VISIBILITY = 0.5;

function visible(lm?: Landmark) {
  return (lm?.visibility ?? 1) >= MIN_VISIBILITY;
}

function avg(...nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export type RepStage = "closed" | "open" | null;

const {
  LEFT_SHOULDER,
  RIGHT_SHOULDER,
  LEFT_ELBOW,
  RIGHT_ELBOW,
  LEFT_WRIST,
  RIGHT_WRIST,
  LEFT_HIP,
  RIGHT_HIP,
  LEFT_KNEE,
  RIGHT_KNEE,
  LEFT_ANKLE,
  RIGHT_ANKLE,
  LEFT_HEEL,
  RIGHT_HEEL,
  LEFT_FOOT_INDEX,
  RIGHT_FOOT_INDEX,
} = POSE_LANDMARK;

// NOTE on which of the 33 landmarks this file uses: face points (eyes,
// ears, mouth) and individual finger points (pinky/index/thumb) don't
// carry any signal for "are your arms raised and legs apart" — including
// them wouldn't make the classification more accurate, just noisier and
// more prone to being invisible/occluded. Everything from the shoulders
// down (16 of the 33 points) is used below. POSE_LANDMARK itself now names
// all 33, so any future move (or a body-visible/facing-camera check) can
// reach for the rest without needing another edit here.

// "Open" = feet spread wider than shoulder-width (checked via ankles,
// heels, AND foot-index together for a steadier read than one point
// alone) with knees also apart, AND the whole arm — elbow as well as
// wrist — raised above the shoulder line. "Closed" = feet and knees back
// together, arms back down by the hips. Anything else (mid-motion, or
// landmarks not confidently visible) returns null so the counter just
// holds its last known stage instead of flickering / miscounting on a
// noisy frame.
//
// Thresholds (1.4x / 1.2x / 1.1x) are a reasonable starting point, not
// tuned against real device footage — adjust if reps feel too strict or
// too loose in testing.
export function classifyJumpingJack(landmarks: Landmark[]): RepStage {
  const ls = landmarks[LEFT_SHOULDER];
  const rs = landmarks[RIGHT_SHOULDER];
  const le = landmarks[LEFT_ELBOW];
  const re = landmarks[RIGHT_ELBOW];
  const lw = landmarks[LEFT_WRIST];
  const rw = landmarks[RIGHT_WRIST];
  const lh = landmarks[LEFT_HIP];
  const rh = landmarks[RIGHT_HIP];
  const lk = landmarks[LEFT_KNEE];
  const rk = landmarks[RIGHT_KNEE];
  const la = landmarks[LEFT_ANKLE];
  const ra = landmarks[RIGHT_ANKLE];
  const lheel = landmarks[LEFT_HEEL];
  const rheel = landmarks[RIGHT_HEEL];
  const lfi = landmarks[LEFT_FOOT_INDEX];
  const rfi = landmarks[RIGHT_FOOT_INDEX];

  const required = [ls, rs, le, re, lw, rw, lh, rh, lk, rk, la, ra, lheel, rheel, lfi, rfi];
  if (!required.every(visible)) return null;

  const shoulderWidth = Math.hypot(ls.x - rs.x, ls.y - rs.y);
  const hipWidth = Math.hypot(lh.x - rh.x, lh.y - rh.y);
  const kneeSpread = Math.hypot(lk.x - rk.x, lk.y - rk.y);

  // Average three different foot-spread readings together (ankle, heel,
  // foot-index) rather than trusting any single point.
  const footSpread = avg(
    Math.hypot(la.x - ra.x, la.y - ra.y),
    Math.hypot(lheel.x - rheel.x, lheel.y - rheel.y),
    Math.hypot(lfi.x - rfi.x, lfi.y - rfi.y)
  );

  // Smaller y = higher up the frame, since normalized landmark coords run
  // 0 (top) to 1 (bottom). Requiring the elbow (not just the wrist) above
  // the shoulder line rules out a bent-elbow "hands near face" false read.
  const armsUp = lw.y < ls.y && rw.y < rs.y && le.y < ls.y && re.y < rs.y;
  const armsDown = lw.y > lh.y && rw.y > rh.y && le.y > ls.y && re.y > rs.y;

  const feetWide = footSpread > shoulderWidth * 1.4 && kneeSpread > hipWidth * 1.2;
  const feetTogether = footSpread < hipWidth * 1.1 && kneeSpread < hipWidth * 1.1;

  if (armsUp && feetWide) return "open";
  if (armsDown && feetTogether) return "closed";
  return null;
}

// "Open" = whole arm (elbow + wrist) raised above the shoulders. "Closed"
// = wrists back down by the hips.
export function classifyHandsUpDown(landmarks: Landmark[]): RepStage {
  const ls = landmarks[LEFT_SHOULDER];
  const rs = landmarks[RIGHT_SHOULDER];
  const le = landmarks[LEFT_ELBOW];
  const re = landmarks[RIGHT_ELBOW];
  const lw = landmarks[LEFT_WRIST];
  const rw = landmarks[RIGHT_WRIST];
  const lh = landmarks[LEFT_HIP];
  const rh = landmarks[RIGHT_HIP];

  const required = [ls, rs, le, re, lw, rw, lh, rh];
  if (!required.every(visible)) return null;

  const armsUp = lw.y < ls.y && rw.y < rs.y && le.y < ls.y && re.y < rs.y;
  const armsDown = lw.y > lh.y && rw.y > rh.y;

  if (armsUp) return "open";
  if (armsDown) return "closed";
  return null;
}

// Maps a warm-up move id to its classifier. Neck/arm rotation intentionally
// have no entry here — "completed a full rotation" isn't reliably
// distinguishable from a handful of keypoints, so those two stay on a
// plain second-based timer in WarmupOverlay instead.
export const REP_CLASSIFIERS: Record<
  string,
  (landmarks: Landmark[]) => RepStage
> = {
  "jumping-jack": classifyJumpingJack,
  "hands-up-down": classifyHandsUpDown,
};

export default function WarmupDetectorsRoute() {
  return null;
}