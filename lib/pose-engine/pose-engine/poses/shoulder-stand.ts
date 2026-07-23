/** Shoulder Stand [Sarvangasana] — port of yoga_poses.py lines 1819-1938 */
import { calculateAngle, calculateDistance, midpoint } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const STACK_RATIO = 0.35;
const CORE_STRAIGHT_MIN = 150;
const LEG_STRAIGHT_MIN = 160;
const SUPPORT_RATIO = 0.45;

export const validateShoulderStand: PoseValidator = (lm) => {
  const c = new Checker();
  const p = req(lm, {
    lShoulder: MP.LEFT_SHOULDER, rShoulder: MP.RIGHT_SHOULDER,
    lWrist: MP.LEFT_WRIST, rWrist: MP.RIGHT_WRIST,
    lHip: MP.LEFT_HIP, rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE, rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE, rAnkle: MP.RIGHT_ANKLE,
  });
  if (!p) return emptyResult("shoulder-stand", "Shoulder Stand");

  const midShoulder = midpoint(p.lShoulder, p.rShoulder);
  const midHip = midpoint(p.lHip, p.rHip);
  const midAnkle = midpoint(p.lAnkle, p.rAnkle);

  const lCore = calculateAngle(p.lShoulder, p.lHip, p.lKnee);
  const rCore = calculateAngle(p.rShoulder, p.rHip, p.rKnee);
  const lLeg = calculateAngle(p.lHip, p.lKnee, p.lAnkle);
  const rLeg = calculateAngle(p.rHip, p.rKnee, p.rAnkle);

  const torsoLen = calculateDistance(midShoulder, midHip);
  const lSupport = calculateDistance(p.lWrist, p.lHip);
  const rSupport = calculateDistance(p.rWrist, p.rHip);

  // Rule 1: inverted? Ankles must be above hips, hips above shoulders.
  const inverted = midAnkle.y < midHip.y && midHip.y < midShoulder.y;

  c.check({
    id: "inverted",
    label: "Body inverted",
    passed: inverted,
    feedback: "Lift your legs and hips high into the air",
  });

  // Remaining rules only meaningful once inverted (mirrors Python control flow).
  if (inverted) {
    const stackTol = STACK_RATIO * torsoLen;
    c.check({
      id: "stacked",
      label: "Ankles, hips, shoulders stacked",
      passed:
        Math.abs(midAnkle.x - midShoulder.x) <= stackTol &&
        Math.abs(midHip.x - midShoulder.x) <= stackTol,
      feedback: "Stack ankles directly over hips and shoulders",
    });
    c.check({
      id: "no-piking",
      label: "Hips extended (no piking)",
      passed: lCore >= CORE_STRAIGHT_MIN && rCore >= CORE_STRAIGHT_MIN,
      feedback: "Press your hips forward to straighten your body",
    });
    c.check({
      id: "legs-straight",
      label: "Legs straight",
      passed: lLeg >= LEG_STRAIGHT_MIN && rLeg >= LEG_STRAIGHT_MIN,
      feedback: "Straighten your knees pointing up",
    });
    c.check({
      id: "hands-support",
      label: "Hands supporting back",
      passed:
        lSupport <= SUPPORT_RATIO * torsoLen &&
        rSupport <= SUPPORT_RATIO * torsoLen,
      feedback: "Use your hands to support your lower back",
    });
  }

  return c.finalize("shoulder-stand", "Shoulder Stand");
};
