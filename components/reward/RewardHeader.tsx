import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RewardHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={18}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <View>
        <Text style={styles.title}>
          Reward Vault
        </Text>

        <Text style={styles.subtitle}>
          Unlock rewards with XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor:
      "rgba(18,13,38,0.85)",

    borderWidth: 1,
    borderColor:
      "rgba(139,92,246,0.35)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: "#A78BFA",
    fontSize: 12,
    marginTop: 2,
  },
});