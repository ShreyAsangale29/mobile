/**
 * Supine Spinal Twist / Supta Matsyendrasana
 * Validates shoulders are grounded while legs are twisted to one side.
 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const GROUNDED_TOLERANCE = 0.15; // How much shoulders can "lift"
const TWIST_ANGLE_MIN = 45;      // Minimum knee-to-hip-to-shoulder angle for a twist

export const validateSupineTwist: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
  });
  if (!p) return emptyResult("supine-twist", "Supine Spinal Twist");

  // 1. Check Shoulders are grounded (should remain mostly level)
  // In a proper twist, both shoulders should touch the mat
  c.check({
    id: "shoulders-grounded",
    label: "Both shoulders on the mat",
    passed: Math.abs(p.lShoulder.y - p.rShoulder.y) < GROUNDED_TOLERANCE,
    feedback: "Keep both shoulders grounded on the floor",
  });

  // 2. Check for the Twist (Knee is offset from the hip)
  // We check if the knees have moved horizontally relative to the hip center
  const midHip = midpoint(p.lHip, p.rHip);
  const kneeDist = Math.abs(p.lKnee.x - midHip.x);
  
  c.check({
    id: "in-twist",
    label: "Spine is twisted",
    passed: kneeDist > 0.1, // Needs a threshold to ensure they aren't just in center
    feedback: "Guide your knees across your body",
  });

  return c.finalize("supine-twist", "Supine Spinal Twist");
};
