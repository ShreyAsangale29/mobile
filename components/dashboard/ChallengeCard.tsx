// components/dashboard/ChallengeCard.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  icon: string;
  title: string;
  progress: string;
  xp: number;
};

export default function ChallengeCard({ icon, title, progress, xp }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>

        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.progress}>{progress}</Text>
        </View>
      </View>

      <View style={styles.reward}>
        <Text style={styles.xp}>+{xp} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(26,20,51,0.6)",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 24,
    marginRight: 13,
  },

  title: {
    color: "#F8F7FF",
    fontSize: 14.5,
    fontWeight: "700",
  },

  progress: {
    color: "#6B6490",
    marginTop: 3,
    fontSize: 12,
  },

  reward: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },

  xp: {
    color: "#FCD34D",
    fontWeight: "700",
    fontSize: 12.5,
  },
});