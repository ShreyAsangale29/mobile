import type { ExerciseType } from "./useExerciseEngine";

export function matchExerciseType(idOrName: string): ExerciseType | null {
  const s = idOrName.toLowerCase();
  if (s.includes("push")) return "pushup";
  if (s.includes("plank")) return "plank";
  if (s.includes("lunge")) return "lunge";
  if (s.includes("deadlift")) return "deadlift";
  if (s.includes("squat")) return "squat"; // catches squats + pistol_squat
  return null;
}