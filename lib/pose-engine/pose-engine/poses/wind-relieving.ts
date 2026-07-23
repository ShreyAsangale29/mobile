/** Wind-Relieving Pose [Pawanmuktasana] — port of yoga_poses.py lines 2256-2368 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const KNEE_BEND_MAX = 70;
const HIP_FLEXION_MAX = 75;
const HAND_KNEE_RATIO = 0.45;
const NOSE_KNEE_RATIO = 0.55;

export const validateWindRelieving: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    nose: MP.NOSE,
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("wind-relieving", "Wind-Relieving Pose");

  const lKneeBend = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rKneeBend = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const lHipFlex = calculateAngle(p.lShoulder, p.lHip, p.lKnee);
  const rHipFlex = calculateAngle(p.rShoulder, p.rHip, p.rKnee);

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const midKnee = midpoint(p.lKnee, p.rKnee);
  const torsoLen = calculateDistance(midShoulder, midHip);

  const lHandKnee = calculateDistance(p.lWrist, p.lKnee);
  const rHandKnee = calculateDistance(p.rWrist, p.rKnee);
  const noseToKnees = calculateDistance(p.nose, midKnee);

  c.check({
    id: "knees-bent",
    label: "Knees fully bent",
    passed: lKneeBend <= KNEE_BEND_MAX && rKneeBend <= KNEE_BEND_MAX,
    feedback: "Bend your knees completely",
  });
  c.check({
    id: "knees-to-chest",
    label: "Knees pulled to chest",
    passed: lHipFlex <= HIP_FLEXION_MAX && rHipFlex <= HIP_FLEXION_MAX,
    feedback: "Pull your knees closer to your chest",
  });
  c.check({
    id: "hands-on-shins",
    label: "Hands wrapped around shins",
    passed:
      lHandKnee <= HAND_KNEE_RATIO * torsoLen &&
      rHandKnee <= HAND_KNEE_RATIO * torsoLen,
    feedback: "Wrap your hands around your shins",
  });
  c.check({
    id: "head-to-knees",
    label: "Head lifted to knees",
    passed: noseToKnees <= NOSE_KNEE_RATIO * torsoLen,
    feedback: "Lift your head and bring your nose to your knees",
  });

  return c.finalize("wind-relieving", "Wind-Relieving Pose");
};
