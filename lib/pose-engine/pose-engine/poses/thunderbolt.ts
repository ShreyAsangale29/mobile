/** Thunderbolt Pose [Vajrasana] — port of yoga_poses.py lines 2469-2573 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const KNEE_BEND_MAX = 60;
const TORSO_LEAN_RATIO = 0.25;
const HAND_KNEE_RATIO = 0.45;

export const validateThunderbolt: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("thunderbolt", "Thunderbolt Pose");

  const lKneeBend = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rKneeBend = calculateAngle(p.rHip, p.rKnee, p.rAnkle);

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const torsoLen = calculateDistance(midShoulder, midHip);
  const torsoLean = Math.abs(midShoulder.x - midHip.x);

  const lHandKnee = calculateDistance(p.lWrist, p.lKnee);
  const rHandKnee = calculateDistance(p.rWrist, p.rKnee);

  c.check({
    id: "sit-on-heels",
    label: "Sitting on heels",
    passed: lKneeBend <= KNEE_BEND_MAX && rKneeBend <= KNEE_BEND_MAX,
    feedback: "Sit completely down on your heels",
  });
  c.check({
    id: "spine-straight",
    label: "Spine straight",
    passed: torsoLean <= TORSO_LEAN_RATIO * torsoLen,
    feedback: "Sit up straight; stack shoulders over hips",
  });
  c.check({
    id: "hands-on-knees",
    label: "Hands on knees",
    passed:
      lHandKnee <= HAND_KNEE_RATIO * torsoLen &&
      rHandKnee <= HAND_KNEE_RATIO * torsoLen,
    feedback: "Rest your hands down on your knees",
  });

  return c.finalize("thunderbolt", "Thunderbolt Pose");
};
