import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {Stack, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
export default function AchievementScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#060412", "#0A071A", "#13102A"]}
        style={StyleSheet.absoluteFill}
      />

      <ConfettiCannon
        count={120}
        origin={{ x: 180, y: 0 }}
        fadeOut
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Popup Card */}

        <View style={styles.popup}>
          <Text style={styles.achievementLabel}>
            ACHIEVEMENT UNLOCKED
          </Text>

          {/* Trophy Section */}

          <View style={styles.trophyOuter}>
            <View style={styles.trophyRing} />
            <View style={styles.trophyRingLarge} />

            <View style={styles.trophyCircle}>
              <Text style={styles.trophy}>🏆</Text>
            </View>
          </View>

          <Text style={styles.achievementType}>
            First Perfect Set
          </Text>

          <Text style={styles.title}>
            Amazing!
          </Text>

          <Text style={styles.subtitle}>
            You nailed it — flawless form on all 25 reps.
            {"\n"}
            Your AI coach is impressed!
          </Text>

          {/* XP */}

          <View style={styles.xpPill}>
            <Text style={styles.xpStar}>⭐</Text>

            <Text style={styles.xpValue}>
              +50 XP
            </Text>
          </View>

          {/* Stats */}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.green}>
                25/25
              </Text>
              <Text style={styles.statLabel}>
                REPS
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.orange}>
                98%
              </Text>
              <Text style={styles.statLabel}>
                POSTURE
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={styles.purple}>
                3 Sets
              </Text>
              <Text style={styles.statLabel}>
                COMPLETED
              </Text>
            </View>
          </View>

          {/* Buttons */}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons
                name="share-social-outline"
                size={18}
                color="#FFD700"
              />
              <Text style={styles.shareText}>
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => router.push("/session-summary")}
            >
              <Text style={styles.continueText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          {/* Badges */}

          <Text style={styles.badgeTitle}>
            YOUR BADGES
          </Text>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text>🔥</Text>
            </View>

            <View style={styles.badge}>
              <Text>⚡</Text>
            </View>

            <View style={styles.badgeActive}>
              <Text>🏆</Text>
            </View>

            <View style={styles.badgeLocked}>
              <Text>💎</Text>
            </View>

            <View style={styles.badgeLocked}>
              <Text>🌟</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060412",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  popup: {
    borderRadius: 30,
    overflow: "hidden",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    backgroundColor: "rgba(18,12,35,0.85)",
  },

  achievementLabel: {
    textAlign: "center",
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 25,
  },

  trophyOuter: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  trophyRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },

  trophyRingLarge: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
  },

  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,215,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  trophy: {
    fontSize: 54,
  },

  achievementType: {
    textAlign: "center",
    color: "#FFD700",
    marginTop: 10,
  },

  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#B4ACD9",
    lineHeight: 22,
    marginTop: 10,
  },

  xpPill: {
    alignSelf: "center",
    flexDirection: "row",
    marginTop: 25,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 50,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },

  xpStar: { fontSize: 18 },

  xpValue: {
    color: "#FFD700",
    fontWeight: "800",
    marginLeft: 8,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 25,
    borderRadius: 18,
    backgroundColor: "#171029",
    paddingVertical: 15,
  },

  statItem: { flex: 1, alignItems: "center" },

  divider: {
    width: 1,
    backgroundColor: "rgba(139,92,246,0.3)",
  },

  green: { color: "#34D399", fontWeight: "700" },
  orange: { color: "#FB923C", fontWeight: "700" },
  purple: { color: "#B59BFF", fontWeight: "700" },

  statLabel: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 25,
    gap: 10,
  },

  shareBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 16,
    padding: 14,
  },

  shareText: {
    color: "#FFD700",
    marginLeft: 6,
    fontWeight: "700",
  },

  continueBtn: {
    flex: 1,
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  continueText: {
    color: "#FFF",
    fontWeight: "700",
  },

  badgeTitle: {
    textAlign: "center",
    marginTop: 25,
    color: "#888",
    fontSize: 11,
  },

  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },

  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#171029",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeActive: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeLocked: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#171029",
    opacity: 0.35,
    justifyContent: "center",
    alignItems: "center",
  },
});