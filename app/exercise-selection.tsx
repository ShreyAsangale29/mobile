/// <reference types="react/jsx-runtime" />
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { exercises } from "@/data/exercises";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import AIWorkoutCard from "@/components/exercise/AIWorkoutCard";
import FilterChip from "@/components/exercise/FilterChip";
import SelectionSummary from "@/components/exercise/SelectionSummary";
import AuroraBackground from "@/components/yoga/AuroraBackground";

const { height: SCREEN_H } = Dimensions.get("window");


// ─── filter config ────────────────────────────────────────────────────────
const FILTERS = [
  { label: "All",          icon: "apps-outline",    color: "#B59BFF" },
  { label: "Beginner",     icon: "leaf-outline",    color: "#10B981" },
  { label: "Intermediate", icon: "flash-outline",   color: "#F97316" },
  { label: "Advanced",     icon: "flame-outline",   color: "#EC4899" },
  { label: "Core",         icon: "body-outline",    color: "#38BDF8" },
  { label: "Legs",         icon: "walk-outline",    color: "#8B5CF6" },
];

// ─── helper: difficulty text colour ──────────────────────────────────────
function difficultyColor(d: string): string {
  if (d === "Beginner")     return "#10B981";
  if (d === "Intermediate") return "#F97316";
  if (d === "Advanced")     return "#EC4899";
  return "#B59BFF";
}

/* ────────────────────────────────────────────────────────────────────── *
 * Full Workout Session data — derived, not fabricated.
 *
 * Every exercise already carries a `difficulty: "Beginner" | "Intermediate" |
 * "Advanced"` field (it's what the filter chips already use). We simply
 * group the real `exercises` array by that field, so each session is
 * guaranteed to use only real exercise ids that already exist in the data
 * source — nothing invented — and stays in sync automatically if the
 * exercise library changes.
 * ────────────────────────────────────────────────────────────────────── */

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

const SESSION_LEVELS: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

const SESSION_META: Record<
  Difficulty,
  { subtitle: string; icon: string; gradient: [string, string] }
> = {
  Beginner: {
    subtitle: "Gentle & safe for any age",
    icon: "leaf-outline",
    gradient: ["#10B981", "#34D399"],
  },
  Intermediate: {
    subtitle: "Builds strength & stamina",
    icon: "flash-outline",
    gradient: ["#F97316", "#FB923C"],
  },
  Advanced: {
    subtitle: "High intensity, full effort",
    icon: "flame-outline",
    gradient: ["#EC4899", "#F472B6"],
  },
};

interface ExerciseItem {
  id: string;
  name: string;
  difficulty: string;
  kcal: number;
  tags: string[];
  color: string;
}

interface SessionLevelData {
  level: Difficulty;
  subtitle: string;
  icon: string;
  gradient: [string, string];
  exercises: ExerciseItem[];
}

const FULL_SESSIONS: Record<Difficulty, SessionLevelData> = SESSION_LEVELS.reduce(
  (acc, level) => {
    acc[level] = {
      level,
      ...SESSION_META[level],
      exercises: (exercises as ExerciseItem[]).filter((e) => e.difficulty === level),
    };
    return acc;
  },
  {} as Record<Difficulty, SessionLevelData>
);

type Mode = "custom" | "session";

// ─── stepper component ────────────────────────────────────────────────────
function Stepper({ current = 3, total = 5 }: { current?: number; total?: number }) {
  return (
    <View style={styles.stepperRow}>
      {Array.from({ length: total }, (_, i) => i + 1).map((step, idx) => (
        <React.Fragment key={step}>
          {idx > 0 && <View style={styles.stepLine} />}
          <View
            style={[
              styles.stepDot,
              step < current  && styles.stepDone,
              step === current && styles.stepActive,
              step > current  && styles.stepIdle,
            ]}
          >
            {step < current ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={styles.stepDotText}>{step}</Text>
            )}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── empty state ──────────────────────────────────────────────────────────
function EmptyFilterState({ filter }: { filter: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No {filter} exercises</Text>
      <Text style={styles.emptySub}>
        Try a different filter or tap &quot;All&quot; to see every exercise.
      </Text>
    </View>
  );
}

// ─── full session level card ───────────────────────────────────────────────
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
  const totalKcal = data.exercises.reduce((sum, e) => sum + e.kcal, 0);
  const levelColor = difficultyColor(data.level);

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
          <Ionicons name={data.icon as any} size={20} color="#fff" />
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
        <Text style={styles.sessionMetaText}>{data.exercises.length} exercises</Text>
        <View style={styles.sessionMetaDivider} />
        <Text style={styles.sessionMetaText}>{totalKcal} kcal</Text>
        <TouchableOpacity
          style={styles.sessionExpandBtn}
          onPress={onToggleExpand}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.sessionExpandText}>
            {expanded ? "Hide exercises ▲" : "View exercises ▼"}
          </Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.sessionExList}>
          {data.exercises.length === 0 ? (
            <Text style={styles.sessionExEmpty}>No {data.level} exercises yet.</Text>
          ) : (
            data.exercises.map((ex, i) => (
              <View key={ex.id} style={styles.sessionExRow}>
                <Text style={[styles.sessionExIndex, { color: levelColor }]}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionExName}>{ex.name}</Text>
                  {!!ex.tags?.[0] && (
                    <View style={[styles.sessionExTag, { borderColor: (ex.color ?? levelColor) + "55" }]}>
                      <Text style={[styles.sessionExTagText, { color: ex.color ?? levelColor }]}>
                        {ex.tags[0]}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sessionExKcal}>{ex.kcal} kcal</Text>
              </View>
            ))
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────
export default function ExerciseSelection() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("custom");

  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [aiWorkoutSelected,  setAiWorkoutSelected]  = useState(false);
  const [activeFilter,       setActiveFilter]        = useState("All");

  // full session state
  const [sessionLevel, setSessionLevel] = useState<Difficulty | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<Difficulty | null>(null);

  // list fade when filter switches
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
  };

  // ── filter logic ─────────────────────────────────────────────────────
  const filteredExercises = exercises.filter((ex: { tags: string | string[]; difficulty: string; }) => {
    switch (activeFilter) {
      case "All":          return true;
      case "Core":         return ex.tags.includes("Core");
      case "Legs":         return ex.tags.includes("Legs");
      default:             return ex.difficulty === activeFilter;
        // covers "Beginner", "Intermediate", "Advanced"
    }
  });

  // count how many exercises each filter would show (for badge)
  function filterCount(label: string): number {
    switch (label) {
      case "All":          return exercises.length;
      case "Core":         return exercises.filter((e: { tags: string | string[]; }) => e.tags.includes("Core")).length;
      case "Legs":         return exercises.filter((e: { tags: string | string[]; }) => e.tags.includes("Legs")).length;
      default:             return exercises.filter((e: { difficulty: string; }) => e.difficulty === label).length;
    }
  }

  // ── switch filter with fade animation ────────────────────────────────
  function handleFilterChange(label: string) {
    if (label === activeFilter) return;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveFilter(label);
    // drop selections that would vanish from the new filter
    setSelectedExercises((prev) =>
      prev.filter((id) => {
        const ex = exercises.find((e: { id: string; }) => e.id === id);
        if (!ex) return false;
        switch (label) {
          case "All":  return true;
          case "Core": return ex.tags.includes("Core");
          case "Legs": return ex.tags.includes("Legs");
          default:     return ex.difficulty === label;
        }
      })
    );
  }

  // ── toggle exercise selection ─────────────────────────────────────────
  const toggleExercise = (id: string) =>
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ── derived values ────────────────────────────────────────────────────
  const customTotalCalories =
    selectedExercises.reduce((sum, id) => {
      const ex = exercises.find((e) => e.id === id);
      return sum + (ex?.kcal ?? 0);
    }, 0) + (aiWorkoutSelected ? 350 : 0);

  const customSelectedCount = selectedExercises.length + (aiWorkoutSelected ? 1 : 0);
  const activeMeta    = FILTERS.find((f) => f.label === activeFilter);

  const sessionData = sessionLevel ? FULL_SESSIONS[sessionLevel] : null;
  const sessionTotalCalories = sessionData
    ? sessionData.exercises.reduce((sum, e) => sum + e.kcal, 0)
    : 0;
  const sessionSelectedCount = sessionData ? sessionData.exercises.length : 0;

  const hasSelection = mode === "custom" ? customSelectedCount > 0 : sessionLevel !== null;
  const totalCalories = mode === "custom" ? customTotalCalories : sessionTotalCalories;
  const selectedCount = mode === "custom" ? customSelectedCount : sessionSelectedCount;

  const handleContinue = () => {
    if (mode === "custom") {
      router.push(
        `/CameraCheckScreen?exercises=${encodeURIComponent(
          selectedExercises.join(",")
        )}`
      );
    } else if (sessionData) {
      const ids = sessionData.exercises.map((e) => e.id).join(",");
      router.push(
        `/CameraCheckScreen?exercises=${encodeURIComponent(ids)}&mode=fullSession&level=${sessionData.level}`
      );
    }
  };

  // ── render ────────────────────────────────────────────────────────────
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0B081A" />

      <View style={styles.root}>
        {/* subtle top glow */}
        <LinearGradient
          colors={["rgba(125,83,255,0.15)", "transparent"]}
          style={styles.topGlow}
          pointerEvents="none"
        />

        {/* Aurora background */}
        <AuroraBackground height={SCREEN_H} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── top row ──────────────────────────────────────────── */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Ionicons name="chevron-back" size={20} color="#B59BFF" />
            </TouchableOpacity>

            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>STEP 3 OF 5</Text>
            </View>
          </View>

          {/* ── progress stepper ─────────────────────────────────── */}
          <Stepper current={3} total={5} />

          {/* ── mode toggle: Build My Plan vs Full Workout Session ── */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "custom" && styles.modeBtnActive]}
              activeOpacity={0.85}
              onPress={() => switchMode("custom")}
            >
              <Text style={[styles.modeBtnText, mode === "custom" && styles.modeBtnTextActive]}>
                🧩 Build My Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "session" && styles.modeBtnActive]}
              activeOpacity={0.85}
              onPress={() => switchMode("session")}
            >
              <Text style={[styles.modeBtnText, mode === "session" && styles.modeBtnTextActive]}>
                💪 Full Workout Session
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "custom" ? (
            <>
              {/* ── AI personalised card ──────────────────────────── */}
              <AIWorkoutCard
                selected={aiWorkoutSelected}
                onPress={() => setAiWorkoutSelected((v) => !v)}
              />

              {/* ── filter chips ──────────────────────────────────── */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTERS.map((f) => (
                  <FilterChip
                    key={f.label}
                    title={f.label}
                    active={activeFilter === f.label}
                    onPress={() => handleFilterChange(f.label)}
                    count={filterCount(f.label)}
                    color={f.color}
                    icon={f.icon}
                  />
                ))}
              </ScrollView>

              {/* ── active-filter info banner ─────────────────────── */}
              {activeFilter !== "All" && (
                <View
                  style={[
                    styles.filterBanner,
                    { borderColor: (activeMeta?.color ?? "#8B5CF6") + "44" },
                  ]}
                >
                  <View
                    style={[
                      styles.filterBannerDot,
                      { backgroundColor: activeMeta?.color ?? "#8B5CF6" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterBannerLabel,
                      { color: activeMeta?.color ?? "#B59BFF" },
                    ]}
                  >
                    {filteredExercises.length}{" "}
                    {activeFilter} exercise
                    {filteredExercises.length !== 1 ? "s" : ""}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleFilterChange("All")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.filterBannerClear}>Clear ×</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── section header ────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>
                    {activeFilter === "All"
                      ? "Choose your exercises"
                      : `${activeFilter} exercises`}
                  </Text>
                </View>
                <Text style={styles.selectedCount}>
                  {selectedExercises.length} selected
                </Text>
              </View>

              {/* ── exercise list (fades on filter change) ───────── */}
              <Animated.View style={{ opacity: fadeAnim }}>
                {filteredExercises.length === 0 ? (
                  <EmptyFilterState filter={activeFilter} />
                ) : (
                  filteredExercises.map((ex: { id: string; name: any; difficulty: string; kcal: any; tags: any; color: any; }) => (
                    <ExerciseCard
                      id={ex.id}
                      key={ex.id}
                      name={ex.name}
                      difficulty={ex.difficulty}
                      kcal={ex.kcal}
                      tags={ex.tags}
                      color={ex.color}
                      selected={selectedExercises.includes(ex.id)}
                      onPress={() => toggleExercise(ex.id)}
                      difficultyColor={difficultyColor(ex.difficulty)}
                    />
                  ))
                )}
              </Animated.View>
            </>
          ) : (
            <>
              {/* ── section header ────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>Choose your level</Text>
                </View>
                <Text style={styles.selectedCount}>
                  {sessionLevel ? "1 selected" : "none selected"}
                </Text>
              </View>
              <Text style={styles.sessionHint}>
                Each level is a complete, ready-to-go workout — just pick one and start.
                No need to choose individual exercises.
              </Text>

              {SESSION_LEVELS.map((level) => (
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

          {/* ── selection summary strip ───────────────────────────── */}
          {mode === "custom" ? (
            <SelectionSummary
              selectedCount={selectedCount}
              totalCalories={totalCalories}
            />
          ) : (
            <View style={styles.sessionSummary}>
              <Text style={styles.sessionSummaryIcon}>💪</Text>
              <View style={{ flex: 1 }}>
                {sessionData ? (
                  <Text style={styles.sessionSummaryText}>
                    <Text style={styles.sessionSummaryStrong}>{sessionData.level} Session</Text>{" "}
                    · {sessionData.exercises.length} exercises ready to go!
                  </Text>
                ) : (
                  <Text style={styles.sessionSummaryText}>
                    Choose a level — <Text style={styles.sessionSummaryStrong}>Beginner</Text>,{" "}
                    <Text style={styles.sessionSummaryStrong}>Intermediate</Text>, or{" "}
                    <Text style={styles.sessionSummaryStrong}>Advanced</Text>.
                  </Text>
                )}
              </View>
              <Text style={styles.sessionSummaryKcal}>{totalCalories} kcal</Text>
            </View>
          )}

          {/* ── continue button ───────────────────────────────────── */}
          <TouchableOpacity
            disabled={!hasSelection}
            activeOpacity={0.85}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={
                !hasSelection
                  ? ["#2e2455", "#2e2455"]
                  : ["#7D53FF", "#8B5CF6", "#B59BFF"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.continueBtn,
                !hasSelection && styles.continueBtnDisabled,
              ]}
            >
              <Text style={styles.continueBtnText}>
                {mode === "custom" ? "Build My Plan" : "Begin Full Session"}
              </Text>
              <View style={styles.continueBtnArrow}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── skip ─────────────────────────────────────────────── */}
          <TouchableOpacity style={styles.skipRow} activeOpacity={0.6}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B081A",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 48,
  },

  // top row
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(139,92,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
  },
  stepPillText: {
    color: "#B59BFF",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // stepper
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  stepLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDone: {
    backgroundColor: "#7D53FF",
    shadowColor: "#7D53FF",
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 4,
  },
  stepActive: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#EC4899",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  stepIdle: {
    backgroundColor: "rgba(139,92,246,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.25)",
  },
  stepDotText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // mode toggle
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 16,
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

  // filter chips row
  filterRow: {
    paddingRight: 16,
    marginBottom: 14,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  // active filter banner
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18,13,38,0.75)",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  filterBannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterBannerLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  filterBannerClear: {
    color: "#6B6490",
    fontSize: 11,
    fontWeight: "700",
  },

  // section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#8B5CF6",
  },
  sectionTitle: {
    color: "#F8F7FF",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedCount: {
    color: "#6B6490",
    fontSize: 12,
  },

  // empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 44,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#F8F7FF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySub: {
    color: "#6B6490",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 28,
  },

  // full session hint + cards
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
    borderColor: "rgba(139,92,246,0.65)",
    backgroundColor: "rgba(139,92,246,0.1)",
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
    borderColor: "#8B5CF6",
  },
  sessionRadioDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "#8B5CF6",
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
  sessionExList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(139,92,246,0.15)",
    gap: 10,
  },
  sessionExEmpty: {
    fontSize: 11,
    color: "#6B6490",
    fontStyle: "italic",
  },
  sessionExRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sessionExIndex: {
    width: 16,
    fontSize: 11,
    fontWeight: "800",
  },
  sessionExName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F8F7FF",
    marginBottom: 3,
  },
  sessionExTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  sessionExTagText: {
    fontSize: 8.5,
    fontWeight: "700",
  },
  sessionExKcal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF8C42",
  },

  // full session summary strip
  sessionSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.22)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginBottom: 14,
  },
  sessionSummaryIcon: {
    fontSize: 18,
  },
  sessionSummaryText: {
    fontSize: 11,
    color: "#B4ACD9",
    lineHeight: 15,
  },
  sessionSummaryStrong: {
    color: "#B59BFF",
    fontWeight: "700",
  },
  sessionSummaryKcal: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FF8C42",
  },

  // continue button
  continueBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  continueBtnArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // skip
  skipRow: {
    alignItems: "center",
    marginTop: 14,
  },
  skipText: {
    color: "#6B6490",
    fontSize: 12,
  },
});