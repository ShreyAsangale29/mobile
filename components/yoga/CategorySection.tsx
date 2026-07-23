// components/yoga/CategorySection.tsx
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import Svg, { Path } from "react-native-svg";
import AsanaCard from "./AsanaCard";
import { YogaCategory } from "../../data/yogaData";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !(global as any).nativeFabricUIManager
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  category: YogaCategory;
  selectedAsanas: string[];
  onToggleAsana: (id: string) => void;
}

export default function CategorySection({ category, selectedAsanas, onToggleAsana }: Props) {
  const [open, setOpen] = useState(true);
  const rotate = useRef(new Animated.Value(1)).current;

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotate, {
      toValue: open ? 0 : 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setOpen((prev) => !prev);
  };

  const chevronRotate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "0deg"],
  });

  const iconBg = category.accent + "1F"; // ~12% alpha hex suffix
  const iconBorder = category.accent + "4D"; // ~30% alpha hex suffix

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.header} onPress={toggleOpen} activeOpacity={0.75}>
        <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: iconBorder }]}>
          <Text style={styles.iconEmoji}>{category.emoji}</Text>
        </View>
        <Text style={styles.name}>{category.label}</Text>
        <Text style={styles.count}>{category.poses.length} poses</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Svg width={10} height={6} viewBox="0 0 10 6" fill="none">
            <Path d="M1 1L5 5L9 1" stroke="#6B6490" strokeWidth={1.5} strokeLinecap="round" />
          </Svg>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {open && (
        <View style={styles.list}>
          {category.poses.map((pose) => (
            <AsanaCard
              key={pose.id}
              pose={pose}
              accent={category.accent}
              selected={selectedAsanas.includes(pose.id)}
              onToggle={onToggleAsana}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 9,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconEmoji: {
    fontSize: 14,
  },
  name: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F8F7FF",
    flex: 1,
    letterSpacing: 0.1,
  },
  count: {
    fontSize: 10,
    color: "#6B6490",
    fontWeight: "500",
    marginRight: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(139,92,246,0.12)",
    marginBottom: 9,
  },
  list: {
    gap: 8,
  },
});
