import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Props {
  onSwitchCamera: () => void;
}

export default function WorkoutHeader({
  onSwitchCamera,
}: Props) {
  const router = useRouter();

  return (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            router.replace("/CameraCheckScreen")
          }
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <BlurView
          intensity={30}
          style={styles.liveBadge}
        >
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            LIVE SESSION
          </Text>
        </BlurView>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onSwitchCamera}
        >
          <Ionicons
            name="camera-reverse-outline"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseCount}>
          EXERCISE 1 OF 3
        </Text>

        <Text style={styles.exerciseTitle}>
          Wide Push-Ups
        </Text>

        <Text style={styles.goalText}>
          Goal: 12 reps
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.35)",

    justifyContent: "center",
    alignItems: "center",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 20,
    overflow: "hidden",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,

    backgroundColor: "#FF3B30",
    marginRight: 8,
  },

  liveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  exerciseInfo: {
    position: "absolute",
    top: 130,
    left: 24,
    zIndex: 20,
  },

  exerciseCount: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "600",
  },

  exerciseTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },

  goalText: {
    color: "#D1D5DB",
    fontSize: 16,
    marginTop: 4,
  },
});