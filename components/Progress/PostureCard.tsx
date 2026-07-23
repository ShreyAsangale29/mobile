import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Svg, {
  Circle,
} from "react-native-svg";

import { COLORS } from "../../constants/appColors";

export default function PostureCard() {
  const radius = 33;
  const circumference =
    2 * Math.PI * radius;

  const progress = 92;

  const strokeDashoffset =
    circumference -
    (progress / 100) *
      circumference;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        Avg Posture
      </Text>

      <View style={styles.ringContainer}>
        <Svg
          width={90}
          height={90}
        >
          <Circle
            cx="45"
            cy="45"
            r={radius}
            stroke="rgba(16,185,129,0.15)"
            strokeWidth={6}
            fill="none"
          />

          <Circle
            cx="45"
            cy="45"
            r={radius}
            stroke="#10B981"
            strokeWidth={6}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={
              strokeDashoffset
            }
            strokeLinecap="round"
            rotation="-90"
            origin="45,45"
          />
        </Svg>

        <View style={styles.center}>
          <Text style={styles.percent}>
            92%
          </Text>

          <Text style={styles.sub}>
            Posture
          </Text>
        </View>
      </View>

      <Text style={styles.change}>
        ↑ 3% this week
      </Text>
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
      "rgba(16,185,129,0.25)",
  },

  label: {
    color: COLORS.textMuted,

    fontSize: 10,

    fontWeight: "700",

    marginBottom: 10,
  },

  ringContainer: {
    alignItems: "center",

    justifyContent: "center",
  },

  center: {
    position: "absolute",

    alignItems: "center",
  },

  percent: {
    color: COLORS.green,

    fontSize: 20,

    fontWeight: "800",
  },

  sub: {
    color: "#6EE7B7",

    fontSize: 10,
  },

  change: {
    textAlign: "center",

    marginTop: 10,

    color: COLORS.green,

    fontWeight: "700",

    fontSize: 10,
  },
});