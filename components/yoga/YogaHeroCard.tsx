// components/yoga/YogaHeroCard.tsx
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";

export default function YogaHeroCard() {
  const shineX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shineX, {
        toValue: 1,
        duration: 5000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shineX]);

  const translateX = shineX.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 420],
  });

  return (
    <View style={styles.card}>
      {/* animated shine sweep */}
      <Animated.View
        style={[styles.shine, { transform: [{ translateX }] }]}
        pointerEvents="none"
      />

      {/* top row: badge + orbiting icon */}
      <View style={styles.topRow}>
        <View style={styles.labels}>
          <View style={styles.mindfulBadge}>
            <View style={styles.mdot} />
            <Text style={styles.mindfulText}>🧘 Mindful Practice</Text>
          </View>
          <Text style={styles.forYou}>Tailored to your breath · Personalised Flow</Text>
        </View>

        <View style={styles.heroIcon}>
          <Svg width={26} height={26} viewBox="0 0 26 26">
            <Defs>
              <RadialGradient id="heroGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#34D399" />
                <Stop offset="100%" stopColor="#7D53FF" />
              </RadialGradient>
            </Defs>
            <Circle cx={13} cy={13} r={9} stroke="url(#heroGrad)" strokeWidth={1.8} fill="none" />
            <Circle cx={13} cy={13} r={4} fill="url(#heroGrad)" opacity={0.7} />
            <Circle cx={13} cy={13} r={1.5} fill="#fff" opacity={0.9} />
          </Svg>
        </View>
      </View>

      {/* body: lotus figure + copy */}
      <View style={styles.body}>
        <Svg width={78} height={78} viewBox="0 0 78 78">
          <Defs>
            <RadialGradient id="lotusGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
              <Stop offset="100%" stopColor="#34D399" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={39} cy={72} r={22} fill="url(#lotusGlow)" />
          <Circle cx={39} cy={14} r={6.5} stroke="#34D399" strokeWidth={1.6} fill="none" />
          <Line x1={39} y1={21} x2={39} y2={44} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={39} y1={30} x2={24} y2={42} stroke="#5EEAD4" strokeWidth={1.6} strokeLinecap="round" />
          <Circle cx={22} cy={43} r={2.5} stroke="#34D399" strokeWidth={1.2} fill="none" />
          <Line x1={39} y1={30} x2={54} y2={42} stroke="#5EEAD4" strokeWidth={1.6} strokeLinecap="round" />
          <Circle cx={56} cy={43} r={2.5} stroke="#34D399" strokeWidth={1.2} fill="none" />
          <Line x1={39} y1={44} x2={24} y2={56} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={24} y1={56} x2={14} y2={58} stroke="#059669" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={39} y1={44} x2={54} y2={56} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={54} y1={56} x2={64} y2={58} stroke="#059669" strokeWidth={1.4} strokeLinecap="round" />
          <Circle cx={39} cy={14} r={11} stroke="#34D399" strokeWidth={0.6} strokeDasharray="3 4" opacity={0.35} fill="none" />
          <Circle cx={39} cy={14} r={16} stroke="#7D53FF" strokeWidth={0.5} strokeDasharray="2 5" opacity={0.2} fill="none" />
          <Circle cx={39} cy={32} r={1.5} fill="#34D399" opacity={0.8} />
          <Circle cx={39} cy={26} r={1} fill="#5EEAD4" opacity={0.6} />
          <Circle cx={39} cy={8} r={1.2} fill="#FFD700" opacity={0.55} />
        </Svg>

        <View style={styles.info}>
          <Text style={styles.title}>AI Yoga{"\n"}Flow</Text>
          <Text style={styles.subtitle}>
            Full-body sequence crafted for your body, breath &amp; intention.
          </Text>
          <View style={styles.pillsRow}>
            <View style={[styles.pill, styles.pillGreen]}>
              <Text style={[styles.pillText, { color: "#34D399" }]}>🌿 All levels</Text>
            </View>
            <View style={[styles.pill, styles.pillPurple]}>
              <Text style={[styles.pillText, { color: "#B59BFF" }]}>⏱ ~30 min</Text>
            </View>
            <View style={[styles.pill, styles.pillTeal]}>
              <Text style={[styles.pillText, { color: "#5EEAD4" }]}>✦ AI-curated</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(52,211,153,0.4)",
    backgroundColor: "rgba(15,20,38,0.9)",
  },
  shine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 140,
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  labels: {
    gap: 4,
    flex: 1,
  },
  mindfulBadge: {
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
  },
  mdot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#34D399",
  },
  mindfulText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#34D399",
    letterSpacing: 0.5,
  },
  forYou: {
    fontSize: 11,
    color: "#B4ACD9",
    fontWeight: "500",
    paddingLeft: 2,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(80,130,110,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(52,211,153,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 21,
    color: "#F8F7FF",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10.5,
    color: "#B4ACD9",
    lineHeight: 14,
    marginBottom: 9,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  pillGreen: {
    backgroundColor: "rgba(52,211,153,0.14)",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.38)",
  },
  pillPurple: {
    backgroundColor: "rgba(125,83,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(125,83,255,0.38)",
  },
  pillTeal: {
    backgroundColor: "rgba(45,212,191,0.12)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.32)",
  },
  pillText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
