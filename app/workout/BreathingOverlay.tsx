import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Props = {
  secondsLeft: number;
  totalSeconds: number;
  nextLabel: string;
  nextName: string;
  nextHowTo?: string;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
};

export default function BreathingOverlay({
  secondsLeft,
  totalSeconds,
  nextLabel,
  nextName,
  nextHowTo,
  onSkip,
  currentStep,
  totalSteps,
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const [breathText, setBreathText] = useState("Breathe In");

  useEffect(() => {
    // 4s inhale, 4s exhale cycle
    scale.value = withRepeat(
      withTiming(1.6, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    opacity.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    let inhale = true;
    const interval = setInterval(() => {
      inhale = !inhale;
      setBreathText(inhale ? "Breathe In" : "Breathe Out");
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const progress = totalSeconds > 0 ? 1 - Math.max(secondsLeft, 0) / totalSeconds : 1;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Step Indicator */}
        <Text style={styles.stepText}>
          {currentStep} of {totalSteps} Completed
        </Text>

        <Text style={styles.restTitle}>REST & RECOVER</Text>
        <Text style={styles.timer}>{Math.max(secondsLeft, 0)}s</Text>

        {/* Breathing Animation */}
        <View style={styles.breathingContainer}>
          <Animated.View style={[styles.breathingCircle, animatedCircleStyle]} />
          <View style={styles.breathingCore}>
            <Text style={styles.breathingText}>{breathText}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        {/* Next Exercise Info */}
        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>{nextLabel}</Text>
          <Text style={styles.nextName}>{nextName}</Text>
          {nextHowTo ? <Text style={styles.nextHowTo}>{nextHowTo}</Text> : null}
        </View>

        {/* Skip Rest Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Ionicons name="play-forward-outline" size={16} color="#D1D5DB" />
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  stepText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  restTitle: {
    color: "#6EE7B7",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  timer: {
    color: "#fff",
    fontSize: 44,
    fontWeight: "800",
    marginTop: 4,
  },
  breathingContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  breathingCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(110, 231, 183, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(110, 231, 183, 0.4)",
  },
  breathingCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#6EE7B7",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#6EE7B7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  breathingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  track: {
    width: 160,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 20,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#6EE7B7",
    borderRadius: 2,
  },
  nextCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
    alignItems: "center",
  },
  nextLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  nextName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  nextHowTo: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 18,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  skipText: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "600",
  },
});