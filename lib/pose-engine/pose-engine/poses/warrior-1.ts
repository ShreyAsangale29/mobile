/** Warrior I [Veerbhadrasana I] — port of yoga_poses.py lines 316-428 */
import { calculateAngle } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const FRONT_LEG_MAX = 120; // sharper bend than this passes
const BACK_LEG_MIN = 155;
const ARM_STRAIGHT_MIN = 150;
const WRIST_HEIGHT_RATIO = 0.5; // wrists raised ≥ 0.5 * torso above shoulders

export const validateWarrior1: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("warrior-1", "Warrior I");

  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);

  const frontLeg = Math.min(lLeg, rLeg);
  const backLeg = Math.max(lLeg, rLeg);

  const midShoulderY = (p.lShoulder.y + p.rShoulder.y) / 2;
  const midHipY = (p.lHip.y + p.rHip.y) / 2;
  const torsoLen = Math.abs(midHipY - midShoulderY);
  const midWristY = (p.lWrist.y + p.rWrist.y) / 2;

  c.check({
    id: "front-knee",
    label: "Front knee bent",
    passed: frontLeg <= FRONT_LEG_MAX,
    feedback: "Bend your front knee deeper",
  });
  c.check({
    id: "back-leg",
    label: "Back leg straight",
    passed: backLeg >= BACK_LEG_MIN,
    feedback: "Straighten your back leg",
  });
  c.check({
    id: "arms-raised",
    label: "Arms raised overhead",
    passed: midWristY <= midShoulderY - WRIST_HEIGHT_RATIO * torsoLen,
    feedback: "Raise your arms higher above your head",
  });
  c.check({
    id: "elbows-straight",
    label: "Elbows straight",
    passed: lArm >= ARM_STRAIGHT_MIN && rArm >= ARM_STRAIGHT_MIN,
    feedback: "Straighten your elbows",
  });

  return c.finalize("warrior-1", "Warrior I");
};
