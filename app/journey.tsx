import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import Svg, { Line, Defs, LinearGradient, Stop } from "react-native-svg";
import JourneyBackground from "../components/backgrounds/JourneyBackground";
import { Stack , router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");

const stages = [
  {
    id: 1,
    name: "Beginner Forest",
    sub: "Your Journey Begins",
    icon: "🌲",
    status: "done",
    xp: "+50 XP",
  },
  {
    id: 2,
    name: "Strength Valley",
    sub: "Build Power",
    icon: "⚡",
    status: "active",
    xp: "+120 XP",
  },
  {
    id: 3,
    name: "Yoga Temple",
    sub: "Find Balance",
    icon: "🛕",
    status: "locked",
    xp: "",
  },
  {
    id: 4,
    name: "Posture Peak",
    sub: "Advanced Skills",
    icon: "🦋",
    status: "locked",
    xp: "",
  },
  {
    id: 5,
    name: "Master Summit",
    sub: "Elite Level",
    icon: "👑",
    status: "locked",
    xp: "",
  },
];

export default function JourneyScreen() {
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [, setSelected] = useState<number | null>(2);

  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: 0.85,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [xpAnim]);

  const xpWidth = xpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
        <JourneyBackground />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/ProgressDashboardScreen")}
        >
        
        <Ionicons
            name="arrow-back"
            size={18}
            color="#FFFFFF"
        />
        </TouchableOpacity>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Fitness Journey</Text>
        </View>

        {/* XP CARD */}
        <View style={styles.xpCard}>
          <Text style={styles.level}>Lv. 6</Text>

          <View style={{ flex: 1 }}>
            <View style={styles.xpTop}>
              <Text style={styles.xpText}>850 / 1000 XP</Text>
            </View>

            <View style={styles.xpBarBg}>
              <Animated.View style={[styles.xpBarFill, { width: xpWidth }]} />
            </View>
          </View>

          <Text style={{ fontSize: 18 }}>⭐</Text>
        </View>

        {/* JOURNEY MAP */}
        <View style={styles.map}>

          {/* PATH */}
          <Svg height="600" width={width} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFD700" />
                <Stop offset="50%" stopColor="#10B981" />
                <Stop offset="100%" stopColor="#8B5CF6" />
              </LinearGradient>
            </Defs>

            <Line
              x1={width / 2}
              y1="0"
              x2={width / 2}
              y2="600"
              stroke="url(#grad)"
              strokeWidth="4"
              strokeDasharray="8 6"
              opacity={0.8}
            />
          </Svg>

          {/* STAGES */}
          {stages.map((stage, index) => {
            const isLeft = index % 2 === 0;
            const top = index * 120;

            return (
              <View key={stage.id} style={[styles.stageRow, { top }]}>
                {/* CARD */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelected(stage.id)}
                  style={[
                    styles.card,
                    isLeft ? { left: 10 } : { right: 10 },
                    stage.status === "locked" && styles.locked,
                    stage.status === "active" && styles.active,
                  ]}
                >
                  <Text style={styles.icon}>{stage.icon}</Text>
                  <Text style={styles.name}>{stage.name}</Text>
                  <Text style={styles.sub}>{stage.sub}</Text>

                  {stage.xp !== "" && (
                    <Text style={styles.xp}>{stage.xp}</Text>
                  )}
                </TouchableOpacity>

                {/* NODE */}
                <View
                  style={[
                    styles.node,
                    stage.status === "done" && styles.doneNode,
                    stage.status === "active" && styles.activeNode,
                    stage.status === "locked" && styles.lockedNode,
                  ]}
                >
                  <Text>
                    {stage.status === "locked" ? "🔒" : stage.icon}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        
        {/* CTA */}
        <TouchableOpacity
        style={styles.cta}
        onPress={() => router.push("/reward-center")}
        >
        <Text style={styles.ctaText}>
            🎁 Open Reward Vault
        </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B081A",
  },

  header: {
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },

  xpCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    padding: 14,
    backgroundColor: "#120D26",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },

  level: {
    color: "#fff",
    fontWeight: "800",
    marginRight: 10,
  },

  xpTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  xpText: {
    color: "#BBA8FF",
    fontSize: 12,
  },

  xpBarBg: {
    height: 6,
    backgroundColor: "#2A1F4A",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 5,
  },

  xpBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },

  map: {
    height: 650,
    marginTop: 10,
  },

  stageRow: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: 150,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(26,19,51,0.82)",
    position: "absolute",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
    width: 0,
    height: 4,
    },
    elevation: 8,
    },

  active: {
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: {
        width: 0,
        height: 0,
    },
    elevation: 10,
},

  locked: {
    opacity: 0.4,
  },

  icon: {
    fontSize: 18,
    marginBottom: 5,
  },

  name: {
    color: "#fff",
    fontWeight: "700",
  },

  sub: {
    fontSize: 10,
    color: "#999",
  },

  xp: {
    fontSize: 10,
    color: "#10B981",
    marginTop: 5,
  },

  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2A1F4A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  activeNode: {
    backgroundColor: "#10B981",
  },

  doneNode: {
    backgroundColor: "#FFD700",
  },

  lockedNode: {
    backgroundColor: "#444",
  },

  cta: {
    margin: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
  },

  ctaText: {
    color: "#fff",
    fontWeight: "800",
  },
  backButton: {
  width: 40,
  height: 40,

  borderRadius: 20,

  backgroundColor: "rgba(18,13,38,0.85)",

  borderWidth: 1,
  borderColor: "rgba(139,92,246,0.35)",

  alignItems: "center",
  justifyContent: "center",

  marginTop: 16,
  marginLeft: 16,

  shadowColor: "#8B5CF6",
  shadowOpacity: 0.3,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 2,
  },

  elevation: 6,
},
});