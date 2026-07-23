// app/achievement.tsx
//
// Shown after every live session (workout or yoga) — camera.tsx already
// navigates here via router.push("/achievement") once the cooldown phase
// completes. Reads whatever was logged into useSessionLogStore during the
// session (see store/sessionLogStore.ts, and the logging calls added to
// camera.tsx), compares it to yesterday's session via AsyncStorage
// (lib/sessionHistory.ts), and generates coaching suggestions from that.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

import AuroraBackground from "../components/yoga/AuroraBackground";
import { useSessionLogStore, type SessionItemResult } from "@/data/Sessionlogstore";
import {
  loadLastSnapshot,
  saveSnapshotAndUpdateStreak,
  compareToPrevious,
  generateSuggestions,
  type SessionComparison,
} from "@/data/Sessionhistory";

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function celebrationLine(avgFormScore: number): string {
  if (avgFormScore >= 95) return "PERFECT FORM!";
  if (avgFormScore >= 80) return "GREAT FORM!";
  if (avgFormScore >= 60) return "GOOD EFFORT!";
  return "SESSION COMPLETE";
}

/* ── Circular progress ring for form accuracy ── */
function RingProgress({ pct, size = 96 }: { pct: number; size?: number }) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, pct / 100)));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(139,92,246,0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#34D399"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text style={styles.ringValue}>{Math.round(pct)}%</Text>
    </View>
  );
}

export default function AchievementScreen() {
  const router = useRouter();

  // Snapshot the store's contents immediately on mount — before anything
  // else can reset it — so this screen keeps working even if the store
  // gets cleared for the next session while the user is still looking at
  // this summary.
  const [sessionMode] = useState(() => useSessionLogStore.getState().mode ?? "workout");
  const [startedAt] = useState(() => useSessionLogStore.getState().startedAt ?? Date.now());
  const [items] = useState<SessionItemResult[]>(() => useSessionLogStore.getState().items);

  const [comparison, setComparison] = useState<SessionComparison | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const savedRef = useRef(false);

  const totalDurationSeconds = useMemo(() => (Date.now() - startedAt) / 1000, [startedAt]);
  const totalKcal = useMemo(() => Math.round(items.reduce((s, i) => s + i.kcal, 0)), [items]);
  const avgFormScore = useMemo(
    () => (items.length ? items.reduce((s, i) => s + i.formScore, 0) / items.length : 0),
    [items]
  );

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      const previous = await loadLastSnapshot();
      const today = { totalDurationSeconds, totalKcal, avgFormScore, items };
      setComparison(compareToPrevious(today, previous));

      const { streak: newStreak } = await saveSnapshotAndUpdateStreak({
        mode: sessionMode,
        totalDurationSeconds,
        totalKcal,
        avgFormScore,
        items,
      });
      setStreak(newStreak);

      // Now that today's data is safely persisted, clear the live-session
      // store so the next workout starts from an empty log.
      useSessionLogStore.getState().reset();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggestions = useMemo(
    () => (comparison ? generateSuggestions(items, avgFormScore, comparison) : []),
    [items, avgFormScore, comparison]
  );

  const isYoga = sessionMode === "yoga";

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0B081A" />

      <View style={styles.root}>
        <AuroraBackground />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Hero completion card ── */}
          <LinearGradient
            colors={["#34D399", "#7D53FF", "#EC4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBorder}
          >
            <View style={styles.heroInner}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {isYoga ? "🧘 Mindful Practice Complete" : "💪 Workout Complete"}
                </Text>
              </View>

              <Text style={styles.heroTitle}>{isYoga ? "Yoga Flow" : "Training Session"}</Text>
              <Text style={styles.heroSubtitle}>
                {items.length} {isYoga ? "pose" : "exercise"}
                {items.length !== 1 ? "s" : ""} completed
              </Text>

              <View style={styles.heroPillsRow}>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>⏱ {formatDuration(totalDurationSeconds)} min</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>🔥 {totalKcal} kcal</Text>
                </View>
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>✦ AI-Coached</Text>
                </View>
              </View>

              <Text style={styles.celebrationText}>{celebrationLine(avgFormScore)}</Text>
            </View>
          </LinearGradient>

          {/* ── Stats card ── */}
          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Total Time</Text>
                <Text style={styles.statValue}>{formatDuration(totalDurationSeconds)}</Text>
                <Text style={styles.statUnit}>min</Text>
              </View>

              <RingProgress pct={avgFormScore} />

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={[styles.statValue, { color: "#FF8C42" }]}>{totalKcal}</Text>
                <Text style={styles.statUnit}>kcal</Text>
              </View>
            </View>
            <Text style={styles.ringCaption}>Form Accuracy</Text>
          </View>

          {/* ── Per-item breakdown ── */}
          <View style={styles.card}>
            <View style={styles.cardHeadingRow}>
              <View style={styles.cardHeadingDot} />
              <Text style={styles.cardHeading}>
                {isYoga ? "Asana Performance" : "Exercise Breakdown"}
              </Text>
            </View>

            {items.length === 0 ? (
              <Text style={styles.emptyText}>No items were logged for this session.</Text>
            ) : (
              items.map((item) => {
                const delta = comparison?.perItemDeltas.find((d) => d.id === item.id) ?? null;
                const metGoal = item.achieved >= item.target;

                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View
                      style={[
                        styles.itemCheck,
                        { backgroundColor: metGoal ? "rgba(52,211,153,0.16)" : "rgba(255,140,66,0.14)" },
                      ]}
                    >
                      <Ionicons
                        name={metGoal ? "checkmark" : "time-outline"}
                        size={14}
                        color={metGoal ? "#34D399" : "#FF8C42"}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {!!item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.itemAchieved}>
                        {item.type === "hold"
                          ? `${Math.round(item.achieved)}s / ${item.target}s`
                          : `${Math.round(item.achieved)} / ${item.target} reps`}
                      </Text>
                      <View style={styles.itemMetaRow}>
                        <Text style={styles.itemForm}>{`${Math.round(item.formScore)}% form`}</Text>
                        {delta && delta.achievedDelta !== 0 ? (
                          <Text
                            style={[
                              styles.itemDelta,
                              { color: delta.achievedDelta > 0 ? "#34D399" : "#F472B6" },
                            ]}
                          >
                            {`${delta.achievedDelta > 0 ? " ▲" : " ▼"}${Math.abs(Math.round(delta.achievedDelta))}`}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* ── Trend vs previous session ── */}
          <View style={styles.card}>
            <View style={styles.cardHeadingRow}>
              <View style={styles.cardHeadingDot} />
              <Text style={styles.cardHeading}>Progress vs Last Session</Text>
            </View>

            {comparison?.previous ? (
              <>
                <View style={styles.barChartRow}>
                  <View style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: `${Math.max(4, Math.round(comparison.previous.avgFormScore))}%`, backgroundColor: "#6B6490" },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>Last Time</Text>
                    <Text style={styles.barValue}>{Math.round(comparison.previous.avgFormScore)}%</Text>
                  </View>

                  <View style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <LinearGradient
                        colors={["#34D399", "#7D53FF"]}
                        style={[styles.barFill, { height: `${Math.max(4, Math.round(avgFormScore))}%` }]}
                      />
                    </View>
                    <Text style={styles.barLabel}>Today</Text>
                    <Text style={[styles.barValue, { color: "#34D399" }]}>{Math.round(avgFormScore)}%</Text>
                  </View>
                </View>

                {comparison.formScoreDeltaPct != null && (
                  <Text
                    style={[
                      styles.trendHeadline,
                      { color: comparison.formScoreDeltaPct >= 0 ? "#34D399" : "#F472B6" },
                    ]}
                  >
                    {comparison.formScoreDeltaPct >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(Math.round(comparison.formScoreDeltaPct))}% form vs last session
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>
                This is your first logged session — come back tomorrow to see your trend here.
              </Text>
            )}
          </View>

          {/* ── Suggestions ── */}
          {suggestions.length > 0 ? (
            <View style={styles.card}>
              <View style={styles.cardHeadingRow}>
                <View style={styles.cardHeadingDot} />
                <Text style={styles.cardHeading}>Suggestions For Next Time</Text>
              </View>

              {suggestions.map((s) => (
                <View key={s.id} style={styles.suggestionRow}>
                  <Text style={styles.suggestionIcon}>{s.icon}</Text>
                  <Text style={styles.suggestionText}>{s.text}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* ── Badges ── */}
          <View style={styles.badgesRow}>
            {streak != null && streak > 0 ? (
              <View style={styles.badge}>
                <LinearGradient colors={["#F97316", "#FCD34D"]} style={styles.badgeIconWrap}>
                  <Text style={styles.badgeEmoji}>🔥</Text>
                </LinearGradient>
                <Text style={styles.badgeLabel}>{`${streak} Day Streak`}</Text>
              </View>
            ) : null}

            {avgFormScore >= 90 ? (
              <View style={styles.badge}>
                <LinearGradient colors={["#34D399", "#38BDF8"]} style={styles.badgeIconWrap}>
                  <Text style={styles.badgeEmoji}>✦</Text>
                </LinearGradient>
                <Text style={styles.badgeLabel}>Form Perfectionist</Text>
              </View>
            ) : null}

            {items.length > 0 && items.every((i) => i.achieved >= i.target) ? (
              <View style={styles.badge}>
                <LinearGradient colors={["#7D53FF", "#EC4899"]} style={styles.badgeIconWrap}>
                  <Text style={styles.badgeEmoji}>🏆</Text>
                </LinearGradient>
                <Text style={styles.badgeLabel}>All Goals Met</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/session-summary")}>
            <LinearGradient
              colors={["#34D399", "#7D53FF", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>View Session Summary</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B081A" },
  scrollContent: { padding: 16, paddingTop: 56, paddingBottom: 48 },

  heroBorder: { borderRadius: 26, padding: 2, marginBottom: 16 },
  heroInner: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(11,8,26,0.92)",
    alignItems: "center",
  },
  heroBadge: {
    backgroundColor: "rgba(52,211,153,0.12)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.4)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  heroBadgeText: { color: "#34D399", fontSize: 12, fontWeight: "800" },
  heroTitle: { color: "#F8F7FF", fontSize: 24, fontWeight: "800" },
  heroSubtitle: { color: "#B4ACD9", fontSize: 13, marginTop: 4 },
  heroPillsRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" },
  heroPill: {
    backgroundColor: "rgba(139,92,246,0.16)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroPillText: { color: "#F8F7FF", fontSize: 11, fontWeight: "700" },
  celebrationText: { color: "#34D399", fontSize: 20, fontWeight: "800", marginTop: 16, letterSpacing: 0.5 },

  card: {
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },

  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  statCol: { alignItems: "center" },
  statLabel: { color: "#6B6490", fontSize: 11, fontWeight: "600" },
  statValue: { color: "#F8F7FF", fontSize: 22, fontWeight: "800", marginTop: 4 },
  statUnit: { color: "#6B6490", fontSize: 11 },
  ringValue: { position: "absolute", color: "#F8F7FF", fontSize: 18, fontWeight: "800" },
  ringCaption: { textAlign: "center", color: "#6B6490", fontSize: 11, fontWeight: "600", marginTop: 12 },

  cardHeadingRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 14 },
  cardHeadingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#34D399" },
  cardHeading: { color: "#F8F7FF", fontSize: 14, fontWeight: "700" },

  emptyText: { color: "#6B6490", fontSize: 12.5, lineHeight: 18 },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(139,92,246,0.1)",
  },
  itemCheck: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  itemName: { color: "#F8F7FF", fontSize: 13, fontWeight: "700" },
  itemSubtitle: { color: "#6B6490", fontSize: 10.5, fontStyle: "italic", marginTop: 1 },
  itemAchieved: { color: "#F8F7FF", fontSize: 12.5, fontWeight: "700" },
  itemMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  itemForm: { color: "#B4ACD9", fontSize: 10.5 },
  itemDelta: { fontSize: 10.5, fontWeight: "700" },

  barChartRow: { flexDirection: "row", justifyContent: "center", gap: 28, height: 130, alignItems: "flex-end" },
  barCol: { alignItems: "center" },
  barTrack: {
    width: 40,
    height: 90,
    borderRadius: 10,
    backgroundColor: "rgba(139,92,246,0.1)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 10 },
  barLabel: { color: "#6B6490", fontSize: 10.5, fontWeight: "600", marginTop: 6 },
  barValue: { color: "#F8F7FF", fontSize: 12, fontWeight: "800", marginTop: 1 },
  trendHeadline: { textAlign: "center", fontSize: 13, fontWeight: "800", marginTop: 14 },

  suggestionRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  suggestionIcon: { fontSize: 16 },
  suggestionText: { flex: 1, color: "#B4ACD9", fontSize: 12.5, lineHeight: 18 },

  badgesRow: { flexDirection: "row", justifyContent: "center", gap: 20, marginVertical: 10 },
  badge: { alignItems: "center", width: 84 },
  badgeIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  badgeEmoji: { fontSize: 20 },
  badgeLabel: { color: "#B4ACD9", fontSize: 10, fontWeight: "700", textAlign: "center", marginTop: 6 },

  doneButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  doneButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});