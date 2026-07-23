import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";

type Props = {
  title: string;
  icon: string;
  rarity: string;
  unlocked: boolean;
  color: string;
  onPress?: () => void;
};

export default function RewardCard({
  title,
  icon,
  rarity,
  unlocked,
  color,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
            styles.card,
            !unlocked && styles.locked,
        ]}
        >
      <Text style={styles.icon}>
        {unlocked ? icon : "🔒"}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      <View
        style={[
          styles.badge,
          { backgroundColor: color },
        ]}
      >
        <Text style={styles.badgeText}>
          {rarity}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",

    backgroundColor:
      "rgba(18,13,38,0.85)",

    borderRadius: 20,

    padding: 16,

    alignItems: "center",

    borderWidth: 1,

    borderColor:
      "rgba(139,92,246,0.25)",

    marginBottom: 12,
  },

  locked: {
    opacity: 0.45,
  },

  icon: {
    fontSize: 34,
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 10,
  },
});