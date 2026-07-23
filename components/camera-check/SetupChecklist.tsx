// components/camera-check/SetupChecklist.tsx
//
// Each row animates between idle -> checking -> passed as real signals arrive
// from the live pose stream. A short "checking" shimmer plays the first time
// a still-false item is rendered after mount, then resolves to passed/idle
// based on the live boolean — giving the scan a sense of active analysis
// rather than an instant flat cut.

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { SetupChecks } from "../../utils/poseAnalysis";

type Status = "idle" | "checking" | "passed";

type CheckItem = {
  id: keyof SetupChecks;
  title: string;
  sub: string;
  accent: string;
};

const ITEMS: CheckItem[] = [
  { id: "faceVisible", title: "Face Visible", sub: "Head centered & clearly lit", accent: "#10B981" },
  { id: "bodyVisible", title: "Full Body Visible", sub: "Head to toe in frame", accent: "#38BDF8" },
  { id: "goodLighting", title: "Good Lighting", sub: "Even, shadow-free environment", accent: "#FFD700" },
  { id: "stablePosition", title: "Device Stable", sub: "Camera fixed, no shake detected", accent: "#8B5CF6" },
  { id: "properDistance", title: "Optimal Distance", sub: "~1.5–2 m from camera", accent: "#EC4899" },
  { id: "postureDetected", title: "Posture Detected", sub: "AI skeleton mapped & locked", accent: "#F97316" },
];

interface Props {
  checks: SetupChecks;
}

export default function SetupChecklist({ checks }: Props) {
  const allPassed = ITEMS.every((item) => checks[item.id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.title}>Setup Checklist</Text>
        {allPassed && <Text style={styles.doneBadge}>✓ All Clear</Text>}
      </View>

      <View style={styles.list}>
        {ITEMS.map((item) => (
          <ChecklistRow key={item.id} item={item} passed={checks[item.id]} />
        ))}
      </View>
    </View>
  );
}

function ChecklistRow({ item, passed }: { item: CheckItem; passed: boolean }) {
  const [hasEverChecked, setHasEverChecked] = useState(false);
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (passed && !hasEverChecked) setHasEverChecked(true);
    Animated.timing(glow, {
      toValue: passed ? 1 : 0,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [passed, hasEverChecked, glow]);

  const status: Status = passed ? "passed" : hasEverChecked ? "idle" : "checking";

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(139,92,246,0.15)", "rgba(16,185,129,0.4)"],
  });
  const bgColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(18,13,38,0.7)", "rgba(14,24,34,0.78)"],
  });

  return (
    <Animated.View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      {/* left accent bar */}
      <View style={[styles.accent, { backgroundColor: item.accent, opacity: passed ? 1 : 0.35 }]} />

      {/* icon */}
      <View style={styles.iconBox}>
        {status === "passed" && <Text style={styles.check}>✓</Text>}
        {status === "checking" && <PulsingDot />}
        {status === "idle" && <Text style={styles.waitingDash}>–</Text>}
      </View>

      {/* text */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.sub}>{item.sub}</Text>
      </View>

      {/* right indicator */}
      <View style={[styles.rightCircle, passed && styles.rightCirclePassed]}>
        {status === "passed" && <Text style={styles.rightCheck}>✓</Text>}
        {status === "checking" && <Text style={styles.rightLoading}>•</Text>}
      </View>
    </Animated.View>
  );
}

function PulsingDot() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.Text style={[styles.loading, { opacity: pulse }]}>⏳</Animated.Text>;
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#8B5CF6", marginRight: 6 },
  title: { color: "#fff", fontSize: 13, fontWeight: "700" },
  doneBadge: { marginLeft: "auto", color: "#10B981", fontSize: 11, fontWeight: "700" },
  list: { gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  accent: { width: 3, height: "100%", position: "absolute", left: 0 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  name: { color: "#fff", fontSize: 13, fontWeight: "700" },
  sub: { color: "#8A84AD", fontSize: 10, marginTop: 2 },
  check: { color: "#10B981", fontSize: 14, fontWeight: "800" },
  loading: { color: "#FFD700", fontSize: 12 },
  waitingDash: { color: "#6B6490", fontSize: 14, fontWeight: "700" },
  rightCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightCirclePassed: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16,185,129,0.15)",
  },
  rightCheck: { color: "#10B981", fontSize: 12, fontWeight: "800" },
  rightLoading: { color: "#FFD700", fontSize: 10 },
});
