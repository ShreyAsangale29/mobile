// store/sessionLogStore.ts
//
// Accumulates a result for each exercise/pose as the live session runs, so
// the achievement screen can summarize the whole session without camera.tsx
// having to pass a large object through router.push params.
//
// camera.tsx calls startSession(mode) once on mount, logItem(...) every
// time an exercise/pose is completed (see advanceWorkoutIndex /
// advanceYogaIndex / finishSession), and never calls reset() itself —
// achievement.tsx reads the finished log, then calls reset() once it's
// done persisting the summary (see lib/sessionHistory.ts), so a fresh
// session always starts from an empty log.
import { create } from "zustand";

export type SessionItemType = "reps" | "hold";

export interface SessionItemResult {
  /** exercise id or PoseId */
  id: string;
  name: string;
  /** sanskrit name (yoga) or difficulty label (workout), shown as a subtitle */
  subtitle?: string;
  kind: "workout" | "yoga";
  type: SessionItemType;
  /** reps completed, or seconds held */
  achieved: number;
  /** goal reps, or target hold seconds */
  target: number;
  /** 0-100 */
  formScore: number;
  kcal: number;
}

interface SessionLogState {
  mode: "workout" | "yoga" | null;
  startedAt: number | null;
  items: SessionItemResult[];
  startSession: (mode: "workout" | "yoga") => void;
  logItem: (item: SessionItemResult) => void;
  reset: () => void;
}

export const useSessionLogStore = create<SessionLogState>((set) => ({
  mode: null,
  startedAt: null,
  items: [],
  startSession: (mode) => set({ mode, startedAt: Date.now(), items: [] }),
  logItem: (item) => set((s) => ({ items: [...s.items, item] })),
  reset: () => set({ mode: null, startedAt: null, items: [] }),
}));