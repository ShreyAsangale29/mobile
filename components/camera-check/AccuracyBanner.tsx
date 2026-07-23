// components/camera-check/AccuracyBanner.tsx
//
// Animated accuracy summary banner. Ring sweep + count-up number are driven
// by the real `accuracy` score computed from live MediaPipe landmarks
// (falls back gracefully to 0 while no pose is detected yet).

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

interface Props {
  accuracy: number; // 0-100
}

const RADIUS = 24;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AccuracyBanner({ accuracy }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: accuracy,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const id = progress.addListener(({ value }) => setDisplayVal(Math.round(value)));
    return () => progress.removeListener(id);
  }, [accuracy, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const isExcellent = accuracy >= 85;
  const isGood = accuracy >= 50 && accuracy < 85;

  const statusLabel = isExcellent ? "Excellent Setup! ✦" : isGood ? "Almost there…" : "Searching for you…";
  const statusColor = isExcellent ? "#34D399" : isGood ? "#FCD34D" : "#8A84AD";
  const subtitle = isExcellent
    ? "Your frame is perfectly aligned."
    : isGood
    ? "Adjust position slightly for a perfect lock."
    : "Step into frame so AI can find you.";

  return (
    <View style={styles.container}>
      <View style={[styles.glow, { backgroundColor: `${statusColor}1F` }]} />

      <View style={styles.ringWrap}>
        <Svg width={64} height={64} viewBox="0 0 64 64">
          <Defs>
            <SvgLinearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="50%" stopColor="#7D53FF" />
              <Stop offset="100%" stopColor="#38BDF8" />
            </SvgLinearGradient>
          </Defs>
          <Circle
            cx={32}
            cy={32}
            r={RADIUS}
            stroke="rgba(16,185,129,0.15)"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={32}
            cy={32}
            r={RADIUS}
            stroke="url(#accGrad)"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            rotation={-90}
            origin="32, 32"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.percent}>{displayVal}%</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: statusColor }]}>{statusLabel}</Text>
        <Text style={styles.subtitle}>
          Posture Tracking Accuracy{"\n"}
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

// react-native-svg Circle supports Animated.Value props directly when wrapped
// with Animated.createAnimatedComponent for strokeDashoffset interpolation.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "rgba(16,185,129,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(16,185,129,0.3)",
  },
  glow: {
    position: "absolute",
    top: -25,
    right: -25,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  ringWrap: {
    width: 64,
    height: 64,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "800",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  subtitle: {
    color: "#B4ACD9",
    fontSize: 11,
    lineHeight: 16,
  },
});
