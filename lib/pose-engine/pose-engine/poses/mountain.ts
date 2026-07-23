/**
 * Mountain / Upward Salute [Tadasana] — port of yoga_poses.py lines 2039-2154.
 * The Python file labels this "Mountain Pose" but uses Upward Salute rules
 * (arms reaching overhead with hands clasped). Kept as `mountain` for fidelity.
 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const STACK_RATIO = 0.2;
const LEG_STRAIGHT_MIN = 165;
const ARM_STRAIGHT_MIN = 155;
const ARMS_HIGH_RATIO = 0.6;
const WRISTS_TOGETHER_RATIO = 0.25;

export const validateMountain: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("mountain", "Mountain Pose");

  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const midAnkle = midpoint(p.lAnkle, p.rAnkle);
  const midWrist = midpoint(p.lWrist, p.rWrist);

  const torsoLen = calculateDistance(midShoulder, midHip);
  const wristDist = calculateDistance(p.lWrist, p.rWrist);
  const stackTol = STACK_RATIO * torsoLen;

  c.check({
    id: "stacked",
    label: "Shoulders, hips, ankles stacked",
    passed:
      Math.abs(midShoulder.x - midHip.x) <= stackTol &&
      Math.abs(midHip.x - midAnkle.x) <= stackTol,
    feedback: "Stand straight: stack shoulders over hips and ankles",
  });
  c.check({
    id: "legs-straight",
    label: "Legs straight",
    passed: lLeg >= LEG_STRAIGHT_MIN && rLeg >= LEG_STRAIGHT_MIN,
    feedback: "Straighten your legs completely",
  });
  c.check({
    id: "elbows-straight",
    label: "Elbows straight",
    passed: lArm >= ARM_STRAIGHT_MIN && rArm >= ARM_STRAIGHT_MIN,
    feedback: "Straighten your elbows",
  });
  c.check({
    id: "arms-overhead",
    label: "Arms reaching overhead",
    passed: midWrist.y <= midShoulder.y - ARMS_HIGH_RATIO * torsoLen,
    feedback: "Reach your hands higher towards the ceiling",
  });
  c.check({
    id: "hands-clasped",
    label: "Hands clasped together",
    passed: wristDist <= WRISTS_TOGETHER_RATIO * torsoLen,
    feedback: "Clasp your hands together overhead",
  });

  return c.finalize("mountain", "Mountain Pose");
};
