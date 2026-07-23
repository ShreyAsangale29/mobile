import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import palettes from "../../src/theme/palettes";

type Mood = keyof typeof palettes;

interface AuroraCanvasProps {
  mood: Mood;
  intensity: number;
}

export default function AuroraCanvas({
  mood,
  intensity,
}: AuroraCanvasProps) {
  const colors = palettes[mood] ?? palettes.calm;

  return (
    <LinearGradient
      colors={colors as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        StyleSheet.absoluteFillObject,
        {
          opacity: intensity,
        },
      ]}
    />
    
  );
}