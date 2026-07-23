import { useCallback, useEffect, useState } from "react";
import type { Landmark } from "@/hooks/usePoseDetection";
import { DEFAULT_COOLDOWN_MOVES, type CooldownMove } from "./cooldownMoves";
import { validateShavasana } from "@/lib/pose-engine/pose-engine/poses/corpsepose";
import { validateViparitaKarani } from "@/lib/pose-engine/pose-engine/poses/leguptothewall";
import { validateSupineTwist } from "@/lib/pose-engine/pose-engine/poses/supinespinetwist";

const POSE_VALIDATORS: Record<string, any> = {
  "shavasana": validateShavasana,
  "viparita-karani": validateViparitaKarani,
  "supine-twist": validateSupineTwist,
};

export function useCooldownSession(
  landmarks: Landmark[] | null,
  enabled: boolean,
  moves: CooldownMove[] = DEFAULT_COOLDOWN_MOVES
) {
  const [moveIndex, setMoveIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const move = moves[moveIndex] ?? null;

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);

  const target = move ? move.durationSeconds : 0;
  const count = secondsElapsed;

  // Run pose validation on the active move using pose engine
  useEffect(() => {
    if (!enabled || !landmarks || landmarks.length === 0 || !move) {
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
  }, [landmarks, move, enabled]);

  // Reset counters when move changes
  useEffect(() => {
    setSecondsElapsed(0);
  }, [moveIndex]);

  // Tick the timer for the active move
  useEffect(() => {
    if (!enabled || !move || isComplete) return;
    if (secondsElapsed >= target) return;
    const id = setTimeout(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearTimeout(id);
  }, [move, secondsElapsed, target, isComplete, enabled]);

  // Advance to next move or complete
  useEffect(() => {
    if (!enabled || !move || isComplete || count < target) return;
    const t = setTimeout(() => {
      if (moveIndex + 1 < moves.length) {
        setMoveIndex((i) => i + 1);
      } else {
        setIsComplete(true);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [count, target, move, moveIndex, moves.length, isComplete, enabled]);

  const skipMove = useCallback(() => {
    if (moveIndex + 1 < moves.length) {
      setMoveIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  }, [moveIndex, moves.length]);

  const skipAll = useCallback(() => setIsComplete(true), []);

  const reset = useCallback(() => {
    setMoveIndex(0);
    setIsComplete(false);
    setSecondsElapsed(0);
  }, []);

  return {
    move,
    moveIndex,
    totalMoves: moves.length,
    count,
    target,
    isComplete,
    skipMove,
    skipAll,
    feedback,
    score,
    reset,
  };
}

export default function UseCooldownSessionRoute() {
  return null;
}
