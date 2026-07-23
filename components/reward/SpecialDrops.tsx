import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function SpecialDrops() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        ✨ Special Drops
      </Text>

      <View style={styles.drop}>
        <Text style={styles.dropIcon}>
          🏅
        </Text>

        <View>
          <Text style={styles.dropTitle}>
            Champion Badge
          </Text>

          <Text style={styles.dropSub}>
            Available for 2 days
          </Text>
        </View>
      </View>

      <View style={styles.drop}>
        <Text style={styles.dropIcon}>
          ⚡
        </Text>

        <View>
          <Text style={styles.dropTitle}>
            XP Booster
          </Text>

          <Text style={styles.dropSub}>
            Limited Edition
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(18,13,38,0.85)",
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 14,
  },

  drop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  dropIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  dropTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  dropSub: {
    color: "#B59BFF",
    fontSize: 12,
  },
});