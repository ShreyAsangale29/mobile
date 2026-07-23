import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function FinishButton() {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/")}
      style={styles.shadow}
    >
      <LinearGradient
        colors={[
          "#7D53FF",
          "#8B5CF6",
          "#B59BFF",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.text}>
          Finish Session
        </Text>

        <View style={styles.iconCircle}>
          <Ionicons
            name="arrow-forward"
            size={16}
            color="#FFF"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginTop: 18,
    marginBottom: 20,

    shadowColor: "#8B5CF6",
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 12,
  },

  button: {
    height: 62,
    borderRadius: 20,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },

  iconCircle: {
    position: "absolute",
    right: 18,

    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",
  },
});