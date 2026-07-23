import GoalCard from "@/components/goal-selection/GoalCard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Goal {
  id: string;
  title: string;
  description: string;
  emoji: string;
  accent: string;
  accent2: string;
  xp: number;
}

const goals: Goal[] = [
  {
    id: "loss",
    title: "Weight Loss",
    description: "Burn fat & shed those extra kilos faster",
    emoji: "🔥",
    accent: "#EC4899",
    accent2: "#F97316",
    xp: 120,
  },
  {
    id: "muscle",
    title: "Muscle Building",
    description: "Gain strength & sculpt your ideal physique",
    emoji: "💪",
    accent: "#7D53FF",
    accent2: "#38BDF8",
    xp: 100,
  },
  {
    id: "flex",
    title: "Flexibility",
    description: "Improve mobility, posture & reduce pain",
    emoji: "🧘",
    accent: "#10B981",
    accent2: "#38BDF8",
    xp: 80,
  },
  {
    id: "general",
    title: "General Fitness",
    description: "Stay active, healthy & full of energy daily",
    emoji: "⚡",
    accent: "#FFD700",
    accent2: "#F97316",
    xp: 90,
  },
  {
    id: "endurance",
    title: "Endurance",
    description: "Build stamina for runs, sports & marathons",
    emoji: "🏃",
    accent: "#38BDF8",
    accent2: "#8B5CF6",
    xp: 110,
  },
  {
    id: "mindfulness",
    title: "Mindfulness",
    description: "Reduce stress, sleep better & find balance",
    emoji: "🌙",
    accent: "#EC4899",
    accent2: "#8B5CF6",
    xp: 85,
  },
];

const STEPS = [1, 2, 3, 4, 5];

export default function GoalSelectionScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const selectedGoalData = goals.find((g) => g.id === selectedGoal);
  const xpValue = selectedGoalData ? selectedGoalData.xp : 100;

  // Pulsing glow for the active step dot, mirrors the CSS pulse-dot animation
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const activeDotShadowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0.95],
  });

  // Soft fade-in for the AI dot, mirrors the CSS @keyframes pu
  const aiDotPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiDotPulse, {
          toValue: 0.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(aiDotPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [aiDotPulse]);

  return (
    <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Row */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={18} color="#B59BFF" />
            </TouchableOpacity>

            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>STEP 1 OF 5</Text>
            </View>
          </View>

          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            {STEPS.map((item, index) => {
              const isActive = item === 1;
              return (
                <React.Fragment key={item}>
                  {isActive ? (
                    <Animated.View
                      style={[
                        styles.stepDotShadow,
                        { shadowOpacity: activeDotShadowOpacity },
                      ]}
                    >
                      <LinearGradient
                        colors={["#7D53FF", "#EC4899"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.stepDot}
                      >
                        <Text style={styles.activeStepNumber}>{item}</Text>
                      </LinearGradient>
                    </Animated.View>
                  ) : (
                    <View style={[styles.stepDot, styles.idleStepDot]}>
                      <Text style={styles.idleStepNumber}>{item}</Text>
                    </View>
                  )}

                  {index < STEPS.length - 1 && (
                    <View style={styles.stepLine} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            {/* Glow blob, mirrors hero-card::before */}
            <View style={styles.heroGlow} pointerEvents="none" />

            <View style={styles.heroTopRow}>
              <View style={styles.aiBadge}>
                <Animated.View
                  style={[styles.aiDot, { opacity: aiDotPulse }]}
                />
                <Text style={styles.aiBadgeText}>AI Personalising</Text>
              </View>

              <LinearGradient
                colors={["rgba(125,83,255,0.3)", "rgba(236,72,153,0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroIcon}
              >
                <Text style={styles.heroIconEmoji}>🎯</Text>
              </LinearGradient>
            </View>

            <Text style={styles.heroTitle}>
              What is your{"\n"}primary goal?
            </Text>

            <Text style={styles.heroSubtitle}>
              Your AI coach will tailor every workout, diet tip & challenge
              just for you.
            </Text>
          </View>

          {/* Goal Cards */}
          <View style={styles.grid}>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                title={goal.title}
                description={goal.description}
                emoji={goal.emoji}
                accent={goal.accent}
                accent2={goal.accent2}
                selected={selectedGoal === goal.id}
                onPress={() => setSelectedGoal(goal.id)}
              />
            ))}
          </View>

          {/* XP strip */}
          <View style={styles.xpStrip}>
            <Text style={styles.xpIcon}>⭐</Text>
            <Text style={styles.xpText}>
              Pick your goal & earn <Text style={styles.xpStrong}>+100 XP</Text>{" "}
              to kick off your journey!
            </Text>
            <Text style={styles.xpVal}>+{xpValue} XP</Text>
          </View>

          {/* Continue */}
          <TouchableOpacity
            disabled={!selectedGoal}
            activeOpacity={0.85}
            onPress={() => {
              console.log("Button Pressed");
              router.push("/activity-selection");
            }}
          >
            <LinearGradient
              colors={["#7D53FF", "#8B5CF6", "#B59BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.continueButton,
                !selectedGoal && styles.disabledButton,
              ]}
            >
              <Text style={styles.continueText}>Continue Journey</Text>
              <View style={styles.btnArrow}>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipRow}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B081A",
  },

  container: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 48,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#B59BFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 22,
  },

  stepDotShadow: {
    borderRadius: 14,
    shadowColor: "#7D53FF",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },

  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  idleStepDot: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.25)",
  },

  activeStepNumber: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },

  idleStepNumber: {
    color: "#6B6490",
    fontSize: 11,
    fontWeight: "700",
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(139,92,246,0.18)",
  },

  heroCard: {
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    borderRadius: 24,
    padding: 18,
    paddingTop: 22,
    overflow: "hidden",
    marginBottom: 20,
  },

  heroGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(125,83,255,0.18)",
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },

  aiBadgeText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  heroIconEmoji: {
    fontSize: 22,
  },

  heroTitle: {
    color: "#F8F7FF",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  heroSubtitle: {
    color: "#B4ACD9",
    fontSize: 12,
    lineHeight: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  xpStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(26,20,51,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  xpIcon: {
    fontSize: 18,
  },

  xpText: {
    flex: 1,
    color: "#B4ACD9",
    fontSize: 11,
    lineHeight: 16,
  },

  xpStrong: {
    color: "#FFD700",
    fontWeight: "700",
  },

  xpVal: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "800",
  },

  continueButton: {
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#7D53FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },

  disabledButton: {
    opacity: 0.45,
  },

  continueText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  skipRow: {
    marginTop: 14,
    alignItems: "center",
  },

  skipText: {
    color: "#6B6490",
    fontSize: 12,
  },
});