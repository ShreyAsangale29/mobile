/** Warrior II [Veerbhadrasana II] — port of yoga_poses.py lines 526-638 */
import { calculateAngle } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const FRONT_LEG_MAX = 120;
const BACK_LEG_MIN = 155;
const ARM_LEVEL_RATIO = 0.25; // wrist Y within 0.25 * torso of shoulder Y
const LEAN_RATIO = 0.25;

export const validateWarrior2: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("warrior-2", "Warrior II");

  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const frontLeg = Math.min(lLeg, rLeg);
  const backLeg = Math.max(lLeg, rLeg);

  const midShoulderY = (p.lShoulder.y + p.rShoulder.y) / 2;
  const midHipY = (p.lHip.y + p.rHip.y) / 2;
  const torsoLen = Math.abs(midHipY - midShoulderY);

  const lArmDy = Math.abs(p.lWrist.y - p.lShoulder.y);
  const rArmDy = Math.abs(p.rWrist.y - p.rShoulder.y);

  const midShoulderX = (p.lShoulder.x + p.rShoulder.x) / 2;
  const midHipX = (p.lHip.x + p.rHip.x) / 2;
  const xLean = Math.abs(midShoulderX - midHipX);

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
    id: "arms-level",
    label: "Arms parallel to floor",
    passed:
      lArmDy <= ARM_LEVEL_RATIO * torsoLen &&
      rArmDy <= ARM_LEVEL_RATIO * torsoLen,
    feedback: "Keep both arms parallel to the floor",
  });
  c.check({
    id: "torso-upright",
    label: "Torso upright",
    passed: xLean <= LEAN_RATIO * torsoLen,
    feedback: "Keep torso upright, don't lean forward",
  });

  return c.finalize("warrior-2", "Warrior II");
};
