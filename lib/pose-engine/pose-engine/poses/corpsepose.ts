/**
 * Shavasana / Corpse Pose
 * Validates the user is lying flat, relaxed, and symmetrical.
 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const RELAXED_LIMB_MIN = 160; // Limbs should be straight but not rigid
const SYMMETRY_TOLERANCE = 0.3; // Allow for slight natural asymmetry

export const validateShavasana: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("shavasana", "Shavasana");

  // Calculate body orientation
  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const midAnkle = midpoint(p.lAnkle, p.rAnkle);
  
  // 1. Check if the body is lying down (Y-coordinates should be close)
  const verticalSpread = Math.abs(midShoulder.y - midAnkle.y);
  
  c.check({
    id: "lying-flat",
    label: "Body is lying flat",
    passed: verticalSpread < 0.2, // Y-difference threshold
    feedback: "Lie flat on your back",
  });

  // 2. Check for limb extension
  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  
  c.check({
    id: "legs-extended",
    label: "Legs are relaxed and extended",
    passed: lLeg >= RELAXED_LIMB_MIN && rLeg >= RELAXED_LIMB_MIN,
    feedback: "Extend your legs comfortably",
  });

  // 3. Symmetry check (shoulders and hips should be horizontal)
  c.check({
    id: "symmetrical",
    label: "Body is symmetrical",
    passed: Math.abs(p.lShoulder.y - p.rShoulder.y) < SYMMETRY_TOLERANCE &&
            Math.abs(p.lHip.y - p.rHip.y) < SYMMETRY_TOLERANCE,
    feedback: "Ensure your shoulders and hips are level",
  });

  return c.finalize("shavasana", "Shavasana");
};
