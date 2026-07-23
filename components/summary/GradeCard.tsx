import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";

export default function GradeCard() {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = 92;

  const strokeDashoffset =
    circumference -
    (circumference * progress) / 100;

  return (
    <LinearGradient
      colors={[
        "rgba(22,14,50,0.95)",
        "rgba(10,7,24,0.95)",
      ]}
      style={styles.card}
    >
      <View style={styles.ringWrapper}>
        <Svg width={100} height={100}>
          <Defs>
            <SvgGradient
              id="gradeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor="#34D399"
              />
              <Stop
                offset="100%"
                stopColor="#10B981"
              />
            </SvgGradient>
          </Defs>

          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(16,185,129,0.15)"
            strokeWidth="5"
            fill="none"
          />

          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#gradeGradient)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin="50,50"
          />
        </Svg>

        <View style={styles.centerText}>
          <Text style={styles.grade}>
            A+
          </Text>

          <Text style={styles.gradeWord}>
            Excellent
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          Excellent Session
        </Text>

        <Text style={styles.subtitle}>
          You scored in the top 8% of all
          AuraFit users this week.
        </Text>

        <View style={styles.pills}>
          <View style={styles.greenPill}>
            <Text style={styles.greenText}>
              ✓ Form Locked
            </Text>
          </View>

          <View style={styles.purplePill}>
            <Text style={styles.purpleText}>
              ⚡ High Intensity
            </Text>
          </View>

          <View style={styles.orangePill}>
            <Text style={styles.orangeText}>
              🔥 PR Beaten
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
  },

  ringWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  centerText: {
    position: "absolute",
    alignItems: "center",
  },

  grade: {
    color: "#10B981",
    fontSize: 28,
    fontWeight: "800",
  },

  gradeWord: {
    color: "#6EE7B7",
    fontSize: 10,
    fontWeight: "700",
  },

  info: {
    flex: 1,
    marginLeft: 16,
  },

  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  subtitle: {
    color: "#B4ACD9",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  greenPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor:
      "rgba(16,185,129,0.12)",
  },

  greenText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "700",
  },

  purplePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor:
      "rgba(139,92,246,0.12)",
  },

  purpleText: {
    color: "#B59BFF",
    fontSize: 10,
    fontWeight: "700",
  },

  orangePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor:
      "rgba(249,115,22,0.12)",
  },

  orangeText: {
    color: "#FB923C",
    fontSize: 10,
    fontWeight: "700",
  },
});