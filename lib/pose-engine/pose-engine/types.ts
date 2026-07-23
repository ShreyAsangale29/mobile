import type { Point } from "./math";

/** Sparse landmark array, indexed by MediaPipe Pose IDs (0..32). */
export type Landmarks = (Point | undefined)[];

export interface FrameSize {
  width: number;
  height: number;
}

export interface CheckResult {
  /** Stable id for UI keys. */
  id: string;
  /** Human label, e.g. "Front knee bend". */
  label: string;
  passed: boolean;
  /** Coaching cue shown when the check fails. */
  feedback?: string;
  /** True when a required landmark was missing on this frame. */
  skipped?: boolean;
}

export interface PoseResult {
  poseId: PoseId;
  poseLabel: string;
  /** All required checks passed (skipped checks don't pass or fail). */
  ok: boolean;
  /** Fraction of non-skipped checks that passed (0..1). */
  score: number;
  checks: CheckResult[];
  /** Concatenated feedback for failed checks, in order. */
  feedback: string[];
}

export type PoseId =
  | "tree"
  | "warrior-1"
  | "warrior-2"
  | "warrior-3"
  | "cobra"
  | "bow"
  | "archer"
  | "camel"
  | "shoulder-stand"
  | "mountain"
  | "wind-relieving"
  | "thunderbolt"
  | "jumping-jacks"
  | "arm-circles"
  | "neck-rotation"
  | "shavasana"
  | "viparita-karani"
  | "supine-twist";

export type PoseValidator = (
  landmarks: Landmarks,
  frame: FrameSize,
) => PoseResult;
