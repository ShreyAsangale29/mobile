import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";

export default function WorkoutStats() {
  return (
    <>
      <View style={styles.leftColumn}>
        <BlurView intensity={40} style={styles.card}>
          <Text style={styles.label}>KCAL</Text>
          <Text style={styles.value}>284</Text>
        </BlurView>

        <BlurView intensity={40} style={styles.card}>
          <Text style={styles.label}>FORM</Text>
          <Text style={styles.value}>94%</Text>
        </BlurView>
      </View>

      <View style={styles.rightColumn}>
        <BlurView intensity={40} style={styles.card}>
          <Text style={styles.label}>BPM</Text>
          <Text style={styles.value}>136</Text>
        </BlurView>

        <BlurView intensity={40} style={styles.card}>
          <Text style={styles.label}>STAGE</Text>
          <Text style={styles.value}>1/3</Text>
        </BlurView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  leftColumn: {
    position: "absolute",
    left: 15,
    top: 240,
    gap: 12,
  },

  rightColumn: {
    position: "absolute",
    right: 15,
    top: 240,
    gap: 12,
  },

  card: {
    width: 90,
    padding: 12,
    borderRadius: 18,
    overflow: "hidden",
  },

  label: {
    color: "#A1A1AA",
    fontSize: 11,
  },

  value: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 22,
    marginTop: 4,
  },
});