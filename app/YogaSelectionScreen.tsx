// YogaSelectionScreen.tsx
//
// Step 3 of 5 — Yoga asana selection.
// Full 1:1 React Native port of the AuraFit "aurafit_yoga_selection.html" reference:
// aurora + crystal background, glass stepper, lotus hero card, chakra balance bar,
// category filter tabs, accordion category sections with custom SVG pose figures,
// animated selection summary strip, and gradient "Begin My Practice" CTA.
//
// NEW: a "Full Yoga Session" mode sits alongside the original pick-your-own-pose
// flow. In this mode the user just taps Beginner, Intermediate, or Advanced and a
// complete pose sequence is selected automatically — no manual pose picking.
//
// IMPORTANT: Full Session sequences are NOT a separate/fabricated pose list —
// they're derived directly from `yogaCategories` in yogaData.ts, grouped by each
// pose's existing `level` field. This guarantees every pose id handed to
// CameraCheckScreen is one of the 12 real PoseIds the pose-engine can validate,
// exactly like the manual "Build My Flow" path already does.

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import AuroraBackground from "../components/yoga/AuroraBackground";
import YogaHeroCard from "../components/yoga/YogaHeroCard";
import ChakraBalanceBar from "../components/yoga/ChakraBalanceBar";
import CategoryTabs, { FilterType } from "../components/yoga/CategoryTabs";
import CategorySection from "../components/yoga/CategorySection";
import {
  yogaCategories,
  YogaCategory,
  YogaPose,
  Level,
  LEVEL_COLOR,
  TAG_STYLE,
} from "../data/yogaData";

const { height: SCREEN_H } = Dimensions.get("window");

/* ────────────────────────────────────────────────────────────────────── *
 * Full Yoga Session data — derived, not fabricated.
 *
 * Every pose already carries a `level: "Beginner" | "Intermediate" | "Advanced"`
 * in yogaData. We simply group the full pose library by that field, so each
 * session is guaranteed to use only real, camera-validated poses, and stays
 * automatically in sync if yogaData.ts is edited later.
 * ────────────────────────────────────────────────────────────────────── */

const LEVEL_ORDER: Level[] = ["Beginner", "Intermediate", "Advanced"];

const LEVEL_META: Record<Level, { subtitle: string; emoji: string; gradient: [string, string] }> = {
  Beginner: {
    subtitle: "Gentle & safe for any age",
    emoji: "🌱",
    gradient: ["#34D399", "#38BDF8"],
  },
  Intermediate: {
    subtitle: "Builds strength & flow",
    emoji: "🔥",
    gradient: ["#7D53FF", "#B59BFF"],
  },
  Advanced: {
    subtitle: "Deep strength & balance",
    emoji: "⚡",
    gradient: ["#EC4899", "#F97316"],
  },
};

interface SessionLevelData {
  level: Level;
  subtitle: string;
  emoji: string;
  gradient: [string, string];
  poses: YogaPose[];
}

const ALL_POSES: YogaPose[] = yogaCategories.flatMap((cat) => cat.poses);

const FULL_SESSIONS: Record<Level, SessionLevelData> = LEVEL_ORDER.reduce(
  (acc, level) => {
    acc[level] = {
      level,
      ...LEVEL_META[level],
      poses: ALL_POSES.filter((p) => p.level === level),
    };
    return acc;
  },
  {} as Record<Level, SessionLevelData>
);

type Mode = "custom" | "session";

export default function YogaSelectionScreen() {
  const router = useRouter();

  /* Mode: build your own flow vs. pick a pre-built full session */
  const [mode, setMode] = useState<Mode>("custom");

  /* ── Custom (pick-your-own-pose) state, unchanged ── */
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [selectedAsanas, setSelectedAsanas] = useState<string[]>([]);

  /* ── Full Session state ── */
  const [sessionLevel, setSessionLevel] = useState<Level | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<Level | null>(null);

  const toggleAsana = (id: string) => {
    setSelectedAsanas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
  };

  const filteredCategories =
    selectedFilter === "all"
      ? yogaCategories
      : yogaCategories.filter((cat) => cat.id === selectedFilter);

  const customTotalMinutes = useMemo(
    () =>
      ALL_POSES.filter((pose) => selectedAsanas.includes(pose.id)).reduce(
        (sum, pose) => sum + pose.duration,
        0
      ),
    [selectedAsanas]
  );

  /** category ids that currently have >=1 selected pose, drives the chakra dots */
  const litCategories = useMemo(() => {
    const set = new Set<YogaCategory["id"]>();
    yogaCategories.forEach((cat) => {
      if (cat.poses.some((p) => selectedAsanas.includes(p.id))) {
        set.add(cat.id);
      }
    });
    return set;
  }, [selectedAsanas]);

  const sessionData = sessionLevel ? FULL_SESSIONS[sessionLevel] : null;
  const sessionTotalMinutes = sessionData
    ? sessionData.poses.reduce((sum, p) => sum + p.duration, 0)
    : 0;
  const sessionTotalKcal = sessionData
    ? sessionData.poses.reduce((sum, p) => sum + p.kcal, 0)
    : 0;

  const hasSelection =
    mode === "custom" ? selectedAsanas.length > 0 : sessionLevel !== null;

  const totalMinutes = mode === "custom" ? customTotalMinutes : sessionTotalMinutes;
  const selectedCount =
    mode === "custom" ? selectedAsanas.length : sessionData?.poses.length ?? 0;

  /* CTA pulse-in animation when the button becomes enabled */
  const ctaScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (hasSelection) {
      Animated.sequence([
        Animated.timing(ctaScale, { toValue: 1.03, duration: 120, useNativeDriver: true }),
        Animated.spring(ctaScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [hasSelection, ctaScale]);

  const handleBeginPractice = () => {
    if (mode === "custom") {
      router.push(
        `/CameraCheckScreen?poses=${encodeURIComponent(selectedAsanas.join(","))}`
      );
    } else if (sessionData) {
      const poseIds = sessionData.poses.map((p) => p.id).join(",");
      router.push(
        `/CameraCheckScreen?poses=${encodeURIComponent(poseIds)}&mode=fullSession&level=${sessionData.level}`
      );
    }
  };

  return (
    <>
      <View style={styles.root}>
        {/* Animated aurora + crystal background, behind everything */}
        <AuroraBackground height={SCREEN_H} />

        <SafeAreaView style={styles.safe} edges={["top"]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Back + step pill */}
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.backButton} activeOpacity={0.8}>
                <Svg width={8} height={14} viewBox="0 0 8 14" fill="none">
                  <Path
                    d="M7 1L1 7L7 13"
                    stroke="#B59BFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>STEP 3 OF 5</Text>
              </View>
            </View>

            {/* Stepper */}
            <View style={styles.stepper}>
              <StepDot state="done" label={1} />
              <StepLine done />
              <StepDot state="done" label={2} />
              <StepLine done />
              <StepDot state="active" label={3} />
              <StepLine done={false} />
              <StepDot state="idle" label={4} />
              <StepLine done={false} />
              <StepDot state="idle" label={5} />
            </View>

            {/* Hero card */}
            <YogaHeroCard />

            {/* Mode toggle: Build My Flow vs Full Session */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === "custom" && styles.modeBtnActive]}
                activeOpacity={0.85}
                onPress={() => switchMode("custom")}
              >
                <Text style={[styles.modeBtnText, mode === "custom" && styles.modeBtnTextActive]}>
                  🧩 Build My Flow
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === "session" && styles.modeBtnActive]}
                activeOpacity={0.85}
                onPress={() => switchMode("session")}
              >
                <Text style={[styles.modeBtnText, mode === "session" && styles.modeBtnTextActive]}>
                  🧘 Full Yoga Session
                </Text>
              </TouchableOpacity>
            </View>

            {mode === "custom" ? (
              <>
                {/* Chakra balance bar */}
                <ChakraBalanceBar litCategories={litCategories} />

                {/* Category filter tabs */}
                <CategoryTabs selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />

                {/* Section label */}
                <View style={styles.secLabelRow}>
                  <View style={styles.secLabelLeft}>
                    <View style={styles.secDot} />
                    <Text style={styles.secTitle}>Choose your asanas</Text>
                  </View>
                  <Text style={styles.secCount}>{selectedAsanas.length} selected</Text>
                </View>

                {/* Category sections */}
                {filteredCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    selectedAsanas={selectedAsanas}
                    onToggleAsana={toggleAsana}
                  />
                ))}
              </>
            ) : (
              <>
                {/* Section label */}
                <View style={styles.secLabelRow}>
                  <View style={styles.secLabelLeft}>
                    <View style={styles.secDot} />
                    <Text style={styles.secTitle}>Choose your level</Text>
                  </View>
                  <Text style={styles.secCount}>
                    {sessionLevel ? "1 selected" : "none selected"}
                  </Text>
                </View>
                <Text style={styles.sessionHint}>
                  Each level is a complete, ready-to-go sequence — just pick one and start.
                  No need to choose individual poses.
                </Text>

                {LEVEL_ORDER.map((level) => (
                  <SessionLevelCard
                    key={level}
                    data={FULL_SESSIONS[level]}
                    selected={sessionLevel === level}
                    expanded={expandedLevel === level}
                    onSelect={() => setSessionLevel(level)}
                    onToggleExpand={() =>
                      setExpandedLevel((prev) => (prev === level ? null : level))
                    }
                  />
                ))}
              </>
            )}

            <View style={{ height: 8 }} />
          </ScrollView>

          {/* Bottom fixed area: selection strip + CTA */}
          <View style={styles.bottomArea}>
            <View style={styles.selStrip}>
              <Text style={styles.selStripIcon}>🧘</Text>
              <View style={styles.selStripText}>
                {mode === "custom" ? (
                  hasSelection ? (
                    <Text style={styles.selStripP}>
                      <Text style={styles.selStripStrong}>
                        {selectedCount} asana{selectedCount > 1 ? "s" : ""}
                      </Text>{" "}
                      selected — beautiful lineup!
                    </Text>
                  ) : (
                    <Text style={styles.selStripP}>
                      Pick at least <Text style={styles.selStripStrong}>1 asana</Text> to build
                      your flow.
                    </Text>
                  )
                ) : hasSelection && sessionData ? (
                  <Text style={styles.selStripP}>
                    <Text style={styles.selStripStrong}>{sessionData.level} Session</Text> ·{" "}
                    {sessionData.poses.length} poses · {sessionTotalKcal} kcal
                  </Text>
                ) : (
                  <Text style={styles.selStripP}>
                    Choose a level — <Text style={styles.selStripStrong}>Beginner</Text>,{" "}
                    <Text style={styles.selStripStrong}>Intermediate</Text>, or{" "}
                    <Text style={styles.selStripStrong}>Advanced</Text>.
                  </Text>
                )}
              </View>
              <Text style={styles.selStripMins}>{totalMinutes} min</Text>
            </View>

            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <TouchableOpacity
                disabled={!hasSelection}
                activeOpacity={0.85}
                onPress={handleBeginPractice}
              >
                <LinearGradient
                  colors={["#34D399", "#7D53FF", "#EC4899"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.cta, !hasSelection && styles.ctaDisabled]}
                >
                  <Text style={styles.ctaText}>Begin My Practice</Text>
                  <View style={styles.ctaArrow}>
                    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                      <Path
                        d="M2 7H12M8 3L12 7L8 11"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.skipRow} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

/* ── Full Session sub-component ── */

function SessionLevelCard({
  data,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
}: {
  data: SessionLevelData;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  const totalMinutes = data.poses.reduce((sum, p) => sum + p.duration, 0);
  const totalKcal = data.poses.reduce((sum, p) => sum + p.kcal, 0);
  const levelColor = LEVEL_COLOR[data.level];

  return (
    <TouchableOpacity
      style={[styles.sessionCard, selected && styles.sessionCardActive]}
      activeOpacity={0.88}
      onPress={onSelect}
    >
      <View style={styles.sessionCardTop}>
        <LinearGradient
          colors={data.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sessionIconWrap}
        >
          <Text style={styles.sessionIconEmoji}>{data.emoji}</Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={styles.sessionTitle}>{data.level}</Text>
          <Text style={styles.sessionSubtitle}>{data.subtitle}</Text>
        </View>

        <View style={[styles.sessionRadio, selected && styles.sessionRadioActive]}>
          {selected && <View style={styles.sessionRadioDot} />}
        </View>
      </View>

      <View style={styles.sessionMetaRow}>
        <Text style={styles.sessionMetaText}>{data.poses.length} poses</Text>
        <View style={styles.sessionMetaDivider} />
        <Text style={styles.sessionMetaText}>{totalMinutes} min</Text>
        <View style={styles.sessionMetaDivider} />
        <Text style={styles.sessionMetaText}>{totalKcal} kcal</Text>
        <TouchableOpacity
          style={styles.sessionExpandBtn}
          onPress={onToggleExpand}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.sessionExpandText}>
            {expanded ? "Hide poses ▲" : "View poses ▼"}
          </Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.sessionPoseList}>
          {data.poses.map((pose, i) => {
            const primaryTag = pose.tags[0];
            const tagStyle = primaryTag ? TAG_STYLE[primaryTag] : null;
            return (
              <View key={pose.id} style={styles.sessionPoseRow}>
                <Text style={[styles.sessionPoseIndex, { color: levelColor }]}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionPoseName}>{pose.name}</Text>
                  {!!tagStyle && (
                    <View
                      style={[
                        styles.sessionPoseTag,
                        { backgroundColor: tagStyle.bg, borderColor: tagStyle.border },
                      ]}
                    >
                      <Text style={[styles.sessionPoseTagText, { color: tagStyle.color }]}>
                        {primaryTag}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sessionPoseDuration}>{pose.duration} min</Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ── Stepper sub-components ── */

function StepDot({ state, label }: { state: "done" | "active" | "idle"; label: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === "active") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [state, pulse]);

  if (state === "done") {
    return (
      <LinearGradient colors={["#7D53FF", "#38BDF8"]} style={styles.stepDot}>
        <Text style={styles.stepDotTextDone}>✓</Text>
      </LinearGradient>
    );
  }
  if (state === "active") {
    return (
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient colors={["#34D399", "#7D53FF"]} style={styles.stepDot}>
          <Text style={styles.stepDotTextActive}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }
  return (
    <View style={[styles.stepDot, styles.stepDotIdle]}>
      <Text style={styles.stepDotTextIdle}>{label}</Text>
    </View>
  );
}

function StepLine({ done }: { done: boolean }) {
  if (done) {
    return (
      <LinearGradient
        colors={["#7D53FF", "#38BDF8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.stepLine}
      />
    );
  }
  return <View style={[styles.stepLine, styles.stepLineIdle]} />;
}

/* ── Styles ── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B081A",
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* top row */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepPill: {
    backgroundColor: "rgba(139,92,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  stepPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B59BFF",
    letterSpacing: 0.5,
  },

  /* stepper */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 16,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotIdle: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.25)",
  },
  stepDotTextDone: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  stepDotTextActive: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  stepDotTextIdle: {
    color: "#6B6490",
    fontSize: 11,
    fontWeight: "700",
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  stepLineIdle: {
    backgroundColor: "rgba(139,92,246,0.18)",
  },

  /* mode toggle */
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 18,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBtnActive: {
    backgroundColor: "rgba(125,83,255,0.28)",
    borderWidth: 1,
    borderColor: "rgba(125,83,255,0.5)",
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B6490",
  },
  modeBtnTextActive: {
    color: "#F8F7FF",
  },

  /* section label */
  secLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  secLabelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  secDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#34D399",
  },
  secTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8F7FF",
  },
  secCount: {
    fontSize: 10,
    color: "#6B6490",
    fontWeight: "500",
  },

  /* full session hint + cards */
  sessionHint: {
    fontSize: 11,
    color: "#B4ACD9",
    lineHeight: 16,
    marginBottom: 14,
  },
  sessionCard: {
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.22)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  sessionCardActive: {
    borderColor: "rgba(52,211,153,0.6)",
    backgroundColor: "rgba(52,211,153,0.08)",
  },
  sessionCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionIconEmoji: {
    fontSize: 20,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F8F7FF",
    marginBottom: 2,
  },
  sessionSubtitle: {
    fontSize: 11,
    color: "#B4ACD9",
  },
  sessionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionRadioActive: {
    borderColor: "#34D399",
  },
  sessionRadioDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "#34D399",
  },
  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  sessionMetaText: {
    fontSize: 11,
    color: "#6B6490",
    fontWeight: "600",
  },
  sessionMetaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#6B6490",
  },
  sessionExpandBtn: {
    marginLeft: "auto",
  },
  sessionExpandText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B59BFF",
  },
  sessionPoseList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(139,92,246,0.15)",
    gap: 10,
  },
  sessionPoseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sessionPoseIndex: {
    width: 16,
    fontSize: 11,
    fontWeight: "800",
  },
  sessionPoseName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F8F7FF",
    marginBottom: 3,
  },
  sessionPoseTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  sessionPoseTagText: {
    fontSize: 8.5,
    fontWeight: "700",
  },
  sessionPoseDuration: {
    fontSize: 11,
    fontWeight: "700",
    color: "#34D399",
  },

  /* bottom fixed area */
  bottomArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "rgba(11,8,26,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(139,92,246,0.12)",
  },
  selStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.22)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginBottom: 10,
  },
  selStripIcon: {
    fontSize: 18,
  },
  selStripText: {
    flex: 1,
  },
  selStripP: {
    fontSize: 11,
    color: "#B4ACD9",
    lineHeight: 15,
  },
  selStripStrong: {
    color: "#34D399",
    fontWeight: "700",
  },
  selStripMins: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FF8C42",
  },

  /* CTA */
  cta: {
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#34D399",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaDisabled: {
    opacity: 0.42,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  ctaArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* skip */
  skipRow: {
    alignItems: "center",
    marginTop: 12,
  },
  skipText: {
    fontSize: 12,
    color: "#6B6490",
  },
});