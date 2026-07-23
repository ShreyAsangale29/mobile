/**
 * Neck Rotation / Neck Rolls
 * Validates the smooth, circular movement of the head relative to the shoulders.
 */
import { calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const STABLE_SHOULDER_TOLERANCE = 0.05;

export const validateNeckRotation: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    nose: MP.NOSE,
    lShoulder: MP.LEFT_SHOULDER,
    rShoulder: MP.RIGHT_SHOULDER,
  });
  if (!p) return emptyResult("neck-rotation", "Neck Rotation");

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);

  // 1. Check Shoulder Stability
  // The shoulders should remain relatively level throughout the neck rotation
  c.check({
    id: "shoulders-stable",
    label: "Shoulders are stable",
    passed: Math.abs(p.lShoulder.y - p.rShoulder.y) < STABLE_SHOULDER_TOLERANCE,
    feedback: "Keep your shoulders relaxed and level",
  });

  // 2. Check Head Movement
  // We check the distance of the nose from the mid-shoulder point.
  // In a rotation, this distance will fluctuate in a predictable pattern.
  const noseToShoulderDist = calculateDistance(p.nose, midShoulder);
  
  c.check({
    id: "neck-moving",
    label: "Head is rotating",
    passed: noseToShoulderDist > 0.05, // Threshold to ensure head isn't static
    feedback: "Gently roll your head in a circular motion",
  });

  return c.finalize("neck-rotation", "Neck Rotation");
};
