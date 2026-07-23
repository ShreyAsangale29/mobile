import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
Dimensions.get("window");

const activities = [
  {
    id: "yoga",
    title: "Yoga",
    subtitle: "Flow, breathe & find balance",
    tag: "Mind & Body",
    icon: "leaf",
    accent: "#10B981",
    xpData: {
      xp: 150,
      icon: "🧘",
      text: "Yoga path selected — unlock +150 XP and start your first flow!",
    },
  },
  {
    id: "exercise",
    title: "Exercise",
    subtitle: "Train hard, push limits",
    tag: "Strength",
    icon: "barbell",
    accent: "#8B5CF6",
    xpData: {
      xp: 150,
      icon: "💪",
      text: "Exercise path selected — unlock +150 XP and start training!",
    },
    recommended: true,
  },
];

const tips = [
  {
    icon: "💧",
    title: "Hydration",
    text: "Drink water first thing — jumpstart your metabolism.",
    color: "#10B981",
    isNew: true,
  },
  {
    icon: "🌬️",
    title: "Breathwork",
    text: "4-7-8 breathing cuts cortisol and resets your nervous system.",
    color: "#38BDF8",
  },
  {
    icon: "🍌",
    title: "Nutrition",
    text: "Eat a banana 30 min before training — natural fuel without crash.",
    color: "#EC4899",
  },
  {
    icon: "😴",
    title: "Recovery",
    text: "Muscles grow while you sleep — 7-9 hrs is crucial.",
    color: "#FFD700",
  },
];

// ── Animated breathing glow component ──
const AnimatedGlowCard = ({ selected, children, accentColor }: any) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!selected) {
      // Breathing pulse for unselected cards
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2250,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2250,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Glow pulse for selected card
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1300,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1300,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [selected, glowAnim]);

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const brightness = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, selected ? 1.08 : 1.07],
  });

  return (
    <Animated.View
      style={[
        {
          opacity: brightness,
          shadowOpacity,
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 16,
          elevation: 8,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ── Pop animation for check badge ──
const PopCheckmark = ({ visible }: any) => {
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      popAnim.setValue(0);
      Animated.spring(popAnim, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, popAnim]);

  const scale = popAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.4, 1.25, 1],
  });

  return (
    <Animated.View
      style={[
        styles.checkBadge,
        {
          transform: [{ scale }],
          opacity: visible ? 1 : 0,
        },
      ]}
    >
      <Ionicons name="checkmark" size={14} color="#FFF" />
    </Animated.View>
  );
};

// ── XP strip with dynamic content ──
const XPStrip = ({ selectedActivity }: any) => {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const bumpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedActivity) {
      // Flash border animation
      flashAnim.setValue(0);
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();

      // Bump scale animation
      bumpAnim.setValue(0);
      Animated.sequence([
        Animated.timing(bumpAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bumpAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedActivity, flashAnim, bumpAnim]);

  const borderColor = flashAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [
      "rgba(255,215,0,0.2)",
      "rgba(255,215,0,0.7)",
      "rgba(255,215,0,0.2)",
    ],
  });

  const xpScale = bumpAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.25, 1],
  });

  const activity = activities.find((a) => a.id === selectedActivity);
  const xpData = activity?.xpData || {
    xp: 150,
    icon: "⭐",
    text: "Choose your path & unlock +150 XP for your journey!",
  };

  return (
    <Animated.View
      style={[
        styles.xpContainer,
        { borderColor },
      ]}
    >
      <Text style={styles.xpIcon}>{xpData.icon}</Text>
      <View style={styles.xpTextWrapper}>
        <Text style={styles.xpText}>{xpData.text}</Text>
      </View>
      <Animated.Text
        style={[styles.xpVal, { transform: [{ scale: xpScale }] }]}
      >
        +{xpData.xp} XP
      </Animated.Text>
    </Animated.View>
  );
};

// ── Shimmer badge ──
const ShimmerBadge = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: false,
      })
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1, 0.7],
  });

  return (
    <Animated.View
      style={[styles.newBadge, { opacity }]}
    >
      <Text style={styles.newBadgeText}>NEW</Text>
    </Animated.View>
  );
};

// ── Scan ring animation on hero icon ──
const ScanRingIcon = () => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const scale = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.25],
  });

  const opacity = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 0],
  });

  return (
    <View style={styles.heroIconBox}>
      <Animated.View
        style={[
          styles.scanRing,
          { transform: [{ scale }], opacity },
        ]}
      />
      <Ionicons
        name="fitness"
        size={26}
        color="#A855F7"
      />
    </View>
  );
};

// ── Tip card with entrance animation ──
const TipCardAnimated = ({ tip, delay }: any) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.tipCard,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          borderColor: `${tip.color}40`,
        },
      ]}
    >
      {tip.isNew && <ShimmerBadge />}
      <Text style={styles.tipIcon}>{tip.icon}</Text>
      <Text style={styles.tipTitle}>{tip.title}</Text>
      <Text style={styles.tipText}>{tip.text}</Text>
    </Animated.View>
  );
};

// ── Main component ──
export default function ActivitySelection() {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const continueButtonScale = useRef(new Animated.Value(1)).current;

  // Button bounce when enabled
  useEffect(() => {
    // Avoid accessing internal _value. Use __getValue if available, otherwise assume 1.
    const currentScale = (continueButtonScale as any).__getValue ? (continueButtonScale as any).__getValue() : 1;
    if (selectedActivity && currentScale !== 1) {
      Animated.spring(continueButtonScale, {
        toValue: 1.035,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(continueButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [selectedActivity, continueButtonScale]);

  return (
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
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 2 OF 5</Text>
          </View>
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          {[1, 2, 3, 4, 5].map((item, index) => (
            <React.Fragment key={item}>
              <View
                style={[
                  styles.stepCircle,
                  item === 1 && styles.doneStepCircle,
                  item === 2 && styles.activeStepCircle,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (item === 1 || item === 2) && styles.activeStepNumber,
                  ]}
                >
                  {item === 1 ? "✓" : item}
                </Text>
              </View>
              {index < 4 && (
                <View
                  style={[
                    styles.stepLine,
                    item < 2 && styles.doneStepLine,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>● AI Personalising</Text>
            </View>
            <ScanRingIcon />
          </View>

          <Text style={styles.heroTitle}>
            Choose your{"\n"}practice path
          </Text>

          <Text style={styles.heroSubtitle}>
            Your AI coach builds routines around your chosen discipline. You can always mix later.
          </Text>
        </View>

        {/* Activity Cards with glow animations */}
        <View style={styles.cardsContainer}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.cardWrapper}>
              <AnimatedGlowCard
                selected={selectedActivity === activity.id}
                accentColor={activity.accent}
              >
                <TouchableOpacity
                  style={[
                    styles.activityCardTouchable,
                    selectedActivity === activity.id && {
                      borderColor: activity.accent,
                    },
                  ]}
                  onPress={() => setSelectedActivity(activity.id)}
                >
                  {/* Recommended ribbon */}
                  {activity.recommended && (
                    <View style={styles.recommendedRibbon}>
                      <Text style={styles.recommendedText}>✦ Matches your goal</Text>
                    </View>
                  )}

                  {/* Card content */}
                  <View style={styles.activityCardContent}>
                    <View
                      style={[
                        styles.activityIconBox,
                        { backgroundColor: `${activity.accent}20` },
                      ]}
                    >
                      <Ionicons
                        name={activity.icon as any}
                        size={28}
                        color={activity.accent}
                      />
                    </View>
                    <Text style={styles.activityTag}>{activity.tag}</Text>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>

                  {/* Check badge with pop animation */}
                  <PopCheckmark visible={selectedActivity === activity.id} />
                </TouchableOpacity>
              </AnimatedGlowCard>
            </View>
          ))}
        </View>

        {/* XP Strip with dynamic content */}
        <XPStrip selectedActivity={selectedActivity} />

        {/* Continue Button with bounce */}
        <Animated.View
          style={{
            transform: [{ scale: continueButtonScale }],
          }}
        >
          <TouchableOpacity
            disabled={!selectedActivity}
            style={[
              styles.continueButton,
              !selectedActivity && styles.disabledButton,
            ]}
            onPress={() => {
              if (selectedActivity === "exercise") {
                router.push("/exercise-selection");
              } else if (selectedActivity === "yoga") {
                router.push("/YogaSelectionScreen");
              }
            }}
          >
            <Text style={styles.continueText}>Continue Journey</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </Animated.View>

        {/* Tips Section */}
        <View style={styles.tipsHeader}>
          <Text style={styles.tipsHeading}>Daily Health Tips</Text>
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>✦ TODAY</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tipsScroll}
        >
          {tips.map((tip, index) => (
            <TipCardAnimated key={index} tip={tip} delay={150 + index * 100} />
          ))}
        </ScrollView>

        <View style={{ height: 20 }} />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0B081A",
    minHeight: "100%",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  stepBadge: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(139,92,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
  },

  stepBadgeText: {
    color: "#B59BFF",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    marginHorizontal: -4,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  doneStepCircle: {
    backgroundColor: "#7D53FF",
    borderColor: "#38BDF8",
  },

  activeStepCircle: {
    backgroundColor: "#7D53FF",
    borderColor: "#EC4899",
  },

  stepNumber: {
    color: "#6B6490",
    fontWeight: "700",
    fontSize: 12,
  },

  activeStepNumber: {
    color: "#FFF",
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(139,92,246,0.18)",
    marginHorizontal: 0,
  },

  doneStepLine: {
    backgroundColor: "#7D53FF",
  },

  heroCard: {
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  aiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },

  aiBadgeText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.3,
  },

  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(125,83,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  scanRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(16,185,129,0.5)",
  },

  heroTitle: {
    color: "#FFF",
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

  cardsContainer: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },

  cardWrapper: {
    flex: 1,
  },

  activityCardTouchable: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "rgba(26,20,51,0.55)",
    paddingBottom: 16,
    minHeight: 220,
  },

  activityCardContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  activityIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  activityTag: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignSelf: "flex-start",
    color: "#B4ACD9",
  },

  activityTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#FFF",
    marginBottom: 4,
    lineHeight: 22,
  },

  activitySubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 14,
  },

  recommendedRibbon: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  recommendedText: {
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#0B081A",
  },

  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#8B5CF6",
    borderWidth: 2,
    borderColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  xpContainer: {
    backgroundColor: "rgba(26,20,51,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  xpIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  xpTextWrapper: {
    flex: 1,
  },

  xpText: {
    fontSize: 11,
    color: "#B4ACD9",
    lineHeight: 16,
  },

  xpVal: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFD700",
    marginLeft: 8,
  },

  continueButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  disabledButton: {
    opacity: 0.45,
  },

  continueText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  tipsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  tipsHeading: {
    color: "#F8F7FF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  todayBadge: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  todayText: {
    color: "#FFD700",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  tipsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },

  tipCard: {
    width: 160,
    marginRight: 10,
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(26,20,51,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    position: "relative",
  },

  newBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },

  newBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#0B081A",
    letterSpacing: 0.5,
  },

  tipIcon: {
    fontSize: 18,
    marginBottom: 9,
  },

  tipTitle: {
    color: "#E5E0FF",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 7,
    lineHeight: 13,
  },

  tipText: {
    color: "#94A3B8",
    fontSize: 9.5,
    lineHeight: 13,
  },
});