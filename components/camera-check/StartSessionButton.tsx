// components/camera-check/StartSessionButton.tsx
import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  enabled: boolean;
  onPress?: () => void;
}

export default function StartSessionButton({ enabled, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevEnabled = useRef(enabled);

  useEffect(() => {
    if (enabled && !prevEnabled.current) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: 130, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
    prevEnabled.current = enabled;
  }, [enabled, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={0.9} disabled={!enabled} onPress={onPress}>
        <LinearGradient
          colors={enabled ? ["#34D399", "#7D53FF", "#EC4899"] : ["#5B5570", "#5B5570"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, !enabled && styles.disabled]}
        >
          <Text style={styles.text}>{enabled ? "Start Session" : "Verifying Setup…"}</Text>
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 18,
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  arrow: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
