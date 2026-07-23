import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function XPWalletCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Available XP
        </Text>

        <Text style={styles.star}>
          ⭐
        </Text>
      </View>

      <Text style={styles.xp}>
        850 XP
      </Text>

      <View style={styles.progressBg}>
        <View
          style={styles.progressFill}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Level 6 Athlete
        </Text>

        <Text style={styles.footerText}>
          85%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      "rgba(18,13,38,0.85)",

    borderRadius: 22,

    padding: 18,

    borderWidth: 1,

    borderColor:
      "rgba(139,92,246,0.25)",

    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  label: {
    color: "#A78BFA",
    fontSize: 12,
  },

  star: {
    fontSize: 20,
  },

  xp: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginVertical: 10,
  },

  progressBg: {
    height: 8,
    borderRadius: 20,
    backgroundColor:
      "#251B42",
    overflow: "hidden",
  },

  progressFill: {
    width: "85%",
    height: "100%",
    backgroundColor:
      "#10B981",
  },

  footer: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 8,
  },

  footerText: {
    color: "#A78BFA",
    fontSize: 11,
  },
});