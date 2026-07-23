// components/dashboard/ChallengeSection.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

import ChallengeCard from "./ChallengeCard";

export default function ChallengeSection() {
  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingDot} />
        <Text style={styles.heading}>Today&apos;s Challenges</Text>
      </View>

      <ChallengeCard icon="🏋️" title="30 Squats" progress="12 / 30 completed" xp={50} />
      <ChallengeCard icon="🔥" title="60s Plank" progress="25 / 60 sec" xp={40} />
      <ChallengeCard icon="💪" title="15 Pushups" progress="7 / 15 completed" xp={60} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  headingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#34D399",
  },

  heading: {
    color: "#F8F7FF",
    fontSize: 16,
    fontWeight: "800",
  },
});