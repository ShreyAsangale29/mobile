/**
 * Public entry for the pose engine.
 *
 * Usage (works the same in React Native and the browser):
 *
 *   import { POSE_REGISTRY, fromMoveNet } from "@/lib/pose-engine";
 *
 *   const landmarks = fromMoveNet(poses[0].keypoints);
 *   const result = POSE_REGISTRY["tree"](landmarks, { width, height });
 *   if (result.ok) showSuccess(); else showFeedback(result.feedback);
 */

export * from "./math";
export * from "./types";
export * from "./landmarks";
export { Checker, emptyResult } from "./result";
export { POSE_REGISTRY, POSE_LIST } from "./poses";
export type { PoseMeta } from "./poses";
