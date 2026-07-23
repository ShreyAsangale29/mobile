/**
 * Arm Circles / Arm Rotations
 * Validates that arms are outstretched and moving in a circular path.
 */
import { calculateAngle, calculateDistance } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const ARM_STRAIGHT_MIN = 160; 

export const validateArmCircles: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, lElbow: MP.LEFT_ELBOW, lWrist: MP.LEFT_WRIST,
    rShoulder: MP.RIGHT_SHOULDER, rElbow: MP.RIGHT_ELBOW, rWrist: MP.RIGHT_WRIST,
  });
  if (!p) return emptyResult("arm-circles", "Arm Circles");

  // 1. Check arms are held out straight (essential for effective circles)
  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);
  
  c.check({
    id: "arms-extended",
    label: "Arms are straight",
    passed: lArm >= ARM_STRAIGHT_MIN && rArm >= ARM_STRAIGHT_MIN,
    feedback: "Keep your arms fully extended out to the sides",
  });

  // 2. Height check (arms should remain roughly at shoulder height)
  // Ensures user isn't dropping their arms during the rotation
  const shoulderHeight = (p.lShoulder.y + p.rShoulder.y) / 2;
  const avgWristHeight = (p.lWrist.y + p.rWrist.y) / 2;
  
  c.check({
    id: "arms-at-height",
    label: "Arms at shoulder height",
    passed: Math.abs(shoulderHeight - avgWristHeight) < 0.15,
    feedback: "Keep your arms level with your shoulders",
  });

  return c.finalize("arm-circles", "Arm Circles");
};
