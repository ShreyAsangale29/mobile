import type { EngineResult } from "@/lib/exercise-engine/types/EngineResult";

const ERROR_SPEECH: Record<string, string> = {
  ERR_NO_POSE: "I can't see you clearly. Step back into frame.",

  ERR_SQUAT_NOT_VERTICAL: "Keep your body more upright.",
  ERR_SQUAT_SHALLOW: "Go a little deeper.",

  ERR_PUSHUP_NOT_HORIZONTAL: "Turn sideways so I can see your push-up form.",
  ERR_PUSHUP_SHALLOW: "Lower your chest more before pushing back up.",
  ERR_PUSHUP_BODY_ALIGNMENT: "Keep your body in a straight line.",

  ERR_PLANK_NOT_HORIZONTAL: "Turn sideways so I can see your plank position.",
  ERR_PLANK_ALIGNMENT: "Straighten your body into one line.",
  ERR_PLANK_HIP_LOW: "Lift your hips up a little.",
  ERR_PLANK_HIP_HIGH: "Lower your hips down a little.",

  ERR_DEADLIFT_ROUNDED_BACK: "Keep your back straight, don't round it.",
  ERR_DEADLIFT_INCOMPLETE_HINGE: "Hinge further at your hips.",
  ERR_DEADLIFT_SQUATTING: "Keep your knees softer, this is a hip hinge.",

  ERR_LUNGE_SHALLOW: "Lower your back knee more.",
  ERR_LUNGE_TORSO_LEAN: "Keep your torso more upright.",
  ERR_LUNGE_KNEE_OVER_TOE: "Keep your front knee behind your toes.",
};

const GOOD_STAGE_SPEECH: Record<string, string> = {
  good: "Nice, hold that position.",
  down: "Good depth.",
};

/**
 * Turns a live EngineResult into a single spoken/displayed coaching line.
 * Prioritizes correcting an active error over praising good form.
 */
export function getCoachMessage(result: EngineResult | null): string | null {
  if (!result) return null;

  if (result.errors.length > 0) {
    const primary = result.errors[0];
    return ERROR_SPEECH[primary] ?? result.status;
  }

  const good = GOOD_STAGE_SPEECH[result.stage];
  if (good) return good;

  // Fall back to the engine's own status text (e.g. "Rep counted",
  // "Hold the push-up start position for 2 seconds.")
  return result.status || null;
}