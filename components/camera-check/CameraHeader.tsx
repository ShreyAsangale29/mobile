                                                          // components/camera-check/CameraHeader.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function CameraHeader() {
  const router = useRouter();

  return (
    <>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => { if (router.canGoBack()) router.back(); }} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color="#B59BFF" />
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP 4 OF 5</Text>
        </View>
      </View>

      <View style={styles.stepper}>
        <StepDot state="done" label={1} />
        <StepLine done />
        <StepDot state="done" label={2} />
        <StepLine done />
        <StepDot state="done" label={3} />
        <StepLine done />
        <StepDot state="active" label={4} />
        <StepLine done={false} />
        <StepDot state="idle" label={5} />
      </View>
    </>
  );
}

function StepDot({ state, label }: { state: "done" | "active" | "idle"; label: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === "active") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 950, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 950, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [state, pulse]);

  if (state === "done") {
    return (
      <LinearGradient colors={["#7D53FF", "#38BDF8"]} style={styles.stepDot}>
        <Text style={styles.stepDotText}>✓</Text>
      </LinearGradient>
    );
  }
  if (state === "active") {
    return (
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient colors={["#34D399", "#7D53FF"]} style={styles.stepDot}>
          <Text style={styles.stepDotText}>{label}</Text>
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

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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
    marginLeft: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(139,92,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
  },
  stepBadgeText: {
    color: "#B59BFF",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotIdle: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.25)",
  },
  stepDotText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  stepDotTextIdle: {
    color: "#6B6490",
    fontWeight: "700",
    fontSize: 11,
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  stepLineIdle: {
    backgroundColor: "rgba(139,92,246,0.15)",
  },
});