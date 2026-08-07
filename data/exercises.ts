// data/exercises.ts
//
// Trimmed to only the exercises that have an actual working detection
// engine behind them (see lib/exercise-engine/rep-counter/*.ts and
// hooks/exerciseMapping.ts's matchExerciseType). Anything without a
// matching engine has been removed rather than shown with a
// "manual tracking" fallback, to keep the selection list honest about
// what the app can actually detect right now.
//
// `info` and `steps` power the pre-workout preview screen
// (WorkoutPreviewScreen.tsx) — keep these in sync if you add exercises.

export type ExerciseMeta = {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  kcal: number;
  tags: string[];
  color: string;
  info: string;
  steps: string[];
  image?: any;
};

export const exercises: ExerciseMeta[] = [
  // ── Beginner ─────────────────────────────────────────────────────────
  {
    id: "pushups",
    name: "Pushups",
    difficulty: "Beginner",
    kcal: 60,
    tags: ["Chest", "Arms"],
    color: "#38BDF8",
    info: "A classic bodyweight press that builds chest, shoulder, and triceps strength.",
    steps: [
      "Start in a high plank with hands slightly wider than shoulders.",
      "Keep your body in one straight line from head to heels.",
      "Lower your chest until your elbows reach about 90 degrees.",
      "Push back up to the starting position with control.",
    ],
    image: require("../assets/images/exercises/pushups.png"),
  },
  {
    id: "plank",
    name: "Plank Hold",
    difficulty: "Beginner",
    kcal: 50,
    tags: ["Core", "Back"],
    color: "#10B981",
    info: "A static core hold that builds full-body stability — tracked by time held, not reps.",
    steps: [
      "Rest on your forearms and toes, elbows under shoulders.",
      "Keep hips level — not sagging down or piked up.",
      "Engage your core and glutes to keep your body in one line.",
      "Hold the position while breathing steadily.",
    ],
    // image: require("../assets/images/exercises/plank.png"), // TODO: file failed AAPT compile, replace with a valid PNG
  },
  {
    id: "lunges",
    name: "Lunges",
    difficulty: "Beginner",
    kcal: 70,
    tags: ["Legs", "Glutes"],
    color: "#EC4899",
    info: "A single-leg movement that strengthens the quads, glutes, and improves balance.",
    steps: [
      "Stand tall, then step one foot forward into a long stride.",
      "Lower your back knee toward the floor, front knee over your ankle.",
      "Keep your torso upright throughout the movement.",
      "Push back up through your front heel to standing.",
    ],
    image: require("../assets/images/exercises/lunges.png"),
  },

  // ── Intermediate ─────────────────────────────────────────────────────
  {
    id: "squats",
    name: "Squats",
    difficulty: "Intermediate",
    kcal: 80,
    tags: ["Legs", "Glutes"],
    color: "#8B5CF6",
    info: "A foundational lower-body movement that builds quads, glutes, and hamstrings.",
    steps: [
      "Stand with feet shoulder-width apart, chest up.",
      "Push your hips back and bend your knees to lower down.",
      "Go down until your thighs are roughly parallel to the floor.",
      "Drive through your heels to stand back up.",
    ],
    // image: require("../assets/images/exercises/squats.png"), // TODO: file failed AAPT compile, replace with a valid PNG
  },

  // ── Advanced ─────────────────────────────────────────────────────────
  {
    id: "deadlift",
    name: "Deadlift",
    difficulty: "Advanced",
    kcal: 120,
    tags: ["Back", "Legs"],
    color: "#F97316",
    info: "A hip-hinge movement that builds the posterior chain — back, glutes, and hamstrings.",
    steps: [
      "Stand with feet hip-width apart, the weight close to your shins.",
      "Hinge at your hips and bend your knees slightly to grip the weight.",
      "Keep your back flat as you stand up, driving through your heels.",
      "Lower back down with control by hinging at the hips again.",
    ],
    image: require("../assets/images/exercises/deadlift.png"),
  },
  {
    id: "pistol_squat",
    name: "Pistol Squat",
    difficulty: "Advanced",
    kcal: 110,
    tags: ["Legs", "Core"],
    color: "#EC4899",
    info: "A single-leg squat that demands significant strength, balance, and mobility.",
    steps: [
      "Stand on one leg with the other extended forward.",
      "Lower down slowly, keeping your extended leg off the floor.",
      "Go as deep as your mobility allows, chest up.",
      "Push through your standing heel to return to standing.",
    ],
    // image: require("../assets/images/exercises/pistol_squat.png"), // TODO: file failed AAPT compile, replace with a valid PNG
  },
];