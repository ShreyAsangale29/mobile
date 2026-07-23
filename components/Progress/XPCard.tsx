import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../constants/appColors";

export default function XPCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        XP Earned
      </Text>

      <Text style={styles.value}>
        850
      </Text>

      <Text style={styles.sub}>
        / 1000 XP to next level
      </Text>

      <View style={styles.barBackground}>
        <View
          style={styles.barFill}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.level}>
          Lv. 6 Athlete
        </Text>

        <Text style={styles.level}>
          850 / 1000
        </Text>
      </View>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Text
            style={styles.badgeText}
          >
            🏆 3 Badges
          </Text>
        </View>

        <View style={styles.badge}>
          <Text
            style={styles.badgeText}
          >
            ⭐ Top 8%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    backgroundColor:
      "rgba(18,13,38,0.72)",

    borderRadius: 22,

    padding: 15,

    borderWidth: 1,

    borderColor:
      "rgba(255,215,0,0.25)",
  },

  label: {
    color: COLORS.textMuted,

    fontSize: 10,

    fontWeight: "700",
  },

  value: {
    color: COLORS.gold,

    fontSize: 28,

    fontWeight: "800",

    marginTop: 5,
  },

  sub: {
    color: COLORS.textMuted,

    fontSize: 10,

    marginBottom: 12,
  },

  barBackground: {
    height: 6,

    backgroundColor:
      "rgba(255,215,0,0.1)",

    borderRadius: 10,
  },

  barFill: {
    width: "85%",

    height: 6,

    borderRadius: 10,

    backgroundColor:
      COLORS.gold,
  },

  row: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    marginTop: 8,
  },

  level: {
    color: COLORS.textMuted,

    fontSize: 10,
  },

  badges: {
    flexDirection: "row",

    marginTop: 12,
  },

  badge: {
    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 10,

    backgroundColor:
      "rgba(255,215,0,0.1)",

    marginRight: 6,
  },

  badgeText: {
    color: COLORS.gold,

    fontSize: 9,

    fontWeight: "700",
  },
});