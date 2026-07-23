// components/yoga/ChakraBalanceBar.tsx
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CHAKRA_ORDER, YogaCategory } from "../../data/yogaData";

interface Props {
  /** category ids that currently have at least 1 selected pose */
  litCategories: Set<YogaCategory["id"]>;
}

export default function ChakraBalanceBar({ litCategories }: Props) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const litCount = CHAKRA_ORDER.filter((c) => litCategories.has(c.id)).length;
  const pct = (litCount / CHAKRA_ORDER.length) * 100;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [pct, widthAnim]);

  const widthInterp = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Chakra Balance · Asanas Selected</Text>
        <Text style={styles.val}>
          {litCount} / {CHAKRA_ORDER.length}
        </Text>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, { width: widthInterp }]}>
          <LinearGradient
            colors={["#34D399", "#7D53FF", "#EC4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fillGradient}
          />
        </Animated.View>
      </View>

      <View style={styles.dotsRow}>
        {CHAKRA_ORDER.map((c) => {
          const lit = litCategories.has(c.id);
          return (
            <View key={c.id} style={styles.dotCol}>
              <View style={[styles.dot, lit && styles.dotLit]} />
              <Text style={styles.dotLabel}>{c.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    backgroundColor: "rgba(18,13,38,0.55)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B4ACD9",
  },
  val: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B59BFF",
  },
  track: {
    width: "100%",
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(139,92,246,0.12)",
    overflow: "hidden",
  },
  fillWrap: {
    height: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  fillGradient: {
    flex: 1,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  dotCol: {
    alignItems: "center",
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.3)",
  },
  dotLit: {
    borderColor: "#34D399",
    backgroundColor: "#34D399",
    shadowColor: "#34D399",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  dotLabel: {
    fontSize: 7.5,
    color: "#6B6490",
    fontWeight: "600",
  },
});
