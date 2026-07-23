import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function NextWorkoutCard() {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚡</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>
          RECOMMENDED NEXT
        </Text>

        <Text style={styles.title}>
          Pushups + Plank Combo
        </Text>

        <Text style={styles.meta}>
          Tomorrow · 18 min · 140 kcal
        </Text>
      </View>

      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>
          +180 XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 12,
    marginBottom: 16,

    borderRadius: 20,

    backgroundColor:
      "rgba(139,92,246,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(139,92,246,0.25)",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      "rgba(139,92,246,0.18)",
  },

  icon: {
    fontSize: 20,
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  label: {
    fontSize: 9,
    color: "#6B6490",
    fontWeight: "700",
    letterSpacing: 1,
  },

  title: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  meta: {
    color: "#B4ACD9",
    fontSize: 11,
    marginTop: 2,
  },

  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,

    backgroundColor:
      "rgba(16,185,129,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(16,185,129,0.25)",
  },

  xpText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 10,
  },
});