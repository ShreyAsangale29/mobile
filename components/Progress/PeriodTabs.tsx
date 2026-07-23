import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../constants/appColors";

const tabs = [
  "Daily",
  "Weekly",
  "Monthly",
  "All Time",
];

export default function PeriodTabs() {
  const [selected, setSelected] =
    useState("Weekly");

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => setSelected(tab)}
          style={[
            styles.tab,
            selected === tab &&
              styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.text,
              selected === tab &&
                styles.activeText,
            ]}
          >
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor:
      "rgba(18,13,38,0.7)",
    borderRadius: 20,
    padding: 5,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 15,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  text: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },

  activeText: {
    color: "#fff",
  },
});