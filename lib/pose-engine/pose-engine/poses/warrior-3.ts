/** Warrior III [Veerbhadrasana III] — port of yoga_poses.py lines 735-861 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const LEG_STRAIGHT_MIN = 150;
const ARM_STRAIGHT_MIN = 150;
const Y_TOL_RATIO = 0.25;

export const validateWarrior3: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("warrior-3", "Warrior III");

  // Support leg = the one with the lower ankle (larger y in screen space).
  const leftIsSupport = p.lAnkle.y > p.rAnkle.y;
  const supportLeg = leftIsSupport
    ? calculateAngle(p.lHip, p.lKnee, p.lAnkle)
    : calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const raisedLeg = leftIsSupport
    ? calculateAngle(p.rHip, p.rKnee, p.rAnkle)
    : calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const raisedAnkle = leftIsSupport ? p.rAnkle : p.lAnkle;

  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const torsoLen = calculateDistance(midShoulder, midHip);
  const yTol = Y_TOL_RATIO * torsoLen;
  const midWristY = (p.lWrist.y + p.rWrist.y) / 2;

  c.check({
    id: "support-leg",
    label: "Standing leg straight",
    passed: supportLeg >= LEG_STRAIGHT_MIN,
    feedback: "Straighten your standing leg",
  });
  c.check({
    id: "raised-leg",
    label: "Raised leg straight",
    passed: raisedLeg >= LEG_STRAIGHT_MIN,
    feedback: "Straighten your raised leg",
  });
  c.check({
    id: "torso-parallel",
    label: "Torso parallel to floor",
    passed: Math.abs(midShoulder.y - midHip.y) <= yTol,
    feedback: "Lower chest to be parallel to the floor",
  });
  c.check({
    id: "leg-level",
    label: "Raised leg at hip level",
    passed: Math.abs(raisedAnkle.y - midHip.y) <= yTol,
    feedback: "Lift back leg higher to hip level",
  });
  c.check({
    id: "arms-straight",
    label: "Arms reaching forward",
    passed: lArm >= ARM_STRAIGHT_MIN && rArm >= ARM_STRAIGHT_MIN,
    feedback: "Straighten your arms forward",
  });
  c.check({
    id: "arms-horizontal",
    label: "Arms aligned with torso",
    passed: Math.abs(midWristY - midShoulder.y) <= yTol,
    feedback: "Align arms horizontally with your torso",
  });

  return c.finalize("warrior-3", "Warrior III");
};
