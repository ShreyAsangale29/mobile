import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  active: boolean;
  onPress: () => void;
  // new optional props — screen passes these, chip uses them when present
  count?: number;
  color?: string;
  icon?: string;
};

export default function FilterChip({
  title,
  active,
  onPress,
  count,
  color = "#8B5CF6",
  icon,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        active && {
          backgroundColor: color + "28", // 16% opacity tint
          borderColor: color,
        },
      ]}
    >
      {/* optional icon */}
      {icon ? (
        <Ionicons
          // @ts-ignore — Ionicons types are wide
          name={icon}
          size={13}
          color={active ? color : "#8A84AD"}
          style={{ marginRight: 4 }}
        />
      ) : null}

      {/* label */}
      <Text style={[styles.text, active && { color }]}>{title}</Text>

      {/* count badge — shown only when prop is provided */}
      {count !== undefined && (
        <View
          style={[
            styles.countBadge,
            { backgroundColor: active ? color + "30" : "rgba(255,255,255,0.07)" },
          ]}
        >
          <Text style={[styles.countText, active && { color }]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(26,20,51,0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.22)",
  },
  text: {
    color: "#8A84AD",
    fontSize: 12,
    fontWeight: "700",
  },
  countBadge: {
    marginLeft: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  countText: {
    color: "#6B6490",
    fontSize: 10,
    fontWeight: "800",
  },
});
