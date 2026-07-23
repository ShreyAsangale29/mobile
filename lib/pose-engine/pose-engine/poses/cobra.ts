/** Cobra Pose [Bhujangasana] — port of yoga_poses.py lines 959-1071 */
import { calculateAngle } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const ARM_LOCKED_MAX = 165;
const ARM_PUSH_MIN = 60;
const LEG_STRAIGHT_MIN = 155;

export const validateCobra: PoseValidator = (lm, frame) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lElbow: MP.LEFT_ELBOW, rElbow: MP.RIGHT_ELBOW,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("cobra", "Cobra Pose");

  const lArm = calculateAngle(p.lShoulder, p.lElbow, p.lWrist);
  const rArm = calculateAngle(p.rShoulder, p.rElbow, p.rWrist);
  const avgArm = (lArm + rArm) / 2;

  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);
  const avgLeg = (lLeg + rLeg) / 2;

  const avgShoulderY = (p.lShoulder.y + p.rShoulder.y) / 2;
  const avgHipY = (p.lHip.y + p.rHip.y) / 2;
  const avgAnkleY = (p.lAnkle.y + p.rAnkle.y) / 2;

  // Python used `h * 0.1` where h = frame height.
  const tolerance = frame.height * 0.1;

  c.check({
    id: "chest-lifted",
    label: "Chest lifted",
    passed: avgShoulderY <= avgHipY - tolerance * 0.5,
    feedback: "Lift your chest higher off the floor",
  });
  c.check({
    id: "hips-grounded",
    label: "Hips grounded",
    passed: avgHipY >= avgAnkleY - tolerance,
    feedback: "Keep your hips pressed into the floor",
  });
  c.check({
    id: "arms-bend",
    label: "Soft bend in elbows",
    passed: avgArm <= ARM_LOCKED_MAX && avgArm >= ARM_PUSH_MIN,
    feedback:
      avgArm > ARM_LOCKED_MAX
        ? "Keep a micro-bend in your elbows"
        : "Push up through your hands a bit more",
  });
  c.check({
    id: "legs-straight",
    label: "Legs straight & active",
    passed: avgLeg >= LEG_STRAIGHT_MIN,
    feedback: "Keep your legs straight and active",
  });

  return c.finalize("cobra", "Cobra Pose");
};
