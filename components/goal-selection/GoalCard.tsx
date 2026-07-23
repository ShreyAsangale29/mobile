import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export interface GoalCardProps {
  title: string;
  description: string;
  /** Emoji shown in the icon chip — matches the HTML design's emoji icons */
  emoji: string;
  /** Primary accent used for border/glow/check when selected */
  accent: string;
  /** Secondary accent used for the icon-chip gradient when selected */
  accent2: string;
  selected: boolean;
  onPress: () => void;
}

export default function GoalCard({
  title,
  description,
  emoji,
  accent,
  accent2,
  selected,
  onPress,
}: GoalCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        style={[
          styles.card,
          selected && {
            borderColor: accent,
            backgroundColor: "rgba(26,20,51,0.7)",
            shadowColor: accent,
          },
        ]}
      >
        {/* Tinted overlay wash when selected */}
        {selected && (
          <LinearGradient
            colors={[
              hexToRgba(accent, 0.12),
              hexToRgba(accent2, 0.08),
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Check circle, top-right */}
        <View
          style={[
            styles.checkCircle,
            selected && {
              backgroundColor: accent,
              borderColor: accent,
              shadowColor: accent,
            },
          ]}
        >
          {selected && (
            <Ionicons name="checkmark" size={12} color="#FFF" />
          )}
        </View>

        {/* Icon chip */}
        {selected ? (
          <LinearGradient
            colors={[
              hexToRgba(accent, 0.3),
              hexToRgba(accent2, 0.2),
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.iconChip,
              { borderColor: hexToRgba(accent, 0.4) },
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.iconChip}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        )}

        <Text
          style={[
            styles.title,
            selected && { color: "#FFFFFF" },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.description}>{description}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Converts a #RRGGBB hex string to an rgba() string at the given alpha. */
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: "48%",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "rgba(26,20,51,0.55)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.2)",
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: "hidden",
    shadowOpacity: 0,
    elevation: 0,
  },

  checkCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  iconChip: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  emoji: {
    fontSize: 22,
  },

  title: {
    color: "#F8F7FF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 17,
  },

  description: {
    color: "#B4ACD9",
    fontSize: 10,
    lineHeight: 14,
  },
});