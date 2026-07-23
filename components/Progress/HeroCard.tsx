import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../constants/appColors";

interface Props {
  icon: any;
  value: string;
  label: string;
  change: string;
  color: string;
}

export default function HeroCard({
  icon,
  value,
  label,
  change,
  color,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        {
          borderLeftWidth: 4,
          borderLeftColor: color,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={color}
      />

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text
        style={[
          styles.change,
          { color },
        ]}
      >
        {change}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    backgroundColor:
      "rgba(18,13,38,0.72)",

    borderRadius: 20,

    padding: 15,

    margin: 5,

    borderWidth: 1,

    borderColor:
      "rgba(139,92,246,0.15)",
  },

  value: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },

  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  change: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
  },
});