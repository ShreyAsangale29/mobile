/** Tree Pose [Vrikshasana] — port of yoga_poses.py lines 111-223 */
import { calculateAngle, calculateDistance } from "../math";
import { MP, require as req } from "../landmarks";
import { Checker, emptyResult } from "../result";
import type { PoseValidator } from "../types";

const STAND_LEG_MIN = 160; // standing leg straight
const BENT_LEG_MAX = 100; // raised leg bent
const WRIST_GAP_MAX_RATIO = 1.2; // wrist distance < 1.2 * shoulder width = "prayer"

export const validateTree: PoseValidator = (lm) => {
  const c = new Checker();
  const pts = req(lm, {
    lHip: MP.LEFT_HIP,
    rHip: MP.RIGHT_HIP,
    lKnee: MP.LEFT_KNEE,
    rKnee: MP.RIGHT_KNEE,
    lAnkle: MP.LEFT_ANKLE,
    rAnkle: MP.RIGHT_ANKLE,
    lShoulder: MP.LEFT_SHOULDER,
    rShoulder: MP.RIGHT_SHOULDER,
    lWrist: MP.LEFT_WRIST,
    rWrist: MP.RIGHT_WRIST,
  });
  if (!pts) return emptyResult("tree", "Tree Pose");

  // Pick standing vs raised leg by which ankle is lower on screen (larger y).
  const leftIsStanding = pts.lAnkle.y > pts.rAnkle.y;
  const standAngle = leftIsStanding
    ? calculateAngle(pts.lHip, pts.lKnee, pts.lAnkle)
    : calculateAngle(pts.rHip, pts.rKnee, pts.rAnkle);
  const bentAngle = leftIsStanding
    ? calculateAngle(pts.rHip, pts.rKnee, pts.rAnkle)
    : calculateAngle(pts.lHip, pts.lKnee, pts.lAnkle);

  const shoulderWidth = calculateDistance(pts.lShoulder, pts.rShoulder);
  const wristDist = calculateDistance(pts.lWrist, pts.rWrist);

  const prayer =
    wristDist < shoulderWidth * WRIST_GAP_MAX_RATIO &&
    pts.lShoulder.y < pts.lWrist.y &&
    pts.lWrist.y < pts.lHip.y &&
    pts.rShoulder.y < pts.rWrist.y &&
    pts.rWrist.y < pts.rHip.y;
  const raised =
    pts.lWrist.y < pts.lShoulder.y && pts.rWrist.y < pts.rShoulder.y;

  c.check({
    id: "standing-leg",
    label: "Standing leg straight",
    passed: standAngle >= STAND_LEG_MIN,
    feedback: "Straighten your standing leg",
  });
  c.check({
    id: "raised-leg",
    label: "Raised leg bent",
    passed: bentAngle <= BENT_LEG_MAX,
    feedback: "Bring your raised foot higher",
  });
  c.check({
    id: "hands",
    label: "Hands in prayer or overhead",
    passed: prayer || raised,
    feedback: "Bring hands to chest or above head",
  });

  return c.finalize("tree", "Tree Pose");
};
