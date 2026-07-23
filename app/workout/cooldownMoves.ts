export type CooldownMove = {
  id: string;
  label: string;
  instruction: string;
  kind: "timed";
  durationSeconds: number;
};

// Default beginner cool-down routine. Kept as data so it's easy to reorder,
// retime, or extend with new moves later without touching the session
// logic or the avatar animation code.
export const DEFAULT_COOLDOWN_MOVES: CooldownMove[] = [
  {
    id: "supine-twist",
    label: "Supine Spinal Twist",
    instruction: "Lie on your back, bring your knees to your chest, and lower them to one side while keeping shoulders flat.",
    kind: "timed",
    durationSeconds: 3,
  },
  {
    id: "viparita-karani",
    label: "Legs-Up-the-Wall",
    instruction: "Lie on your back with your hips close to the wall, extending your legs straight up the wall.",
    kind: "timed",
    durationSeconds: 3,
  },
  {
    id: "shavasana",
    label: "Corpse Pose",
    instruction: "Lie flat on your back, legs spread slightly, arms at your sides with palms up. Breathe deeply and relax.",
    kind: "timed",
    durationSeconds: 3,
  },
];

export default function CooldownMovesRoute() {
  return null;
}
