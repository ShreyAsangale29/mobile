import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";

import { LineChart } from "react-native-chart-kit";

import { COLORS } from "../../constants/appColors";

const screenWidth = Dimensions.get("window").width;

const chartData = {
  Calories: {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    data: [280, 340, 420, 310, 390, 450, 160],
    color: "#F97316",
  },

  Duration: {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    data: [22, 35, 48, 30, 42, 55, 18],
    color: "#8B5CF6",
  },

  Reps: {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    data: [140, 180, 220, 160, 200, 240, 100],
    color: "#10B981",
  },
};

export default function WorkoutChart() {
  const [selected, setSelected] =
    useState<"Calories" | "Duration" | "Reps">(
      "Calories"
    );

  const current =
    chartData[selected];

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.left}>
          <View style={styles.dot} />

          <Text style={styles.title}>
            Workout Overview
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          {Object.keys(chartData).map((item) => (
            <Pressable
              key={item}
              onPress={() =>
                setSelected(
                  item as
                    | "Calories"
                    | "Duration"
                    | "Reps"
                )
              }
              style={[
                styles.toggleButton,
                selected === item &&
                  styles.activeButton,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  selected === item &&
                    styles.activeText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Chart */}

      <LineChart
        data={{
          labels: current.labels,
          datasets: [
            {
              data: current.data,
            },
          ],
        }}
        width={screenWidth - 60}
        height={220}
        withDots
        withShadow
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
        bezier
        chartConfig={{
          backgroundColor: "#0B081A",

          backgroundGradientFrom:
            "#0B081A",

          backgroundGradientTo:
            "#0B081A",

          decimalPlaces: 0,

          color: () => current.color,

          labelColor: () =>
            COLORS.textMuted,

          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: current.color,
          },

          propsForBackgroundLines: {
            stroke:
              "rgba(255,255,255,0.06)",
          },
        }}
        style={styles.chart}
      />

      {/* Legend */}

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor:
                  current.color,
              },
            ]}
          />

          <Text style={styles.legendText}>
            This Week
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:
      "rgba(18,13,38,0.72)",

    borderRadius: 24,

    padding: 15,

    borderWidth: 1,

    borderColor:
      "rgba(139,92,246,0.15)",

    marginBottom: 15,
  },

  header: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 15,
  },

  left: {
    flexDirection: "row",

    alignItems: "center",
  },

  dot: {
    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor:
      COLORS.primary,

    marginRight: 8,
  },

  title: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: "700",
  },

  toggleContainer: {
    flexDirection: "row",
  },

  toggleButton: {
    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 12,

    marginLeft: 5,

    borderWidth: 1,

    borderColor:
      "rgba(139,92,246,0.15)",
  },

  activeButton: {
    backgroundColor:
      "rgba(139,92,246,0.2)",

    borderColor:
      "rgba(139,92,246,0.4)",
  },

  toggleText: {
    color: COLORS.textMuted,

    fontSize: 10,

    fontWeight: "700",
  },

  activeText: {
    color: COLORS.textSecondary,
  },

  chart: {
    borderRadius: 20,

    alignSelf: "center",
  },

  legend: {
    flexDirection: "row",

    marginTop: 10,
  },

  legendItem: {
    flexDirection: "row",

    alignItems: "center",
  },

  legendDot: {
    width: 8,

    height: 8,

    borderRadius: 4,

    marginRight: 5,
  },

  legendText: {
    color: COLORS.textMuted,

    fontSize: 11,
  },
});