// components/yoga/AsanaCard.tsx
import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";
import PoseFigure from "./PoseFigure";
import { YogaPose, LEVEL_COLOR, TAG_STYLE } from "../../data/yogaData";

interface Props {
  pose: YogaPose;
  accent: string;
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function AsanaCard({ pose, accent, selected, onToggle }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: selected ? 1 : 0,
      duration: 280,
      useNativeDriver: false, // backgroundColor/borderColor interpolation needs JS driver
    }).start();
  }, [selected, glow]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onToggle(pose.id);
  };

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(139,92,246,0.15)", accent],
  });
  const bgColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(18,13,38,0.65)", "rgba(22,18,48,0.82)"],
  });
  const barOpacity = glow; // 0 -> 1

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
        <Animated.View
          style={[
            styles.card,
            {
              borderColor,
              backgroundColor: bgColor,
            },
          ]}
        >
          {/* left accent bar, fades in on selection */}
          <Animated.View
            style={[styles.accentBar, { backgroundColor: accent, opacity: barOpacity }]}
          />

          {/* pose figure */}
          <View
            style={[
              styles.figureSlot,
              selected && {
                borderColor: accent + "66",
                backgroundColor: accent + "14",
              },
            ]}
          >
            <PoseFigure figureKey={pose.figureKey} accent={accent} />
          </View>

          {/* info */}
          <View style={styles.info}>
            <Text style={styles.name}>{pose.name}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.level, { color: LEVEL_COLOR[pose.level] }]}>{pose.level}</Text>
              <View style={styles.dotSep} />
              <Text style={styles.meta}>~{pose.kcal} kcal</Text>
              <View style={styles.dotSep} />
              <Text style={styles.meta}>{pose.duration} min</Text>
            </View>
            <View style={styles.tagsRow}>
              {pose.tags.map((tag) => {
                const t = TAG_STYLE[tag];
                return (
                  <View
                    key={tag}
                    style={[styles.tag, { backgroundColor: t.bg, borderColor: t.border }]}
                  >
                    <Text style={[styles.tagText, { color: t.color }]}>{tag}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* check circle */}
          <View
            style={[
              styles.checkCircle,
              selected && { backgroundColor: accent, borderColor: accent },
            ]}
          >
            {selected && (
              <Svg width={10} height={8} viewBox="0 0 10 8" fill="none">
                <Path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    paddingVertical: 10,
    paddingRight: 12,
    paddingLeft: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  figureSlot: {
    width: 58,
    height: 58,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F8F7FF",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  level: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  meta: {
    fontSize: 9,
    color: "#B4ACD9",
    fontWeight: "500",
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(180,172,217,0.35)",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.3)",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
