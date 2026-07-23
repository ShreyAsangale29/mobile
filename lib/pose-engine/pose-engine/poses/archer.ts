/** Archer Pose [Akarna Dhanurasana] — port of yoga_poses.py lines 1377-1508 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const EXT_LEG_MIN = 150;
const EXT_ARM_MIN = 145;
const GRAB_RATIO = 0.35;
const PULL_RATIO = 0.6;

export const validateArcher: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("archer", "Archer Pose");

  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);

  // The straighter leg is the "extended" (bow-front) side.
  const leftIsExtended = lLeg > rLeg;
  const extLeg = leftIsExtended ? lLeg : rLeg;
  const extArm = leftIsExtended ? lArm : rArm;
  const extGrab = leftIsExtended
    ? calculateDistance(p.lWrist, p.lAnkle)
    : calculateDistance(p.rWrist, p.rAnkle);
  const bentGrab = leftIsExtended
    ? calculateDistance(p.rWrist, p.rAnkle)
    : calculateDistance(p.lWrist, p.lAnkle);
  const pullDist = leftIsExtended
    ? calculateDistance(p.rAnkle, p.rShoulder)
    : calculateDistance(p.lAnkle, p.lShoulder);

  const torsoLen = calculateDistance(
    midpoint(p.lShoulder, p.rShoulder),
    midpoint(p.lHip, p.rHip),
  );

  c.check({
    id: "ext-leg",
    label: "Extended leg straight",
    passed: extLeg >= EXT_LEG_MIN,
    feedback: "Straighten your extended leg",
  });
  c.check({
    id: "ext-arm",
    label: "Reaching arm straight",
    passed: extArm >= EXT_ARM_MIN,
    feedback: "Straighten the arm reaching forward",
  });
  c.check({
    id: "ext-grab",
    label: "Grasping extended foot",
    passed: extGrab <= GRAB_RATIO * torsoLen,
    feedback: "Reach forward and grasp your extended foot",
  });
  c.check({
    id: "bent-grab",
    label: "Holding bent foot",
    passed: bentGrab <= GRAB_RATIO * torsoLen,
    feedback: "Hold your bent foot securely",
  });
  c.check({
    id: "pull-back",
    label: "Bent foot pulled to ear",
    passed: pullDist <= PULL_RATIO * torsoLen,
    feedback: "Pull your bent foot closer to your ear",
  });

  return c.finalize("archer", "Archer Pose");
};
