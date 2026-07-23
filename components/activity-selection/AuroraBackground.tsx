import React, { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function AuroraBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const move1 = useSharedValue(-80);
  const move2 = useSharedValue(120);
  const move3 = useSharedValue(-150);

  useEffect(() => {
    move1.value = withRepeat(
      withTiming(120, {
        duration: 12000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    move2.value = withRepeat(
      withTiming(-100, {
        duration: 15000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    move3.value = withRepeat(
      withTiming(150, {
        duration: 18000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [move1, move2, move3]);

  const aurora1 = useAnimatedStyle(() => ({
    transform: [{ translateY: move1.value }],
  }));

  const aurora2 = useAnimatedStyle(() => ({
    transform: [{ translateX: move2.value }],
  }));

  const aurora3 = useAnimatedStyle(() => ({
    transform: [{ translateY: move3.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.baseBackground} />

      {/* Purple */}
      <Animated.View
        style={[styles.blobLarge, aurora1]}
      >
        <LinearGradient
          colors={[
            "rgba(125,83,255,0.45)",
            "transparent",
          ]}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Cyan */}
      <Animated.View
        style={[styles.blobMedium, aurora2]}
      >
        <LinearGradient
          colors={[
            "rgba(56,189,248,0.35)",
            "transparent",
          ]}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Pink */}
      <Animated.View
        style={[styles.blobSmall, aurora3]}
      >
        <LinearGradient
          colors={[
            "rgba(236,72,153,0.30)",
            "transparent",
          ]}
          style={styles.gradient}
        />
      </Animated.View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B081A",
  },

  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B081A",
  },

  gradient: {
    flex: 1,
    borderRadius: 999,
  },

  blobLarge: {
    position: "absolute",
    width: width * 1.3,
    height: 280,
    top: 40,
    left: -120,
    borderRadius: 999,
    overflow: "hidden",
  },

  blobMedium: {
    position: "absolute",
    width: width,
    height: 240,
    top: height * 0.3,
    right: -120,
    borderRadius: 999,
    overflow: "hidden",
  },

  blobSmall: {
    position: "absolute",
    width: width * 1.1,
    height: 220,
    bottom: 120,
    left: -80,
    borderRadius: 999,
    overflow: "hidden",
  },
});