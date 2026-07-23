/**
 * Viparita Karani / Legs-Up-the-Wall Pose
 * Validates hips are grounded and legs are extended vertically.
 */
import { calculateAngle, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const VERTICAL_TOLERANCE = 0.2; // Tolerance for x-axis alignment of legs
const NINETY_DEGREE_TOLERANCE = 15; // Degrees of deviation from 90°

export const validateViparitaKarani: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
  });
  if (!p) return emptyResult("viparita-karani", "Viparita Karani");

  const midHip = midpoint(p.lHip, p.rHip);
  const midAnkle = midpoint(p.lAnkle, p.rAnkle);

  // 1. Check if legs are vertical above hips
  // The ankles should be roughly in line with the hips on the x-axis
  c.check({
    id: "legs-vertical",
    label: "Legs are vertical",
    passed: Math.abs(midAnkle.x - midHip.x) < VERTICAL_TOLERANCE,
    feedback: "Extend your legs straight up towards the ceiling",
  });

  // 2. Check for inversion angle (Torso to leg angle)
  // We use the angle between the shoulder-hip line and the hip-knee line
  const lAngle = calculateAngle(p.lShoulder, p.lHip, p.lKnee);
  const rAngle = calculateAngle(p.rShoulder, p.rHip, p.rKnee);
  
  c.check({
    id: "hips-aligned",
    label: "Legs are perpendicular to torso",
    passed: 
      Math.abs(lAngle - 90) < NINETY_DEGREE_TOLERANCE && 
      Math.abs(rAngle - 90) < NINETY_DEGREE_TOLERANCE,
    feedback: "Ensure your legs are at a 90-degree angle to your torso",
  });

  return c.finalize("viparita-karani", "Viparita Karani");
};
