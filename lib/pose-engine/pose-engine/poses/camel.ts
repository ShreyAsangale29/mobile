/** Camel Pose [Ustrasana] — port of yoga_poses.py lines 1609-1718 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const GRAB_RATIO = 0.35;
const THIGH_VERT_RATIO = 0.45;
const ARM_STRAIGHT_MIN = 140;

export const validateCamel: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("camel", "Camel Pose");

  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);

  const lGrab = calculateDistance(p.lWrist, p.lAnkle);
  const rGrab = calculateDistance(p.rWrist, p.rAnkle);

  const torsoLen = calculateDistance(
    midpoint(p.lShoulder, p.rShoulder),
    midpoint(p.lHip, p.rHip),
  );

  const lThigh = calculateDistance(p.lHip, p.lKnee);
  const rThigh = calculateDistance(p.rHip, p.rKnee);
  const lThighDx = Math.abs(p.lHip.x - p.lKnee.x);
  const rThighDx = Math.abs(p.rHip.x - p.rKnee.x);

  c.check({
    id: "grab-heels",
    label: "Hands on heels",
    passed: lGrab <= GRAB_RATIO * torsoLen && rGrab <= GRAB_RATIO * torsoLen,
    feedback: "Reach back and place your hands on your heels",
  });
  c.check({
    id: "thighs-vertical",
    label: "Thighs vertical",
    passed:
      lThighDx <= THIGH_VERT_RATIO * lThigh &&
      rThighDx <= THIGH_VERT_RATIO * rThigh,
    feedback: "Push your hips forward to keep thighs vertical",
  });
  c.check({
    id: "arms-straight",
    label: "Arms straight",
    passed: lArm >= ARM_STRAIGHT_MIN && rArm >= ARM_STRAIGHT_MIN,
    feedback: "Keep your arms straight as you lean back",
  });

  return c.finalize("camel", "Camel Pose");
};
