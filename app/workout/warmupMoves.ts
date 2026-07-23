export type WarmupMove = {
  id: string;
  label: string;
  instruction: string;
  kind: "timed" | "reps";
  durationSeconds?: number;
  targetReps?: number;
};

// Default beginner warm-up routine. Kept as data so it's easy to reorder,
// retime, or extend with new moves later without touching the session
// logic or the avatar animation code.
export const DEFAULT_WARMUP_MOVES: WarmupMove[] = [
  {
    id: "jumping-jack",
    label: "Jumping Jacks",
    instruction: "Jump your feet out while raising your arms overhead, then back in.",
    kind: "reps",
    targetReps: 3,
  },
  {
    id: "hands-up-down",
    label: "Hands Up & Down",
    instruction: "Raise both arms straight overhead, then lower them back to your sides.",
    kind: "reps",
    targetReps: 3,
  },
  {
    id: "neck-rotation",
    label: "Neck Rotation",
    instruction: "Slowly roll your head in a full circle, then reverse direction.",
    kind: "timed",
    durationSeconds: 3,
  },
  {
    id: "arm-rotation",
    label: "Arm Rotation",
    instruction: "Circle both arms forward, then backward, keeping them extended.",
    kind: "timed",
    durationSeconds: 3,
  },
];

export default function WarmupMovesRoute() {
  return null;
}