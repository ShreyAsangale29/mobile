// components/camera-check/QuickTips.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const TIPS = [
  {
    icon: "💡",
    text: "Stand in natural light facing the camera for best results.",
    border: "rgba(16,185,129,0.22)",
    textColor: "#6EE7B7",
  },
  {
    icon: "📐",
    text: "Place device at chest height on a stable surface.",
    border: "rgba(56,189,248,0.22)",
    textColor: "#7DD3FC",
  },
  {
    icon: "👕",
    text: "Wear fitted clothes so joints are easy to detect.",
    border: "rgba(255,215,0,0.22)",
    textColor: "#FCD34D",
  },
  {
    icon: "📏",
    text: "Stand 1.52 metres back so your full body fits the frame.",
    border: "rgba(236,72,153,0.22)",
    textColor: "#F9A8D4",
  },
];

const CARD_WIDTH = 130 + 8; // width + gap

export default function QuickTips() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(Math.max(0, Math.min(idx, TIPS.length - 1)));
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        onScroll={onScroll}
        scrollEventThrottle={32}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
      >
        {TIPS.map((tip, index) => (
          <View key={index} style={[styles.card, { borderColor: tip.border }]}>
            <Text style={styles.icon}>{tip.icon}</Text>
            <Text style={[styles.text, { color: tip.textColor }]}>{tip.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {TIPS.map((_, i) => (
          <View key={i} style={[styles.pageDot, i === activeIndex && styles.pageDotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, gap: 8 },
  card: {
    width: 130,
    borderRadius: 16,
    padding: 11,
    backgroundColor: "rgba(18,13,38,0.7)",
    borderWidth: 1,
  },
  icon: { fontSize: 20, marginBottom: 5 },
  text: { fontSize: 9.5, lineHeight: 14, fontWeight: "500" },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 2,
    marginBottom: 4,
  },
  pageDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(139,92,246,0.25)",
  },
  pageDotActive: {
    backgroundColor: "#8B5CF6",
    width: 14,
  },
});
