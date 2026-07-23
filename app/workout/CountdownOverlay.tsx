import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";

type Props = {
  value: number; // 3, 2, 1, 0 (0 renders as "GO!")
  label?: string;
};

export default function CountdownOverlay({ value, label }: Props) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <BlurView intensity={50} style={styles.card}>
        <Text style={styles.big}>{value > 0 ? value : "GO!"}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  card: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  big: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "800",
  },
  label: {
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 12,
  },
});