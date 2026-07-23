// components/dashboard/HeroCard.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HeroCard() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning 👋" : hour < 18 ? "Good Afternoon ☀️" : "Good Evening 🌙";

  const quotes = [
    "Consistency beats motivation.",
    "Small progress is still progress.",
    "Discipline creates freedom.",
    "Your future self is watching.",
  ];
  const quote = quotes[new Date().getDate() % quotes.length];

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.card}>
      <View style={styles.frostGlow} />
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AI Coach Online</Text>
          </View>

          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>Shreya</Text>

          <Text style={styles.quote}>&quot;{quote}&quot;</Text>
        </View>

        <View style={styles.avatarContainer}>
          <Animated.View
            style={[styles.rotatingRing, { transform: [{ rotate: spin }] }]}
          />

          <LinearGradient
            colors={["#34D399", "#7D53FF", "#EC4899"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRingGradient}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={require("../../assets/images/avatar.png")}
                style={styles.avatar}
              />
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(15,20,38,0.85)",
    borderWidth: 2,
    borderColor: "rgba(52,211,153,0.35)",
    shadowColor: "#34D399",
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flex: 1,
    paddingRight: 8,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(52,211,153,0.1)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.38)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#34D399",
  },

  statusText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#34D399",
    letterSpacing: 0.5,
  },

  greeting: {
    color: "#B4ACD9",
    fontSize: 14,
  },

  name: {
    color: "#F8F7FF",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: -0.5,
  },

  quote: {
    color: "#B4ACD9",
    marginTop: 10,
    lineHeight: 19,
    fontSize: 12.5,
    fontStyle: "italic",
  },

  avatarContainer: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },

  rotatingRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderTopColor: "#34D399",
    borderRightColor: "#7D53FF",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    shadowColor: "#7D53FF",
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 12,
  },

  avatarRingGradient: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    overflow: "hidden",
    backgroundColor: "#171233",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  frostGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(52,211,153,0.08)",
  },
});