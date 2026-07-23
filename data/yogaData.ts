// data/yogaData.ts
// Central data source for the Yoga Selection screen.
//
// IMPORTANT: every pose `id` below must exactly match a real PoseId from
// lib/pose-engine (POSE_LIST) — that id is what gets passed straight
// through to camera.tsx as `?poses=id1,id2,...` and used to look up the
// live validator. Poses without a working detector are intentionally left
// out rather than shown as selectable but non-functional. The pose-engine
// currently supports exactly these 12:
//   tree, warrior-1, warrior-2, warrior-3, cobra, bow, archer, camel,
//   shoulder-stand, mountain, wind-relieving, thunderbolt
// `name` mirrors the pose-engine's POSE_LIST `label` field 1:1 so the name
// shown here matches what's shown later on the live camera screen.

export type Level = "Beginner" | "Intermediate" | "Advanced";

export type TagType =
  | "Balance"
  | "Strength"
  | "Flexibility"
  | "Core"
  | "Hip"
  | "Inversion"
  | "Solar"
  | "Breath"
  | "Back"
  | "Relax";

export interface YogaPose {
  id: string;
  name: string;
  level: Level;
  kcal: number;
  duration: number; // minutes
  tags: TagType[];
  /** key used to look up the matching SVG pose-figure component. Poses
   * without dedicated artwork fall back to PoseFigure's generic default. */
  figureKey: string;
}

export interface YogaCategory {
  id: "standing" | "sitting" | "supine" | "prone";
  label: string;
  emoji: string;
  accent: string; // hex accent color, matches HTML --a-accent per category
  poses: YogaPose[];
}

export const yogaCategories: YogaCategory[] = [
  {
    id: "standing",
    label: "Standing Asanas",
    emoji: "🌳",
    accent: "#34D399",
    poses: [
      {
        id: "mountain",
        name: "Mountain Pose",
        level: "Beginner",
        kcal: 15,
        duration: 3,
        tags: ["Balance", "Breath"],
        figureKey: "tadasana",
      },
      {
        id: "tree",
        name: "Tree Pose",
        level: "Beginner",
        kcal: 20,
        duration: 4,
        tags: ["Balance", "Strength"],
        figureKey: "vrksasana",
      },
      {
        id: "warrior-1",
        name: "Warrior I",
        level: "Intermediate",
        kcal: 35,
        duration: 5,
        tags: ["Strength", "Balance"],
        figureKey: "warrior1",
      },
      {
        id: "warrior-2",
        name: "Warrior II",
        level: "Intermediate",
        kcal: 35,
        duration: 5,
        tags: ["Strength", "Hip"],
        figureKey: "warrior2",
      },
      {
        id: "warrior-3",
        name: "Warrior III",
        level: "Advanced",
        kcal: 40,
        duration: 4,
        tags: ["Balance", "Strength"],
        figureKey: "warrior3",
      },
    ],
  },
  {
    id: "sitting",
    label: "Sitting & Kneeling Asanas",
    emoji: "🪷",
    accent: "#7D53FF",
    poses: [
      {
        id: "thunderbolt",
        name: "Thunderbolt Pose",
        level: "Beginner",
        kcal: 12,
        duration: 6,
        tags: ["Hip", "Breath"],
        figureKey: "thunderbolt",
      },
      {
        id: "camel",
        name: "Camel Pose",
        level: "Intermediate",
        kcal: 30,
        duration: 4,
        tags: ["Back", "Flexibility"],
        figureKey: "camel",
      },
      {
        id: "archer",
        name: "Archer Pose",
        level: "Intermediate",
        kcal: 25,
        duration: 4,
        tags: ["Flexibility", "Hip"],
        figureKey: "archer",
      },
    ],
  },
  {
    id: "supine",
    label: "Supine Asanas (Face-Up)",
    emoji: "🌙",
    accent: "#38BDF8",
    poses: [
      {
        id: "wind-relieving",
        name: "Wind-Relieving Pose",
        level: "Beginner",
        kcal: 15,
        duration: 4,
        tags: ["Core", "Relax"],
        figureKey: "wind-relieving",
      },
      {
        id: "shoulder-stand",
        name: "Shoulder Stand",
        level: "Advanced",
        kcal: 30,
        duration: 5,
        tags: ["Inversion", "Core"],
        figureKey: "shoulder-stand",
      },
    ],
  },
  {
    id: "prone",
    label: "Prone Asanas (Face-Down)",
    emoji: "🌅",
    accent: "#F97316",
    poses: [
      {
        id: "cobra",
        name: "Cobra Pose",
        level: "Beginner",
        kcal: 20,
        duration: 4,
        tags: ["Back", "Core"],
        figureKey: "bhujangasana",
      },
      {
        id: "bow",
        name: "Bow Pose",
        level: "Intermediate",
        kcal: 30,
        duration: 4,
        tags: ["Back", "Flexibility"],
        figureKey: "dhanurasana",
      },
    ],
  },
];

export const LEVEL_COLOR: Record<Level, string> = {
  Beginner: "#10B981",
  Intermediate: "#F97316",
  Advanced: "#EC4899",
};

export const TAG_STYLE: Record<TagType, { bg: string; border: string; color: string }> = {
  Balance: { bg: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.3)", color: "#34D399" },
  Strength: { bg: "rgba(125,83,255,0.14)", border: "rgba(125,83,255,0.3)", color: "#B59BFF" },
  Flexibility: { bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)", color: "#7DD3FC" },
  Core: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", color: "#34D399" },
  Hip: { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", color: "#FB923C" },
  Inversion: { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)", color: "#F472B6" },
  Solar: { bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.3)", color: "#FCD34D" },
  Breath: { bg: "rgba(45,212,191,0.12)", border: "rgba(45,212,191,0.3)", color: "#5EEAD4" },
  Back: { bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", color: "#C4B5FD" },
  Relax: { bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)", color: "#7DD3FC" },
};

/** Chakra dot order + short labels, used by the Chakra Balance bar */
export const CHAKRA_ORDER: { id: YogaCategory["id"]; label: string }[] = [
  { id: "standing", label: "Stand" },
  { id: "sitting", label: "Sit" },
  { id: "supine", label: "Supine" },
  { id: "prone", label: "Prone" },
];