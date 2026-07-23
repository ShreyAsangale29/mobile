import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  title: string;
  subtitle: string;
  tag: string;
  icon: any;
  accent: string;
  selected: boolean;
  onPress: () => void;
}

export default function ActivityCard({
  title,
  subtitle,
  tag,
  icon,
  accent,
  selected,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && {
          borderColor: accent,
          borderWidth: 2,
        },
      ]}
      onPress={onPress}
    >
      {/* Check Circle */}
      <View
        style={[
          styles.checkCircle,
          selected && {
            backgroundColor: accent,
            borderColor: accent,
          },
        ]}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={16}
            color="#FFF"
          />
        )}
      </View>

      {/* Icon */}
      <View
        style={[
          styles.iconBox,
          { backgroundColor: `${accent}25` },
        ]}
      >
        <Ionicons
          name={icon}
          size={32}
          color={accent}
        />
      </View>

      {/* Tag */}
      <View
        style={[
          styles.tag,
          { borderColor: `${accent}50` },
        ]}
      >
        <Text
          style={[
            styles.tagText,
            { color: accent },
          ]}
        >
          {tag}
        </Text>
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#171329",
    borderRadius: 24,
    padding: 20,
    width: "48%",
    minHeight: 220,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  checkCircle: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  tag: {
    marginTop: 16,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 14,
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 20,
  },
});