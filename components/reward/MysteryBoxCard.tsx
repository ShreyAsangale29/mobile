import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function MysteryBoxCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>🎁</Text>

      <Text style={styles.title}>
        Weekly Mystery Box
      </Text>

      <Text style={styles.subtitle}>
        Open for a random reward
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Open Box
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(18,13,38,0.85)",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
  },

  icon: {
    fontSize: 48,
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  subtitle: {
    color: "#B59BFF",
    marginTop: 5,
    marginBottom: 15,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },

  buttonText: {
    fontWeight: "800",
    color: "#000",
  },
});