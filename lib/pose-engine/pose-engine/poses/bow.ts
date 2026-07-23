/** Bow Pose [Dhanurasana] — port of yoga_poses.py lines 1172-1276 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const ARM_TAUT_MIN = 140;
const GRAB_RATIO = 0.30;
const CHEST_LIFT_RATIO = 0.15;

export const validateBow: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("bow", "Bow Pose");

  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);

  const lGrab = calculateDistance(p.lWrist, p.lAnkle);
  const rGrab = calculateDistance(p.rWrist, p.rAnkle);

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const torsoLen = calculateDistance(midShoulder, midHip);

  c.check({
    id: "grab-ankles",
    label: "Hands hold both ankles",
    passed: lGrab <= GRAB_RATIO * torsoLen && rGrab <= GRAB_RATIO * torsoLen,
    feedback: "Reach back and hold both ankles",
  });
  c.check({
    id: "chest-lifted",
    label: "Chest lifted",
    passed: midShoulder.y <= midHip.y - CHEST_LIFT_RATIO * torsoLen,
    feedback: "Lift your chest higher off the floor",
  });
  c.check({
    id: "arms-taut",
    label: "Arms taut",
    passed: lArm >= ARM_TAUT_MIN && rArm >= ARM_TAUT_MIN,
    feedback: "Let your legs pull your arms straight",
  });

  return c.finalize("bow", "Bow Pose");
};
