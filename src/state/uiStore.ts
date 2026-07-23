import { create } from "zustand";

export type Mood = "calm" | "focus" | "energetic" | "achievement" | "recovery";

interface UIState {
  mood: Mood;
  intensity: number;
  aiCoachMessage: string;
  aiCoachAction: string | null;
}

interface UIStore {
  state: UIState;
  setMood: (mood: Mood) => void;
  setIntensity: (intensity: number) => void;
  setAICoachMessage: (message: string) => void;
  setAICoachAction: (action: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  state: {
    mood: "calm",
    intensity: 0.6,
    aiCoachMessage: "",
    aiCoachAction: null,
  },
  setMood: (mood) => set((s) => ({ state: { ...s.state, mood } })),
  setIntensity: (intensity) => set((s) => ({ state: { ...s.state, intensity } })),
  setAICoachMessage: (message) => set((s) => ({ state: { ...s.state, aiCoachMessage: message } })),
  setAICoachAction: (action) => set((s) => ({ state: { ...s.state, aiCoachAction: action } })),
}));