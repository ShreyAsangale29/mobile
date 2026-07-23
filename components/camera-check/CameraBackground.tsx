// components/camera-check/CameraBackground.tsx
//
// Animated aurora glow background, matching the AuraFit visual language used
// across the exercise/yoga selection screens. Pure Animated + SVG (no canvas),
// safe to mount behind a live Camera view since it's absolutely positioned
// and pointerEvents="none".

import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Dimensions, StyleSheet, View, Easing } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const BANDS = [
  { hue: "#7D53FF", topPct: 0.08, amp: 40, dur: 9000, size: 220 },
  { hue: "#10B981", topPct: 0.32, amp: 55, dur: 13000, size: 200 },
  { hue: "#38BDF8", topPct: 0.58, amp: 35, dur: 11000, size: 180 },
  { hue: "#EC4899", topPct: 0.8, amp: 45, dur: 15000, size: 170 },
];

function AuroraBlob({
  hue,
  topPct,
  amp,
  dur,
  size,
}: {
  hue: string;
  topPct: number;
  amp: number;
  dur: number;
  size: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  const idRef = useRef(`blob-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [drift, dur]);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-amp, amp] });
  const opacity = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.45, 0.8, 0.45] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: SCREEN_H * topPct - size / 2,
        left: SCREEN_W / 2 - size / 2,
        width: size,
        height: size,
        transform: [{ translateY }],
        opacity,
      }}
      pointerEvents="none"
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={idRef.current} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={hue} stopOpacity={0.3} />
            <Stop offset="45%" stopColor={hue} stopOpacity={0.12} />
            <Stop offset="100%" stopColor={hue} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${idRef.current})`} />
      </Svg>
    </Animated.View>
  );
}

interface Props {
  /** dim the background further while the live camera is active, so it reads through nicely */
  dim?: boolean;
}

export default function CameraBackground({ dim = false }: Props) {
  const bands = useMemo(() => BANDS, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0B081A" }]} pointerEvents="none">
      {bands.map((b, i) => (
        <AuroraBlob key={i} {...b} />
      ))}
      {dim && <View style={[StyleSheet.absoluteFill, styles.dimOverlay]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  dimOverlay: {
    backgroundColor: "rgba(11,8,26,0.35)",
  },
});
