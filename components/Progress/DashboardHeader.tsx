import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/appColors";

export default function DashboardHeader() {
  return (
    <>
      <View style={styles.statusBar}>
        <Text style={styles.time}>10:26</Text>

        <View style={styles.right}>
          <Text style={styles.icon}>▲▼</Text>
          <Text style={styles.icon}>WiFi</Text>

          <View style={styles.battery}>
            <Text style={styles.batteryText}>57</Text>
          </View>
        </View>
      </View>

      <View style={styles.topPill}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>10</Text>
        </View>

        <Text style={styles.title}>
          Progress Dashboard
        </Text>

        <View style={styles.line} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 15,
  },

  time: {
    color: COLORS.text,
    fontWeight: "600",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    color: COLORS.text,
    marginLeft: 6,
    fontSize: 12,
  },

  battery: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 6,
  },

  batteryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  topPill: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 11,
  },

  title: {
    color: COLORS.text,
    marginLeft: 10,
    fontWeight: "700",
    fontSize: 14,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(139,92,246,0.3)",
    marginLeft: 10,
  },
});