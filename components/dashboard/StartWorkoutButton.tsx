// components/dashboard/StartWorkoutButton.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function StartWorkoutButton() {
  const router = useRouter();

  const handleStartWorkout = () => {
    router.push("/activity-selection");
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleStartWorkout}>
      <LinearGradient
        colors={["#34D399", "#7D53FF", "#EC4899"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.leftSection}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={20} color="#0B081A" />
          </View>

          <View>
            <Text style={styles.title}>Start Workout</Text>
            <Text style={styles.subtitle}>AI Powered Fitness Coach</Text>
          </View>
        </View>

        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#34D399",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11.5,
    marginTop: 2,
  },

  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});