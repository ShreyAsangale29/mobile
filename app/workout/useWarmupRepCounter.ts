import { useEffect, useRef, useState } from "react";
import type { Landmark } from "@/hooks/usePoseDetection";
import type { RepStage } from "./warmupDetectors";

// Counts a rep every time the classified pose cycles closed -> open ->
// closed. A classifier returning null (ambiguous/low-confidence frame)
// just holds the last known stage rather than resetting anything, so one
// noisy frame from vision-camera/MediaPipe doesn't cost a rep.
//
// Also returns the live `stage` itself (not just the rep count) so a
// caller — e.g. the corner avatar — can mirror the user's current
// position in real time, the same way exerciseResult.stage does for the
// main exercise engine.
export function useWarmupRepCounter(
  landmarks: Landmark[] | null,
  classify: ((landmarks: Landmark[]) => RepStage) | null,
  enabled: boolean
) {
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState<Exclude<RepStage, null>>("closed");
  const reachedOpenRef = useRef(false);

  useEffect(() => {
    if (!enabled || !classify || !landmarks || landmarks.length === 0) return;

    const nextStage = classify(landmarks);
    if (nextStage === null) return;

    if (nextStage === "open") {
      reachedOpenRef.current = true;
    } else if (nextStage === "closed" && reachedOpenRef.current) {
      reachedOpenRef.current = false;
      setReps((r) => r + 1);
    }
    setStage(nextStage);
  }, [landmarks, enabled, classify]);

  const reset = () => {
    setReps(0);
    setStage("closed");
    reachedOpenRef.current = false;
  };

  return { reps, stage, reset };
}

export default function UseWarmupRepCounterRoute() {
  return null;
}