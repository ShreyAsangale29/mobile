import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExerciseFigure from "./ExerciseFigure";

type Props = {
  id: string;           // ← NEW: needed for figure lookup
  name: string;
  difficulty: string;
  kcal: number;
  tags: string[];
  color: string;
  selected: boolean;
  onPress: () => void;
  difficultyColor?: string;
};

export default function ExerciseCard({
  id,
  name,
  difficulty,
  kcal,
  tags,
  color,
  selected,
  onPress,
  difficultyColor = "#B59BFF",
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }
  function handlePressOut() {
    Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          selected && {
            borderColor: color,
            shadowColor: color,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* left accent bar */}
        <View style={[styles.leftBar, { backgroundColor: color }]} />

        {/* ── figure box (matches HTML design) ── */}
        <ExerciseFigure exerciseId={id} color={color} size={64} />

        {/* ── text info ── */}
        <View style={styles.content}>
          <Text style={styles.title}>{name}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.diffBadge, { backgroundColor: difficultyColor + "22", borderColor: difficultyColor + "55" }]}>
              <Text style={[styles.diffText, { color: difficultyColor }]}>{difficulty}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.kcalText}>~ {kcal} kcal</Text>
          </View>

          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* check circle */}
        <View
          style={[
            styles.checkCircle,
            selected && {
              backgroundColor: color,
              borderColor: color,
              shadowColor: color,
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 4,
            },
          ]}
        >
          {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16112D",
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.14)",
    gap: 12,
  },
  leftBar: {
    width: 3.5,
    alignSelf: "stretch",
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#F8F7FF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    gap: 7,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  diffText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(180,172,217,0.35)",
  },
  kcalText: {
    color: "#B4ACD9",
    fontSize: 11,
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  tag: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9,
  },
  tagText: {
    color: "#B59BFF",
    fontSize: 10,
    fontWeight: "600",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.3)",
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
