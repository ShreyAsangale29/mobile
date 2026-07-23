// components/yoga/AuroraBackground.tsx
// RN has no <canvas>, so the aurora glow + drifting crystal particles from the
// HTML reference are rebuilt with react-native-svg + native-driven Animated loops.
// Visually: soft hue-shifting radial blobs drifting vertically (aurora bands)
// behind a field of slowly falling, twinkling 6-point "crystal" sparkles.

import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Dimensions, StyleSheet, View, Easing } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop, G } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

/* ── Aurora band config (hue, vertical anchor %, drift amplitude, duration) ── */
const BANDS = [
  { hue: "#34D399", topPct: 0.12, amp: 60, dur: 9000, size: 260 },
  { hue: "#7D53FF", topPct: 0.34, amp: 50, dur: 13000, size: 220 },
  { hue: "#2DD4BF", topPct: 0.55, amp: 70, dur: 16000, size: 240 },
  { hue: "#10B981", topPct: 0.74, amp: 45, dur: 11000, size: 200 },
];

function AuroraBand({
  hue,
  topPct,
  amp,
  dur,
  size,
  screenH,
}: {
  hue: string;
  topPct: number;
  amp: number;
  dur: number;
  size: number;
  screenH: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;

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

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-amp, amp],
  });
  const opacity = drift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.85, 0.5],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: screenH * topPct - size / 2,
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
          <RadialGradient id="band" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={hue} stopOpacity={0.32} />
            <Stop offset="45%" stopColor={hue} stopOpacity={0.14} />
            <Stop offset="100%" stopColor={hue} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#band)" />
      </Svg>
    </Animated.View>
  );
}

/* ── Six-point crystal sparkle, ported from the canvas drawCrystal() routine ── */
function Crystal({ size, color, accent }: { size: number; color: string; accent: string }) {
  const half = size;
  const big = size * 0.55;
  const branch = size * 0.28;
  const spikes = [0, 60, 120, 180, 240, 300];
  return (
    <Svg width={size * 2} height={size * 2} viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}>
      <G>
        {spikes.map((deg) => (
          <G key={deg} rotation={deg} originX={0} originY={0}>
            <Line x1={0} y1={0} x2={0} y2={-half} stroke={color} strokeWidth={size > 6 ? 1 : 0.65} strokeLinecap="round" />
            {size > 5 && (
              <>
                <Line
                  x1={0}
                  y1={-big}
                  x2={branch * 0.6}
                  y2={-big - branch * 0.6}
                  stroke={accent}
                  strokeWidth={0.6}
                />
                <Line
                  x1={0}
                  y1={-big}
                  x2={-branch * 0.6}
                  y2={-big - branch * 0.6}
                  stroke={accent}
                  strokeWidth={0.6}
                />
              </>
            )}
          </G>
        ))}
        {size > 6 && <Circle cx={0} cy={0} r={size * 0.08} fill={color} />}
      </G>
    </Svg>
  );
}

interface FlakeConfig {
  startX: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  baseOpacity: number;
  colorIdx: number;
}

const FLAKE_COLORS = [
  { color: "rgba(200,255,220,0.9)", accent: "rgba(180,172,217,0.5)" },
  { color: "rgba(180,172,217,0.8)", accent: "rgba(200,255,220,0.45)" },
];

function FallingCrystal({ cfg, screenH }: { cfg: FlakeConfig; screenH: number }) {
  const fall = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fallLoop = Animated.loop(
      Animated.timing(fall, {
        toValue: 1,
        duration: cfg.duration,
        delay: cfg.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const twinkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    fallLoop.start();
    twinkleLoop.start();
    return () => {
      fallLoop.stop();
      twinkleLoop.stop();
    };
  }, [fall, twinkle, cfg.duration, cfg.delay]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, screenH + 40],
  });
  const translateX = fall.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, cfg.driftX, 0],
  });
  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const opacity = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [cfg.baseOpacity * 0.65, cfg.baseOpacity],
  });

  const palette = FLAKE_COLORS[cfg.colorIdx % FLAKE_COLORS.length];

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: cfg.startX,
        transform: [{ translateY }, { translateX }, { rotate }],
        opacity,
      }}
      pointerEvents="none"
    >
      <Crystal size={cfg.size} color={palette.color} accent={palette.accent} />
    </Animated.View>
  );
}

interface AuroraBackgroundProps {
  /** Height of the scroll content area this background sits behind */
  height?: number;
  flakeCount?: number;
}

export default function AuroraBackground({
  height = Dimensions.get("window").height,
  flakeCount = 26,
}: AuroraBackgroundProps) {
  const flakes = useMemo<FlakeConfig[]>(
    () =>
      Array.from({ length: flakeCount }, (_, i) => ({
        startX: Math.random() * SCREEN_W,
        size: Math.random() * 5 + 2.5,
        duration: Math.random() * 6000 + 9000,
        delay: Math.random() * 4000,
        driftX: (Math.random() - 0.5) * 40,
        baseOpacity: Math.random() * 0.35 + 0.15,
        colorIdx: i,
      })),
    [flakeCount]
  );

  return (
    <View style={[StyleSheet.absoluteFill, { height, backgroundColor: "#0B081A" }]} pointerEvents="none">
      {/* Base dark wash so SVG gradients have something deep to sit on */}
      <View style={StyleSheet.absoluteFill} />

      {BANDS.map((b, i) => (
        <AuroraBand key={i} {...b} screenH={height} />
      ))}

      {flakes.map((cfg, i) => (
        <FallingCrystal key={i} cfg={cfg} screenH={height} />
      ))}
    </View>
  );
}
