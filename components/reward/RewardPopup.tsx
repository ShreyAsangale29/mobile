import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function RewardPopup({
  visible,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.emoji}>
            🎉
          </Text>

          <Text style={styles.title}>
            Reward Unlocked
          </Text>

          <Text style={styles.reward}>
            Gold Badge
          </Text>

          <Text style={styles.subtitle}>
            +100 XP Bonus Earned
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
          >
            <Text style={styles.primaryText}>
              Equip Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
          >
            <Text style={styles.close}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    backgroundColor:
      "rgba(18,13,38,0.95)",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",

    borderWidth: 1,
    borderColor:
      "rgba(255,215,0,0.35)",
  },

  emoji: {
    fontSize: 60,
    marginBottom: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  reward: {
    color: "#FFD700",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitle: {
    color: "#B59BFF",
    marginTop: 10,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 12,
  },

  primaryText: {
    color: "#000",
    fontWeight: "800",
  },

  close: {
    color: "#A78BFA",
    fontWeight: "700",
  },
});