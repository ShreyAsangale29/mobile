import React from "react";
// eslint-disable-next-line import/no-duplicates
import { Stack } from "expo-router";
// eslint-disable-next-line import/no-duplicates
import { router } from "expo-router";
import { TouchableOpacity , ScrollView,
  View,
  StyleSheet,
  Text,
} from "react-native";



import DashboardHeader from "../components/Progress/DashboardHeader";
import PeriodTabs from "../components/Progress/PeriodTabs";
import HeroCard from "../components/Progress/HeroCard";
import WorkoutChart from "../components/Progress/WorkoutChart";
import PostureCard from "../components/Progress/PostureCard";
import XPCard from "../components/Progress/XPCard";

import { COLORS } from "../constants/appColors";
import { heroStats } from "../constants/dashboardData";

export default function ProgressDashboard() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader />

      <PeriodTabs />

      <View style={styles.weekRow}>
        <View style={styles.leftRow}>
          <View style={styles.dot} />
          <Text style={styles.weekTitle}>
            This Week
          </Text>
        </View>

        <Text style={styles.date}>
          Jun 9 – Jun 15
        </Text>
      </View>

      <View style={styles.heroGrid}>
        {heroStats.map((item) => (
          <HeroCard
            key={item.id}
            icon={item.icon}
            value={item.value}
            label={item.label}
            change={item.change}
            color={item.color}
          />
        ))}
      </View>

      <WorkoutChart />

      <View style={styles.midRow}>
        <PostureCard />
        <XPCard />
      </View>
      <TouchableOpacity
      style={styles.nextButton}
      onPress={() =>
        router.push("/journey")
      }
    >
      <Text style={styles.nextText}>
        Next →
      </Text>
    </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },

  weekTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  date: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginBottom: 10,
  },

  midRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});