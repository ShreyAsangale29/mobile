/**
 * Jumping Jacks
 * Validates the full cycle of arms and legs moving in synchronization.
 */
import { calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

export const validateJumpingJacks: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
  });
  if (!p) return emptyResult("jumping-jacks", "Jumping Jacks");

  const wristDist = calculateDistance(p.lWrist, p.rWrist);
  const ankleDist = calculateDistance(p.lAnkle, p.rAnkle);
  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midWrist = midpoint(p.lWrist, p.rWrist);

  // 1. Check "Open" Phase (Arms high, feet wide)
  const isWide = ankleDist > 0.3; // Threshold for feet width
  const isArmsUp = midWrist.y < midShoulder.y; // Wrists above shoulders

  // 2. Check "Closed" Phase (Arms down, feet together)
  const isNarrow = ankleDist < 0.15;
  const isArmsDown = midWrist.y > midShoulder.y + 0.2;

  c.check({
    id: "active-movement",
    label: "Full range of motion",
    passed: (isWide && isArmsUp) || (isNarrow && isArmsDown),
    feedback: "Ensure your feet are wide when hands touch overhead, and feet together when hands are at your sides.",
  });

  return c.finalize("jumping-jacks", "Jumping Jacks");
};
