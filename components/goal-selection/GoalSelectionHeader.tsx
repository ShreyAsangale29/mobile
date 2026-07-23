import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function GoalSelectionHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color="#FFF"
          />
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            STEP 1 OF 5
          </Text>
        </View>
      </View>

      <Text style={styles.title}>
        What&apos;s Your Primary Goal?
      </Text>

      <Text style={styles.subtitle}>
        Help us personalize your fitness
        journey with AI-powered coaching.
      </Text>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <Text style={styles.progressText}>
        20% Complete
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  title: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 20,
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#1F2937",
    borderRadius: 999,
    marginTop: 20,
  },

  progressFill: {
    width: "20%",
    height: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 999,
  },

  progressText: {
    color: "#A855F7",
    marginTop: 8,
    fontWeight: "600",
  },
});