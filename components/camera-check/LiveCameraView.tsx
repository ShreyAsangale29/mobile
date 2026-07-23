// components/camera-check/LiveCameraView.tsx
//
// Real front-camera preview (react-native-vision-camera) with a live SVG
// skeleton drawn from actual MediaPipe BlazePose landmarks, inside the same
// AuraFit-styled viewfinder frame (grid, corner brackets, scan line, AI badge,
// accuracy ring) used across the rest of the app.
//
// Falls back to an animated "searching" ghost figure when:
//   - the native camera/mediapipe modules aren't available (e.g. Expo Go), or
//   - the camera is available but no pose has been detected yet.
//
// IMPORTANT: react-native-vision-camera + react-native-mediapipe are native
// modules. This component will only show a *real* camera feed and *real*
// pose detection inside a custom dev client / EAS build — not in Expo Go.

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import { Landmark } from "../../utils/poseAnalysis";

// Soft-import vision-camera so this file doesn't crash a JS-only/Expo-Go preview.
let VisionCamera: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  VisionCamera = require("react-native-vision-camera").Camera;
} catch {
  VisionCamera = null;
}

interface Props {
  accuracy: number;
  landmarks: Landmark[] | null;
  isNativeAvailable: boolean;
  cameraDevice: unknown;
  frameProcessor: unknown;
}

/** BlazePose 33-point connection topology, grouped for clarity */
const CONNECTIONS: [number, number][] = [
  // face
  [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6],
  // shoulders / torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // left arm
  [11, 13], [13, 15],
  // right arm
  [12, 14], [14, 16],
  // left leg
  [23, 25], [25, 27], [27, 29], [27, 31],
  // right leg
  [24, 26], [26, 28], [28, 30], [28, 32],
];

const KEY_JOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

function LiveSkeleton({ landmarks, width, height }: { landmarks: Landmark[]; width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="jointGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#34D399" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {CONNECTIONS.map(([a, b], i) => {
        const pa = landmarks[a];
        const pb = landmarks[b];
        if (!pa || !pb) return null;
        const visA = pa.visibility ?? pa.presence ?? 1;
        const visB = pb.visibility ?? pb.presence ?? 1;
        if (visA < 0.4 || visB < 0.4) return null;
        return (
          <Line
            key={i}
            x1={pa.x * width}
            y1={pa.y * height}
            x2={pb.x * width}
            y2={pb.y * height}
            stroke="rgba(52,211,153,0.65)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
      {KEY_JOINTS.map((idx) => {
        const p = landmarks[idx];
        if (!p) return null;
        const vis = p.visibility ?? p.presence ?? 1;
        if (vis < 0.4) return null;
        return (
          <Circle
            key={idx}
            cx={p.x * width}
            cy={p.y * height}
            r={4}
            fill="#34D399"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
        );
      })}
    </Svg>
  );
}

function GhostFigure() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View style={[styles.ghostWrap, { opacity }]}>
      <Svg width={120} height={160} viewBox="0 0 120 160">
        <Circle cx={60} cy={20} r={14} stroke="#34D399" strokeWidth={1.6} fill="none" />
        <Line x1={60} y1={34} x2={60} y2={90} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={60} y1={50} x2={32} y2={70} stroke="#34D399" strokeWidth={1.6} strokeLinecap="round" />
        <Line x1={60} y1={50} x2={88} y2={70} stroke="#34D399" strokeWidth={1.6} strokeLinecap="round" />
        <Line x1={60} y1={90} x2={42} y2={130} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={60} y1={90} x2={78} y2={130} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [10, 200] });
  const opacity = anim.interpolate({ inputRange: [0, 0.08, 0.5, 0.92, 1], outputRange: [0, 1, 1, 1, 0] });

  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }], opacity }]} pointerEvents="none" />
  );
}

export default function LiveCameraView({
  accuracy,
  landmarks,
  isNativeAvailable,
  cameraDevice,
  frameProcessor,
}: Props) {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 });
  const liveBadgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(liveBadgePulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(liveBadgePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [liveBadgePulse]);

  const showRealCamera = !!(VisionCamera && cameraDevice);

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {/* Real camera feed when the native module + device are available */}
      {showRealCamera ? (
        <VisionCamera
          style={StyleSheet.absoluteFill}
          device={cameraDevice}
          isActive
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
      )}

      {/* dark vignette so overlay UI stays legible over any footage */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* subtle grid */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      {/* live skeleton or searching ghost */}
      {landmarks && layout.width > 0 ? (
        <LiveSkeleton landmarks={landmarks} width={layout.width} height={layout.height} />
      ) : (
        <GhostFigure />
      )}

      <ScanLine />

      {/* AI tracking badge */}
      <View style={styles.liveBadge}>
        <Animated.View style={[styles.dot, { opacity: liveBadgePulse }]} />
        <Text style={styles.liveText}>
          {showRealCamera ? "AI TRACKING" : "PREVIEW MODE"}
        </Text>
      </View>

      {/* corner brackets */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      {/* accuracy ring */}
      <View style={styles.accuracyRing}>
        <Text style={styles.accuracyValue}>{accuracy}</Text>
        <Text style={styles.accuracyPercent}>%</Text>
      </View>

      {!showRealCamera && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            Live camera + MediaPipe require a custom dev build
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 320,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.3)",
    backgroundColor: "#12082A",
  },
  fallbackBg: {
    backgroundColor: "#12082A",
  },
  vignette: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11,8,26,0.18)",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  ghostWrap: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    marginTop: -80,
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  liveText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: "#34D399",
    borderRadius: 2,
    shadowColor: "#34D399",
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  accuracyRing: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.08)",
  },
  accuracyValue: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
  accuracyPercent: {
    color: "#6EE7B7",
    fontSize: 8,
    fontWeight: "700",
  },
  corner: {
    position: "absolute",
    width: 25,
    height: 25,
    borderColor: "#10B981",
    zIndex: 5,
  },
  topLeft: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2 },
  noticeBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 6,
    alignItems: "center",
  },
  noticeText: {
    color: "#FCD34D",
    fontSize: 9.5,
    fontWeight: "600",
  },
});