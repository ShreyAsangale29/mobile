import type { CheckResult, PoseId, PoseResult } from "./types";

/**
 * Lightweight builder used by every pose validator.
 * Encapsulates the boilerplate around tracking passed/failed/skipped checks.
 */
export class Checker {
  private checks: CheckResult[] = [];

  /** Record a check that ran. */
  check(input: {
    id: string;
    label: string;
    passed: boolean;
    feedback?: string;
  }): void {
    this.checks.push({
      id: input.id,
      label: input.label,
      passed: input.passed,
      feedback: input.passed ? undefined : input.feedback,
    });
  }

  /** Record a check that couldn't run because a landmark was missing. */
  skip(input: { id: string; label: string }): void {
    this.checks.push({
      id: input.id,
      label: input.label,
      passed: false,
      skipped: true,
    });
  }

  finalize(poseId: PoseId, poseLabel: string): PoseResult {
    const ran = this.checks.filter((c) => !c.skipped);
    const passed = ran.filter((c) => c.passed);
    const ok = ran.length > 0 && passed.length === ran.length;
    const score = ran.length === 0 ? 0 : passed.length / ran.length;
    const feedback = this.checks
      .filter((c) => !c.passed && !c.skipped && c.feedback)
      .map((c) => c.feedback!);
    return {
      poseId,
      poseLabel,
      ok,
      score,
      checks: this.checks,
      feedback,
    };
  }
}

/** Helper for the "no person detected" case. */
export function emptyResult(poseId: PoseId, poseLabel: string): PoseResult {
  return {
    poseId,
    poseLabel,
    ok: false,
    score: 0,
    checks: [],
    feedback: ["Step into the frame so the camera can see you"],
  };
}
