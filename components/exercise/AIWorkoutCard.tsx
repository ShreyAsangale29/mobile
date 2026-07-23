import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  selected: boolean;
  onPress: () => void;
};

export default function AIWorkoutCard({
  selected,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.selectedCard,
      ]}
    >
      {/* Top Row */}

      <View style={styles.topRow}>
        <View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              ⭐ Most Recommended
            </Text>
          </View>

          <Text style={styles.subLabel}>
            Tailored to your goal
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name="sparkles"
            size={24}
            color="#FFD700"
          />
        </View>
      </View>

      {/* Content */}

      <View style={styles.content}>
        <View style={styles.avatarCircle}>
          <Ionicons
            name="fitness"
            size={34}
            color="#FFD700"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Personalized AI Workout
          </Text>

          <Text style={styles.description}>
            Full-body workout generated
            according to your activity,
            goals and fitness level.
          </Text>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                ⚡ All Levels
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                🔥 350 kcal
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                ✦ AI Curated
              </Text>
            </View>
          </View>
        </View>
      </View>

      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons
            name="checkmark"
            size={18}
            color="#fff"
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#18102D",

    borderRadius: 24,

    padding: 18,

    marginBottom: 18,

    borderWidth: 2,

    borderColor: "rgba(255,215,0,0.4)",

    position: "relative",
  },

  selectedCard: {
    borderColor: "#FFD700",

    shadowColor: "#FFD700",

    shadowOpacity: 0.5,

    shadowRadius: 10,

    elevation: 8,
  },

  topRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 16,
  },

  badge: {
    backgroundColor:
      "rgba(255,215,0,0.15)",

    borderRadius: 20,

    paddingHorizontal: 12,

    paddingVertical: 6,
  },

  badgeText: {
    color: "#FFD700",

    fontSize: 11,

    fontWeight: "700",
  },

  subLabel: {
    color: "#B4ACD9",

    marginTop: 6,

    fontSize: 12,
  },

  iconContainer: {
    width: 52,

    height: 52,

    borderRadius: 16,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor:
      "rgba(255,215,0,0.1)",
  },

  content: {
    flexDirection: "row",

    gap: 14,
  },

  avatarCircle: {
    width: 70,

    height: 70,

    borderRadius: 35,

    backgroundColor:
      "rgba(255,215,0,0.1)",

    justifyContent: "center",

    alignItems: "center",
  },

  title: {
    color: "#FFF",

    fontSize: 20,

    fontWeight: "800",

    marginBottom: 6,
  },

  description: {
    color: "#B4ACD9",

    fontSize: 12,

    lineHeight: 18,

    marginBottom: 12,
  },

  tagsRow: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 6,
  },

  tag: {
    backgroundColor:
      "rgba(255,215,0,0.1)",

    borderRadius: 12,

    paddingHorizontal: 10,

    paddingVertical: 5,
  },

  tagText: {
    color: "#FFD700",

    fontSize: 10,

    fontWeight: "600",
  },

  checkBadge: {
    position: "absolute",

    top: 12,

    right: 12,

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: "#FFD700",

    justifyContent: "center",

    alignItems: "center",
  },
});