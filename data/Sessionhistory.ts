// lib/sessionHistory.ts
//
// Day-over-day comparison + streak tracking + coaching suggestions for the
// post-session achievement screen. Persisted locally via AsyncStorage —
// there's no backend/API in what's been shared for this app, so this is a
// self-contained, per-device implementation. If a real backend history
// endpoint exists, swap loadLastSnapshot/saveSnapshot's bodies for API
// calls without touching the comparison/suggestion logic below them.
//
// Requires @react-native-async-storage/async-storage. If it's not already
// a dependency: `npx expo install @react-native-async-storage/async-storage`

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SessionItemResult } from "@/data/Sessionlogstore";

const LAST_SNAPSHOT_KEY = "@aurafit/session-history/last-snapshot";
const STREAK_KEY = "@aurafit/session-history/streak";

export interface StoredSessionSnapshot {
  date: string; // "YYYY-MM-DD"
  mode: "workout" | "yoga";
  totalDurationSeconds: number;
  totalKcal: number;
  avgFormScore: number;
  items: SessionItemResult[];
}

interface StreakState {
  count: number;
  lastDate: string | null;
}

function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/** The previous session's snapshot, if any (read BEFORE saving today's). */
export async function loadLastSnapshot(): Promise<StoredSessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as StoredSessionSnapshot) : null;
  } catch {
    return null;
  }
}

/**
 * Saves today's snapshot (overwriting the previous one — comparisons are
 * always "vs the last session", not a full history) and updates the streak
 * counter. Call once, after reading loadLastSnapshot() for comparison.
 */
export async function saveSnapshotAndUpdateStreak(
  snapshot: Omit<StoredSessionSnapshot, "date">
): Promise<{ streak: number }> {
  const today = todayKey();

  try {
    const rawStreak = await AsyncStorage.getItem(STREAK_KEY);
    const streakState: StreakState = rawStreak
      ? JSON.parse(rawStreak)
      : { count: 0, lastDate: null };

    let nextCount: number;
    if (streakState.lastDate === today) {
      // Already logged a session today — don't double-count.
      nextCount = streakState.count || 1;
    } else if (
      streakState.lastDate &&
      daysBetween(streakState.lastDate, today) === 1
    ) {
      nextCount = streakState.count + 1;
    } else {
      nextCount = 1; // gap of >1 day, or first-ever session
    }

    await AsyncStorage.setItem(
      STREAK_KEY,
      JSON.stringify({ count: nextCount, lastDate: today })
    );
    await AsyncStorage.setItem(
      LAST_SNAPSHOT_KEY,
      JSON.stringify({ ...snapshot, date: today })
    );

    return { streak: nextCount };
  } catch {
    return { streak: 0 };
  }
}

export interface ItemDelta {
  id: string;
  name: string;
  achievedDelta: number;
  achievedDeltaPct: number | null;
}

export interface SessionComparison {
  previous: StoredSessionSnapshot | null;
  formScoreDeltaPct: number | null;
  kcalDeltaPct: number | null;
  durationDeltaPct: number | null;
  perItemDeltas: ItemDelta[];
}

function pctDelta(today: number, prev: number): number | null {
  if (!prev) return null;
  return ((today - prev) / prev) * 100;
}

export function compareToPrevious(
  today: { totalDurationSeconds: number; totalKcal: number; avgFormScore: number; items: SessionItemResult[] },
  previous: StoredSessionSnapshot | null
): SessionComparison {
  if (!previous) {
    return {
      previous: null,
      formScoreDeltaPct: null,
      kcalDeltaPct: null,
      durationDeltaPct: null,
      perItemDeltas: [],
    };
  }

  const perItemDeltas: ItemDelta[] = today.items
    .map((item) => {
      const prevItem = previous.items.find((p) => p.id === item.id);
      if (!prevItem) return null;
      return {
        id: item.id,
        name: item.name,
        achievedDelta: item.achieved - prevItem.achieved,
        achievedDeltaPct: pctDelta(item.achieved, prevItem.achieved),
      };
    })
    .filter((d): d is ItemDelta => d !== null);

  return {
    previous,
    formScoreDeltaPct: pctDelta(today.avgFormScore, previous.avgFormScore),
    kcalDeltaPct: pctDelta(today.totalKcal, previous.totalKcal),
    durationDeltaPct: pctDelta(today.totalDurationSeconds, previous.totalDurationSeconds),
    perItemDeltas,
  };
}

export interface Suggestion {
  id: string;
  icon: string;
  text: string;
}

const NAMED_TIPS: { keyword: string; icon: string; text: string }[] = [
  { keyword: "squat", icon: "🦵", text: "Focus on squat depth — aim to bring your hips level with your knees for full activation." },
  { keyword: "plank", icon: "⏱️", text: "Build your plank hold time gradually — even a few extra seconds each session compounds fast." },
  { keyword: "push", icon: "💪", text: "Keep your chest close to the floor on each rep for full range of motion." },
  { keyword: "lunge", icon: "🚶", text: "Watch your front knee — keep it stacked over your ankle, not drifting past your toes." },
];

/**
 * Generates coaching suggestions from the session log + comparison to the
 * previous session. Scoped to signals actually available in the log
 * (reps vs goal, hold-time vs target, form score) plus a small curated
 * set of named tips. Deeper per-exercise coaching (e.g. squat depth from
 * a real knee-angle metric) needs those engine metrics threaded into
 * SessionItemResult first — not available in what's been shared so far.
 */
export function generateSuggestions(
  items: SessionItemResult[],
  avgFormScore: number,
  comparison: SessionComparison
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const item of items) {
    const metGoal = item.achieved >= item.target;
    const nameLower = item.name.toLowerCase();

    if (!metGoal) {
      suggestions.push({
        id: `${item.id}-goal`,
        icon: item.type === "hold" ? "⏳" : "🎯",
        text:
          item.type === "hold"
            ? `${item.name}: held ${Math.round(item.achieved)}s of ${item.target}s — build toward the full hold next time.`
            : `${item.name}: ${Math.round(item.achieved)}/${item.target} reps — aim to complete the full set next session.`,
      });
    } else if (item.formScore >= 85) {
      suggestions.push({
        id: `${item.id}-levelup`,
        icon: "📈",
        text:
          item.type === "hold"
            ? `${item.name}: strong hold with great form — try extending your target time.`
            : `${item.name}: goal met with great form — try increasing your rep target or difficulty.`,
      });
    }

    const tip = NAMED_TIPS.find((t) => nameLower.includes(t.keyword));
    if (tip) {
      suggestions.push({ id: `${item.id}-tip`, icon: tip.icon, text: `${item.name}: ${tip.text}` });
    }
  }

  if (comparison.formScoreDeltaPct != null && comparison.formScoreDeltaPct < -5) {
    suggestions.push({
      id: "form-dip",
      icon: "🧘",
      text: "Your overall form dipped vs your last session — consider slowing down and focusing on control over speed.",
    });
  }

  const metGoalCount = items.filter((i) => i.achieved >= i.target).length;
  if (avgFormScore >= 90 && items.length > 0 && metGoalCount === items.length) {
    suggestions.push({
      id: "level-up-overall",
      icon: "🏆",
      text: "You're consistently exceeding your targets with excellent form — consider stepping up to the next difficulty level.",
    });
  }

  // Most specific (per-item) suggestions first; cap so the UI isn't overwhelmed.
  return suggestions.slice(0, 5);
}