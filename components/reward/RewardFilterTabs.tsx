import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const tabs = [
  "All",
  "Badges",
  "Skins",
  "Boosts",
  "Titles",
];

export default function RewardFilterTabs() {
  const [active, setActive] =
    useState("All");

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() =>
            setActive(tab)
          }
          style={[
            styles.tab,
            active === tab &&
              styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.text,
              active === tab &&
                styles.activeText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,

    borderRadius: 16,

    backgroundColor:
      "rgba(18,13,38,0.85)",

    marginRight: 8,
    marginBottom: 8,
  },

  activeTab: {
    backgroundColor:
      "#8B5CF6",
  },

  text: {
    color: "#A78BFA",
    fontWeight: "600",
    fontSize: 12,
  },

  activeText: {
    color: "#FFFFFF",
  },
});