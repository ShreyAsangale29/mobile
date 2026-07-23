import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

type Props = {
  selectedCount: number;
  totalCalories: number;
};

export default function SelectionSummary({
  selectedCount,
  totalCalories,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>
        🏋️
      </Text>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {selectedCount === 0
            ? "Pick at least 1 exercise"
            : `${selectedCount} exercise${
                selectedCount > 1 ? "s" : ""
              } selected`}
        </Text>

        <Text style={styles.subtitle}>
          Build your personalized plan
        </Text>
      </View>

      <Text style={styles.calories}>
        {totalCalories} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      "rgba(26,20,51,0.7)",

    borderRadius: 18,

    borderWidth: 1,

    borderColor:
      "rgba(139,92,246,0.25)",

    padding: 16,

    marginBottom: 20,
  },

  icon: {
    fontSize: 22,

    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    color: "#FFF",

    fontSize: 14,

    fontWeight: "700",
  },

  subtitle: {
    color: "#B4ACD9",

    fontSize: 12,

    marginTop: 4,
  },

  calories: {
    color: "#F97316",

    fontWeight: "800",

    fontSize: 18,
  },
});