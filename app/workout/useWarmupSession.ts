import { useCallback, useEffect, useState } from "react";
import type { Landmark } from "@/hooks/usePoseDetection";
import { REP_CLASSIFIERS } from "./warmupDetectors";
import { useWarmupRepCounter } from "./useWarmupRepCounter";
import { DEFAULT_WARMUP_MOVES, type WarmupMove } from "./warmupMoves";
import { validateJumpingJacks } from "@/lib/pose-engine/pose-engine/poses/jumpingjack";
import { validateArmCircles } from "@/lib/pose-engine/pose-engine/poses/armrotation";
import { validateNeckRotation } from "@/lib/pose-engine/pose-engine/poses/neckrotation";

const POSE_VALIDATORS: Record<string, typeof validateJumpingJacks> = {
  "jumping-jack": validateJumpingJacks,
  "arm-rotation": validateArmCircles,
  "neck-rotation": validateNeckRotation,
};

export function useWarmupSession(
  landmarks: Landmark[] | null,
  moves: WarmupMove[] = DEFAULT_WARMUP_MOVES
) {
  const [moveIndex, setMoveIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const move = moves[moveIndex] ?? null;

  const classifier = move ? REP_CLASSIFIERS[move.id] ?? null : null;
  const { reps, stage, reset: resetReps } = useWarmupRepCounter(
    landmarks,
    classifier,
    move?.kind === "reps"
  );

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);

  const target = move
    ? move.kind === "reps"
      ? move.targetReps ?? 10
      : move.durationSeconds ?? 15
    : 0;
  const count = move?.kind === "reps" ? reps : secondsElapsed;

  // Run pose validation on the active move using migrated validators
  useEffect(() => {
    if (!landmarks || landmarks.length === 0 || !move) {
      setFeedback([]);
      setScore(0);
      return;
    }

    const validator = POSE_VALIDATORS[move.id];
    if (validator) {
      const result = validator(landmarks as any, { width: 640, height: 480 });
      setFeedback(result.feedback || []);
      setScore(Math.round(result.score * 100));
    } else {
      setFeedback([]);
      setScore(0);
    }
  }, [landmarks, move]);

  // Reset both counters whenever the move changes.
  useEffect(() => {
    resetReps();
    setSecondsElapsed(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveIndex]);

  // Tick the plain timer for timed moves only (rotations aren't detected).
  useEffect(() => {
    if (!move || move.kind !== "timed" || isComplete) return;
    if (secondsElapsed >= target) return;
    const id = setTimeout(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearTimeout(id);
  }, [move, secondsElapsed, target, isComplete]);

  // Advance to the next move (or finish) once the current one's target is
  // hit.
  useEffect(() => {
    if (!move || isComplete || count < target) return;
    const t = setTimeout(() => {
      if (moveIndex + 1 < moves.length) {
        setMoveIndex((i) => i + 1);
      } else {
        setIsComplete(true);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [count, target, move, moveIndex, moves.length, isComplete]);

  const skipMove = useCallback(() => {
    if (moveIndex + 1 < moves.length) {
      setMoveIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  }, [moveIndex, moves.length]);

  const skipAll = useCallback(() => setIsComplete(true), []);

  return {
    move,
    moveIndex,
    totalMoves: moves.length,
    count,
    target,
    stage, // "closed" | "open" — live, for the corner avatar to mirror
    isComplete,
    skipMove,
    skipAll,
    feedback,
    score,
  };
}

export default function UseWarmupSessionRoute() {
  return null;
}